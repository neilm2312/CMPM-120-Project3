// Level 1 — Neil
// Unique mechanic: lock and key. The goal is sealed behind a locked door in the temple
// wall. The key is on top of the crates in the factory. touching the door with it opens it.
class Level1 extends Level {
  constructor(game) {
    super(game);
    this.skyColor = '#dff5f3';
  }

  preload() {
    this.game.load.tilemap('level1', 'assets/maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.audio('key', 'assets/audio/key.ogg');
    this.game.load.audio('unlock', 'assets/audio/unlock.ogg');
  }

  create() {
    super.create('level1');
    var game = this.game;
    this.hasKey = false;
    this.lastHint = 0;
    this.keySound = game.add.audio('key', 0.7);
    this.unlockSound = game.add.audio('unlock', 0.8);

    // objects named "key" and "lock" in Tiled
    this.keyItem = this.objectsNamed('key')[0];
    this.locks = game.add.group();
    this.objectsNamed('lock').forEach(function (lock) { this.locks.add(lock); }, this);

    // the goal is the flag on top of a 3-tile pole; let the whole pole count
    this.goal.body.setSize(18, 54);

    // the key bobs up and down so it reads as a pickup
    game.add.tween(this.keyItem).to({ y: this.keyItem.y - 3 }, 600, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);

    // key slot in the top-right corner, faded until you have the key
    this.keyIcon = game.add.image(340, 1, 'platformer', 27);
    this.keyIcon.fixedToCamera = true;
    this.keyIcon.alpha = 0.25;

    this.message = game.add.text(180, 28, '', { font: 'bold 11px Arial', fill: '#1b1b1b' });
    this.message.anchor.setTo(0.5);
    this.message.fixedToCamera = true;
  }

  update() {
    super.update();
    var arcade = this.game.physics.arcade;
    arcade.overlap(this.player, this.keyItem, this.collectKey, null, this);
    arcade.collide(this.player, this.locks, this.touchLock, null, this);
    arcade.collide(this.enemies, this.locks);
  }

  collectKey(player, key) {
    key.kill();
    this.hasKey = true;
    this.keyIcon.alpha = 1;
    this.keySound.play();
    this.burst(this.sparkle, key.x, key.y, 14);
    this.showMessage('Got the key! The door is in the temple.');
  }

  touchLock(player, lock) {
    if (this.hasKey) {
      this.unlock();
    } else if (this.game.time.now - this.lastHint > 1500) {
      this.lastHint = this.game.time.now;
      this.showMessage('Locked. There must be a key somewhere...');
    }
  }

  unlock() {
    this.hasKey = false;
    this.keyIcon.alpha = 0.25;
    this.unlockSound.play();
    this.game.camera.flash(0xffffff, 150);
    this.locks.forEach(function (lock) {
      this.burst(this.sparkle, lock.x, lock.y, 10);
    }, this);
    this.locks.destroy(true, true);   // remove the blocks, keep the (now empty) group
    this.showMessage('Unlocked!');
  }

  showMessage(text) {
    this.message.text = text;
    this.message.alpha = 1;
    this.game.tweens.removeFrom(this.message);
    this.game.add.tween(this.message).to({ alpha: 0 }, 600, Phaser.Easing.Linear.None, true, 1800);
  }
}
