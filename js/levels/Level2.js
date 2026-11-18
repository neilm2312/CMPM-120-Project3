// Level 2 by:

class Level2 extends Level {
  constructor(game) {
    super(game);
    this.skyColor = '#fde2c4';
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
}
