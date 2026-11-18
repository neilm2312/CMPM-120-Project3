// Level 3 by:

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
  }

  update() {
    super.update();
  }
}
