// Title screen. Press 1, 2, 3... to start that level.
class Menu {
  create() {
    var game = this.game;
    game.stage.backgroundColor = '#2b2d42';

    var title = game.add.text(180, 36, 'PLATFORMER', { font: 'bold 24px Arial', fill: '#ffd166' });
    title.anchor.setTo(0.5);

    // every named level becomes a menu entry
    var levels = Object.keys(game.state.states).filter(function (name) { return /^Level\d+$/.test(name); }).sort();
    levels.forEach(function (name, i) {
      var label = game.add.text(180, 80 + i * 20, (i + 1) + '   ' + name.replace('Level', 'Level '), { font: '14px Arial', fill: '#ffffff' });
      label.anchor.setTo(0.5);
      var key = game.input.keyboard.addKey(Phaser.Keyboard.ONE + i);
      key.onDown.removeAll();
      key.onDown.addOnce(function () { game.state.start(name); });
    });

    var help = game.add.text(180, 166, 'Arrows to move, Up or Space to jump, Esc for menu', { font: '9px Arial', fill: '#8d99ae' });
    help.anchor.setTo(0.5);
  }
}
