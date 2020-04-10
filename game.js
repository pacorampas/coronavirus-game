/* global dat */

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: 0x222222,
  parent: 'phaser-example',
  physics: {
      default: 'arcade',
      // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Physics.Arcade.html#.ArcadeWorldConfig
      arcade: {
          // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Physics.Arcade.html#.CheckCollisionObject
          checkCollision: {
              up: true,
              down: true,
              left: true,
              right: true
          },
          debug: true,
          debugBodyColor: 0xff00ff,
          debugShowBody: true,
          debugShowStaticBody: true,
          debugShowVelocity: true,
          debugStaticBodyColor: 0x0000ff,
          debugVelocityColor: 0x00ff00,
          forceX: false,
          fps: 60,
          gravity: {
              x: 0,
              y: 0
          },
          height: 600,
          isPaused: false,
          maxEntries: 16,
          overlapBias: 4,
          tileBias: 16,
          timeScale: 1,
          useTree: true,
          width: 800,
          x: 0,
          y: 0
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var player;
var blocks;
var graphics;
var cursor;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image('ball', 'assets/person.png');
  this.load.image('infected', 'assets/infected.png');
  this.load.image('player', 'assets/player.png');
}

function create ()
{
  // this.physics.world.setBounds(50, 50, 700, 500);

  // graphics = this.add.graphics();

  player = this.physics.add.image(0, 0, 'player')
  player.setDisplaySize(40, 40)
  player.body.gameObject.tint = 0xff0000
  player.setCollideWorldBounds(true)
  player.setBounce(1)

  balls = this.physics.add.group({
      key: 'ball',
      frameQuantity: 6,
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1,
      velocityX: 100,
      velocityY: 100
  });

  Phaser.Actions.RandomRectangle(balls.getChildren(), this.physics.world.bounds);

  // var a = new Phaser.Physics.Arcade.Group(this.physics.world, this.physics.scene, balls.getChildren())
  
  // a.addMultiple(balls.getChildren(), true)

  balls.getChildren().forEach(ball => {
    ball.setDisplaySize(40, 40)
  
    if (Math.random() >= 0.5) {
      ball.setVelocity(-100)
    }
  })

  balls.getChildren()[0].setTexture('infected')
  balls.getChildren()[0].setData('infected', true)

  this.physics.add.collider(balls, balls, (_ballA, _ballB) => {
    if (_ballA.getData('infected') && !_ballB.getData('infected')) {
      _ballB.setData('infected', true)
      _ballB.setTexture('infected')
    } else if (_ballB.getData('infected') && !_ballA.getData('infected')) {
      _ballA.setData('infected', true)
      _ballA.setTexture('infected')
    }
  });

  this.physics.add.collider(player, balls, (_player, _ball) => {
    console.log(_ball, _ball.body.touching.up, _ball.body.touching.right, _ball.body.touching.down, _ball.body.touching.left)
    
    if (_ball.getData('infected')) {
      this.scene.pause()
    }

    // if (_ball.body.touching.up) {
    //   ball.setVelocity(-100)
    // } else if (_ball.body.touching.right) {
    //   ball.setVelocity(-100)
    // } else if (_ball.body.touching.down) {
    //   ball.setVelocity(-100)
    // } else if (_ball.body.touching.left) {
    //   ball.setVelocity(-100)
    // }
  })

  //createWorldGui(this.physics.world);
  cursors = this.input.keyboard.createCursorKeys();

}

function update ()
{
  this.physics.world.wrap(balls);

  // graphics.clear().fillStyle(0).fillRectShape(this.physics.world.bounds);

  if (Phaser.Input.Keyboard.JustDown(cursors.left))
  {
    player.setVelocityY(0)
    player.setVelocityX(-100);
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.right))
  {
    player.setVelocityY(0)
    player.setVelocityX(100);
  }

  if (Phaser.Input.Keyboard.JustDown(cursors.up))
  { 
    player.setVelocityX(0)
    player.setVelocityY(-100);
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.down))
  {
    player.setVelocityX(0)
      player.setVelocityY(100);
  }
}

function createWorldGui (world)
{
  var gui = new dat.GUI({ width: 400 });

  var bounds = gui.addFolder('bounds');
  bounds.add(world.bounds, 'x', -400, 400, 10);
  bounds.add(world.bounds, 'y', -300, 300, 10);
  bounds.add(world.bounds, 'width', 0, 800, 10);
  bounds.add(world.bounds, 'height', 0, 600, 10);

  var check = gui.addFolder('checkCollision');
  check.add(world.checkCollision, 'left');
  check.add(world.checkCollision, 'up');
  check.add(world.checkCollision, 'right');
  check.add(world.checkCollision, 'down');

  var defaults = gui.addFolder('defaults');
  defaults.add(world.defaults, 'debugShowBody');
  defaults.add(world.defaults, 'debugShowStaticBody');
  defaults.add(world.defaults, 'debugShowVelocity');
  defaults.addColor(world.defaults, 'bodyDebugColor');
  defaults.addColor(world.defaults, 'staticBodyDebugColor');
  defaults.addColor(world.defaults, 'velocityDebugColor');

  var debug = gui.addFolder('debugGraphic');
  debug.add(world.debugGraphic, 'visible');
  debug.add(world.debugGraphic, 'clear');

  gui.add(world, 'drawDebug');

  gui.add(world, 'forceX');

  var gravity = gui.addFolder('gravity');
  gravity.add(world.gravity, 'x', -300, 300, 10);
  gravity.add(world.gravity, 'y', -300, 300, 10);

  // gui.add(world, 'isPaused');

  gui.add(world, 'OVERLAP_BIAS', -8, 8, 1);

  gui.add(world, 'pause');

  gui.add(world, 'resume');

  return gui;
}
