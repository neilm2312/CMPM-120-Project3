

// player physics for every level. A level can change its own run/jump speed with the
// walking_speed / jumping_speed properties on its Tiled player object.
var GRAVITY = 1000;
var RUN_SPEED = 150;
var JUMP_SPEED = 420;

class Level {
  create(mapKey) {
    var game = this.game;
    this.coins = 0;
    this.finished = false;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = GRAVITY;
    game.stage.backgroundColor = this.skyColor || '#dff5f3';

    // map and layers
    this.map = game.add.tilemap(mapKey);
    this.map.tilesets.forEach(function (ts) { this.map.addTilesetImage(ts.name, ts.name); }, this);
    this.addLayer('background');
    this.solid = this.addLayer('collision');
    this.solid.resizeWorld();
    this.platforms = this.addLayer('platforms');
    this.hazards = this.addLayer('hazards');
    if (this.platforms) {
      // one-way: only the top of each platform tile is solid
      this.map.forEach(function (tile) {
        if (tile.index > -1) { tile.setCollision(false, false, true, false); }
      }, this, 0, 0, this.map.width, this.map.height, 'platforms');
    }

    // objects
    this.enemies = game.add.group();
    this.coinGroup = game.add.group();
    this.others = game.add.group();
    this.map.objects['objects'].forEach(this.createObject, this);
    this.player.bringToTop();

    // camera follows smoothly, with a deadzone so small moves don't scroll the screen
    game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER, 0.15, 0.15);

    // particles
    this.dust = this.makeEmitter(0xc8b8a0);    // running and landing
    this.puff = this.makeEmitter(0xffffff);    // jumping
    this.sparkle = this.makeEmitter(0xffd166); // coins and stomps

    // sounds
    this.sfx = {
      jump: game.add.audio('jump', 0.6), land: game.add.audio('land', 0.7), coin: game.add.audio('coin', 0.6),
      stomp: game.add.audio('stomp', 0.7), hurt: game.add.audio('hurt', 0.7), win: game.add.audio('win', 0.7)
    };

    this.cursors = game.input.keyboard.createCursorKeys();
    this.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.esc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

    this.hud = game.add.text(4, 2, '', { font: '10px Arial', fill: '#1b1b1b' });
    this.hud.fixedToCamera = true;
    this.updateHud();
  }

  // creates a tile layer if the map has it; collision is turned on for every tile in it
  addLayer(name) {
    if (this.map.getLayerIndex(name) === null) { return null; }
    var layer = this.map.createLayer(name);
    if (name !== 'background') { this.map.setCollisionByExclusion([], true, name); }
    return layer;
  }

  createObject(obj) {
    // custom properties from Tiled (Phaser may give them as a list or already as an object)
    var props = obj.properties || {};
    if (Array.isArray(props)) {
      var list = props;
      props = {};
      list.forEach(function (p) { props[p.name] = p.value; });
    }

    // find which tile sheet the object's tile comes from
    var ts = this.map.tilesets.filter(function (t) { return obj.gid >= t.firstgid; }).pop();
    // Tiled positions tile objects by their bottom-left corner; Phaser uses the center
    var sprite = this.game.add.sprite(obj.x + obj.width / 2, obj.y - obj.height / 2, ts.name, obj.gid - ts.firstgid);
    sprite.anchor.setTo(0.5);
    sprite.name = obj.name;
    this.game.physics.arcade.enable(sprite);
    sprite.body.collideWorldBounds = true;

    if (obj.name === 'player') {
      this.player = sprite;
      sprite.body.setSize(14, 18, 5, 6);   // the art has empty space around it
      sprite.runSpeed = props.walking_speed || RUN_SPEED;
      sprite.jumpSpeed = props.jumping_speed || JUMP_SPEED;
    } else if (obj.name === 'enemy') {
      sprite.speed = props.walking_speed || 40;
      sprite.distance = props.walking_distance || 50;
      sprite.startX = sprite.x;
      sprite.body.velocity.x = (props.direction || 1) * sprite.speed;
      sprite.body.allowGravity = !props.flying;
      this.enemies.add(sprite);
    } else {
      // coins, the goal and anything else stay where they were placed
      sprite.body.allowGravity = false;
      sprite.body.immovable = true;
      if (obj.name === 'coin') {
        sprite.points = props.points || 1;
        this.coinGroup.add(sprite);
      } else if (obj.name === 'goal') {
        this.goal = sprite;
      } else {
        this.others.add(sprite);
      }
    }
  }

  // every object with this name from Tiled (for level-specific objects)
  objectsNamed(name) {
    return this.others.children.filter(function (s) { return s.name === name; });
  }

  update() {
    var arcade = this.game.physics.arcade;
    if (this.esc.justDown) { this.game.state.start('Menu'); return; }
    if (this.finished) { return; }

    arcade.collide(this.player, this.solid);
    arcade.collide(this.enemies, this.solid);
    if (this.platforms) {
      arcade.collide(this.player, this.platforms);
      arcade.collide(this.enemies, this.platforms);
    }
    if (this.hazards) { arcade.collide(this.player, this.hazards, this.die, null, this); }
    arcade.overlap(this.player, this.enemies, this.hitEnemy, null, this);
    arcade.overlap(this.player, this.coinGroup, this.collectCoin, null, this);
    arcade.overlap(this.player, this.goal, this.win, null, this);

    this.movePlayer();
    this.moveEnemies();
    if (this.player.bottom >= this.game.world.height) { this.die(); }
  }

  movePlayer() {
    var p = this.player;
    var onGround = p.body.blocked.down || p.body.touching.down;
    var jumpKey = this.cursors.up.isDown || this.space.isDown;

    // run (same as the template)
    p.body.velocity.x = 0;
    if (this.cursors.left.isDown) {
      p.body.velocity.x = -p.runSpeed;
      p.scale.x = 1;   // Kenney characters face left
    } else if (this.cursors.right.isDown) {
      p.body.velocity.x = p.runSpeed;
      p.scale.x = -1;
    }

    // jump; letting go of the key early cuts the jump short
    if (jumpKey && onGround) {
      p.body.velocity.y = -p.jumpSpeed;
      p.jumping = true;
      this.sfx.jump.play();
      this.burst(this.puff, p.x, p.bottom, 8);
    }
    if (p.jumping && !jumpKey && p.body.velocity.y < 0) {
      p.body.velocity.y *= 0.5;
      p.jumping = false;
    }
    if (p.body.velocity.y >= 0) { p.jumping = false; }

    // landing and running dust
    if (onGround && !p.wasOnGround && p.lastFallSpeed > 200) {
      this.sfx.land.play();
      this.burst(this.dust, p.x, p.bottom, 10);
    }
    if (onGround && Math.abs(p.body.velocity.x) > 60 && Math.random() < 0.25) {
      this.burst(this.dust, p.x, p.bottom, 1);
    }
    p.wasOnGround = onGround;
    p.lastFallSpeed = p.body.velocity.y;
  }

  moveEnemies() {
    this.enemies.forEachAlive(function (e) {
      // turn around after walking far enough or bumping into a wall
      var hitWall = e.body.blocked.left || e.body.blocked.right;
      if (hitWall || Math.abs(e.x - e.startX) >= e.distance) {
        var dir = hitWall ? (e.body.blocked.left ? 1 : -1) : -Math.sign(e.body.velocity.x);
        e.body.velocity.x = dir * e.speed;
        e.startX = e.x;
      }
      e.scale.x = e.body.velocity.x > 0 ? -1 : 1;
    });
  }

  hitEnemy(player, enemy) {
    if (player.body.velocity.y > 0 && player.bottom < enemy.y) {
      enemy.kill();                     // stomped from above
      player.body.velocity.y = -300;
      this.sfx.stomp.play();
      this.burst(this.sparkle, enemy.x, enemy.y, 10);
    } else {
      this.die();
    }
  }

  collectCoin(player, coin) {
    coin.kill();
    this.coins += coin.points;
    this.sfx.coin.play();
    this.burst(this.sparkle, coin.x, coin.y, 6);
    this.updateHud();
  }

  updateHud() {
    this.hud.text = this.key.replace('Level', 'Level ') + '   Coins: ' + this.coins;
  }

  die() {
    if (this.finished) { return; }
    this.finished = true;
    this.sfx.hurt.play();
    this.player.body.enable = false;
    this.player.tint = 0xff5555;
    this.game.camera.shake(0.01, 250);
    this.game.time.events.add(500, function () { this.game.state.restart(); }, this);
  }

  win() {
    if (this.finished) { return; }
    this.finished = true;
    this.player.body.enable = false;
    this.sfx.win.play();
    var result = { level: this.key.replace('Level', 'Level '), coins: this.coins };
    this.game.time.events.add(800, function () { this.game.state.start('End', true, false, result); }, this);
  }

  makeEmitter(tint) {
    var e = this.game.add.emitter(0, 0, 30);
    e.makeParticles(this.game.cache.getBitmapData('particle'));
    e.gravity = -GRAVITY + 100;   // particles drift down slowly
    e.setXSpeed(-40, 40);
    e.setYSpeed(-50, 0);
    e.setAlpha(1, 0, 400);
    e.forEach(function (p) { p.tint = tint; });
    return e;
  }

  burst(emitter, x, y, count) {
    emitter.x = x;
    emitter.y = y;
    emitter.explode(500, count);
  }
}
