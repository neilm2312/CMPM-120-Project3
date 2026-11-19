// Level 2 by:

class Level2 extends Level {
  constructor(game) {
    super(game);
    this.skyColor = '#f5855d';
  }

  preload() {
    this.game.load.tilemap('level2', 'assets/maps/level2.json', null, Phaser.Tilemap.TILED_JSON);
  }

  create() {
    super.create('level2');
    
  }

  update() {
    super.update();
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
      sprite.points = props.value;
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

  hitEnemy(player, enemy) {
    if (player.body.velocity.y > 0 && player.bottom < enemy.y) {
      enemy.kill();                     // stomped from above
      player.body.velocity.y = -300;
      this.sfx.stomp.play();
      this.burst(this.sparkle, enemy.x, enemy.y, 10);
      if (enemy.points > 0){
        this.coins += enemy.points;
        //this.sfx.coin.play();
        this.updateHud();
      }
      
    } else {
      this.die();
    }
  }
}
