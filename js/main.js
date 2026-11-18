var game = new Phaser.Game({ width: 360, height: 180, renderer: Phaser.AUTO, antialias: false });

game.state.add('Boot', Boot);
game.state.add('Menu', Menu);
game.state.add('End', End);

// Levels: one line each. The menu lists every state whose name starts with "Level".
game.state.add('Level1', Level1);
// game.state.add('Level2', Level2);
game.state.add('Level3', Level3);

game.state.start('Boot');
