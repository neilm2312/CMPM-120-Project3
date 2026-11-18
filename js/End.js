// Shown after finishing a level. Any key goes back to the menu.
class End {
  init(result) {
    this.result = result;
  }

  create() {
    var game = this.game;
    game.stage.backgroundColor = '#2b2d42';

    // confetti falling from the top (levels turn world gravity on; reset it here)
    game.physics.arcade.gravity.y = 0;
    var confetti = game.add.emitter(180, -10, 150);
    confetti.width = 360;
    confetti.makeParticles(game.cache.getBitmapData('particle'));
    confetti.setYSpeed(20, 60);
    confetti.gravity = 40;
    confetti.forEach(function (p) {
      p.tint = Phaser.ArrayUtils.getRandomItem([0xffd166, 0xef476f, 0x06d6a0, 0x118ab2]);
    });
    confetti.start(false, 4000, 30);

    var title = game.add.text(180, 50, 'Level complete!', { font: 'bold 22px Arial', fill: '#ffd166' });
    title.anchor.setTo(0.5);
    var stats = game.add.text(180, 95, this.result.level + '\nCoins: ' + this.result.coins, { font: '12px Arial', fill: '#ffffff', align: 'center' });
    stats.anchor.setTo(0.5);
    var hint = game.add.text(180, 164, 'Press any key for the menu', { font: '10px Arial', fill: '#8d99ae' });
    hint.anchor.setTo(0.5);

    // wait a moment so the key that finished the level doesn't skip this screen
    game.time.events.add(600, function () {
      game.input.keyboard.onDownCallback = function () {
        game.input.keyboard.onDownCallback = null;
        game.state.start('Menu');
      };
    });
  }
}
