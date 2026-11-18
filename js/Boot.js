// Loads everything every level shares, then opens the menu.
class Boot {
  init() {
    // scale the small 360x180 game up to fill the window, keeping pixels sharp
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

  preload() {
    var load = this.game.load;

    // tile sheets: the key must match the tileset name in Tiled
    load.spritesheet('platformer', 'assets/images/Platformer/tilemap_packed.png', 18, 18);
    load.spritesheet('industrial', 'assets/images/Industrial/tilemap_packed.png', 18, 18);
    load.spritesheet('food', 'assets/images/Food/tilemap_packed.png', 18, 18);
    load.spritesheet('blocks', 'assets/images/Blocks/stone_packed.png', 18, 18);
    load.spritesheet('characters', 'assets/images/Platformer/tilemap-characters_packed.png', 24, 24);

    load.audio('jump', 'assets/audio/jump.ogg');
    load.audio('land', 'assets/audio/land.ogg');
    load.audio('coin', 'assets/audio/coin.ogg');
    load.audio('stomp', 'assets/audio/stomp.ogg');
    load.audio('hurt', 'assets/audio/hurt.ogg');
    load.audio('win', 'assets/audio/win.ogg');
  }

  create() {
    // a small white square used by the particle emitters
    var dot = this.game.add.bitmapData(3, 3);
    dot.fill(255, 255, 255, 1);
    this.game.cache.addBitmapData('particle', dot);

    this.game.state.start('Menu');
  }
}
