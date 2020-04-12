/* global dat */

var config = {
  type: Phaser.AUTO,
  width: 1000,
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
          width: 1000,
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
var graphics;
var cursor;
var timeText;
let GLOB_VELOCITY = 100
var time = 0

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image('ball', 'assets/person.png');
  this.load.image('infected', 'assets/infected.png');

  this.load.image('item_mask', 'assets/mask.png');
  this.load.image('item_forced_quarentine', 'assets/forced_quarentine.png');
  this.load.image('item_social_distancing', 'assets/social_distancing.png');
  this.load.image('item_more_social_distancing', 'assets/more_social_distancing.png');

  this.load.image('solid_block', 'assets/block.png')

  this.load.image('player', 'assets/player.png');
  this.load.image('player_mask', 'assets/player_mask.png');
}

function create ()
{
  // this.physics.world.setBounds(50, 50, 700, 500);

  // graphics = this.add.graphics();

  timeText = this.add.text(2, 2);

  player = this.physics.add.image(0, 0, 'player')
  player.setSize(200, 200, true)
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
      velocityX: GLOB_VELOCITY,
      velocityY: GLOB_VELOCITY
  });

  Phaser.Actions.RandomRectangle(balls.getChildren(), this.physics.world.bounds);

  // var a = new Phaser.Physics.Arcade.Group(this.physics.world, this.physics.scene, balls.getChildren())
  
  // a.addMultiple(balls.getChildren(), true)

  balls.getChildren().forEach(ball => {
    ball.setSize(200, 200, true)
    ball.setDisplaySize(40, 40)
  
    if (Phaser.Math.Between(0, 1) === 1) {
      ball.setVelocity(GLOB_VELOCITY * -1)
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
    const playerData = _player.getData('player') || {}
    const playerWithMask = playerData.mask

    if (_ball.getData('infected')) {
      if (playerWithMask) {
        playerData.mask = false
        _player.setData('player', playerData)
        _player.setTexture('player')
      } else {
        this.scene.pause()
      }
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

  const setMaskItem = () => {
    const widthObject = 20
    const x = Phaser.Math.Between(0, this.game.config.width - widthObject)
    const y = Phaser.Math.Between(0, this.game.config.height - widthObject)

    const mask = this.physics.add.image(x, y, 'item_mask')
    mask.setDisplaySize(20, 20)

    this.physics.add.overlap(player, mask, (_player, _mask) => {
      _player.setData('player', { mask: true })
      _player.setTexture('player_mask')

      _mask.destroy()
      timerNextItem()
    })
  };

  const setSocialDistancingItem = max => {
    const widthObject = 20
    const x = Phaser.Math.Between(0, this.game.config.width - widthObject)
    const y = Phaser.Math.Between(0, this.game.config.height - widthObject)

    let itemSocialDistancing
    if (max === 1) {
      itemSocialDistancing = this.physics.add.image(x, y, 'item_more_social_distancing')
    } else {
      itemSocialDistancing = this.physics.add.image(x, y, 'item_social_distancing')
    }
    itemSocialDistancing.setDisplaySize(20, 20)
    itemSocialDistancing.setData('socialDistancingIntensity', max)

    this.physics.add.overlap(player, itemSocialDistancing, (_player, _itemSocialDistancing) => {
      const socialDistancingIntensity = _itemSocialDistancing.getData('socialDistancingIntensity')
      
      balls.getChildren().forEach(ball => {
        const rand = Phaser.Math.Between(0, socialDistancingIntensity)
      
        if (rand === 0) {
          ball.setVelocity(0)
          ball.setImmovable(true)

          this.time.addEvent({
            delay: 5000,
            callback: () => {
              const isPositive = Phaser.Math.Between(0, 1)
              ball.setVelocity(isPositive ? GLOB_VELOCITY * -1 : GLOB_VELOCITY)
              ball.setImmovable(false)
            },
            //args: [],
            callbackScope: this,
            loop: false
          });
        }
      })
      _itemSocialDistancing.destroy()
      timerNextItem()
    })
  };

  const setQuarentineWall = () => {
    const widthObject = 20

    // if the world is landscape or portrait
    // landscape set wall vetical
    // portrait set wall horizontal
    const isLandscape = this.game.config.width >= this.game.config.height
    let line
    if (isLandscape) {
      const x = Phaser.Math.Between(100, this.game.config.width - (widthObject - 100))
      line = new Phaser.Geom.Line(
        x, 
        0, 
        x, 
        this.game.config.height
      )
    } else {
      const y = Phaser.Math.Between(100, this.game.config.height - (widthObject - 100))
      line = new Phaser.Geom.Line(
        0, 
        y, 
        this.game.config.width, 
        y
      )
    }


    let howManyBocks
    if (isLandscape) {
      howManyBocks = Math.ceil(this.game.config.height / widthObject)
    } else {
      howManyBocks = Math.ceil(this.game.config.width / widthObject)
    }


    const blocks = this.physics.add.group({
      key: 'solid_block',
      frameQuantity: howManyBocks,
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1,
      velocityX: 0,
      velocityY: 0,
      immovable: true
    });

    blocks.getChildren().forEach((block, i) => {
      block.setDisplaySize(widthObject, widthObject)
    })

    Phaser.Actions.PlaceOnLine(blocks.getChildren(), line)

    this.physics.add.collider(blocks, player)
    this.physics.add.collider(blocks, balls)

    this.time.addEvent({
      delay: 5000,
      callback: () => {
        blocks.clear(true, true)
        timerNextItem()
      },
      //args: [],
      callbackScope: this,
      loop: false
    });

  };

  const randomNextItem = () => {
    const rand = Phaser.Math.Between(0, 3)

    switch(rand) {
      case 0:
        setMaskItem()
        return
      case 1:
        // more social distancing
        setSocialDistancingItem(1)
        return
      case 2:
        // social distancing
        setSocialDistancingItem(4)
        return
      case 3:
        setQuarentineWall()
        return
    }
  }

  const timerNextItem = () => {
    this.time.addEvent({
      delay: 1000,
      callback: randomNextItem,
      //args: [],
      callbackScope: this,
      loop: false
    });
  }

  timerNextItem()

  const updateVelocity = () => {
    console.log(player.body.velocity)
    const updateBodyVelocity = object => {
      const { x, y } = object.body.velocity
      if (x !== 0) {
        const isPositive = x > 0
        const newVelocity = isPositive ? GLOB_VELOCITY : GLOB_VELOCITY * -1 
        object.body.setVelocityX(newVelocity)
      }

      if (y !== 0) {
        const isPositive = y > 0
        const newVelocity = isPositive ? GLOB_VELOCITY : GLOB_VELOCITY * -1 
        object.body.setVelocityY(newVelocity)
      }
    }
    updateBodyVelocity(player)
    balls.getChildren().forEach(ball => {
      updateBodyVelocity(ball)
    })
  }

  const timer = () => {
    timeText.setText(`Time: ${time}`)
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        time += 1
        const a = time % 5
        if (a === 0) {
          GLOB_VELOCITY = GLOB_VELOCITY * 1.05
          console.log(GLOB_VELOCITY)
          updateVelocity()
        }

        timer()
      },
      //args: [],
      callbackScope: this,
      loop: false
    });
  }

  timer()
}

function update ()
{
  this.physics.world.wrap(balls);

  // graphics.clear().fillStyle(0).fillRectShape(this.physics.world.bounds);

  if (Phaser.Input.Keyboard.JustDown(cursors.left))
  {
    player.setVelocityY(0)
    player.setVelocityX(GLOB_VELOCITY * -1);
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.right))
  {
    player.setVelocityY(0)
    player.setVelocityX(GLOB_VELOCITY);
  }

  if (Phaser.Input.Keyboard.JustDown(cursors.up))
  { 
    player.setVelocityX(0)
    player.setVelocityY(GLOB_VELOCITY * -1);
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.down))
  {
    player.setVelocityX(0)
    player.setVelocityY(GLOB_VELOCITY);
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
