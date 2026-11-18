// Level 3 by: Andy Lu
// Unique mechanic: Bounce pad that pushes you upwards at 1.25x your jump height
class Level3 extends Level {
  constructor(game) {
    super(game);
    this.skyColor = '#fde2c4';
  }

  preload() {
    this.game.load.tilemap('level3', 'assets/maps/level3.json', null, Phaser.Tilemap.TILED_JSON);
  }

  create() {
    super.create('level3');
    this.bounce_pads = this.game.add.group();
    this.objectsNamed('bounce_pad').forEach(function (bounce_pad) { 
      this.bounce_pads.add(bounce_pad); 
    }, this);
  }

  update() {
    super.update();
    this.game.physics.arcade.overlap(this.player, this.bounce_pads, this.bounce, null, this);
  }

  bounce(player, pad) {
    player.body.velocity.y = -player.jumpSpeed * 1.25;
  }
}