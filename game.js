/* global dat */

class TextButton extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style, callback) {
    super(scene, x, y, text, style)

    this.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.enterButtonHoverState())
      .on('pointerout', () => this.enterButtonRestState())
      .on('pointerdown', () => this.enterButtonActiveState())
      .on('pointerup', () => {
        this.enterButtonHoverState()
        callback()
      })
  }

  enterButtonHoverState() {
    this.setStyle({ fill: '#ff0' })
  }

  enterButtonRestState() {
    this.setStyle({ fill: '#0f0' })
  }

  enterButtonActiveState() {
    this.setStyle({ fill: '#0ff' })
  }
}

class PowerUp {
  sprintButton = null

  constructor(scene) {
    this.scene = scene

    // TODO destroy power ups on game over
    this.createSprintButton()
  }

  createSprintButton = () => {
    this.sprintButton = new TextButton(
      this.scene,
      40,
      config.height - 40,
      'Sprint!',
      { fill: '#0f0' },
      this.handleSprintClick
    )
    this.scene.add.existing(this.sprintButton)
  }

  handleSprintClick = () => {
    this.sprintButton.text = 'Recharging...'
    this.sprintButton.input.enabled = false
    // TODO update player velocity
    player.setVelocity(200)

    setTimeout(() => {
      this.sprintButton.text = 'Sprint!'
      this.sprintButton.input.enabled = true
      player.setVelocity(GLOB_VELOCITY)
    }, 5000)
  }
}

var config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  backgroundColor: 0x222222,
  parent: 'coronavirus-game',
  dom: {
    createContainer: true,
  },
  physics: {
    default: 'arcade',
    // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Physics.Arcade.html#.ArcadeWorldConfig
    arcade: {
      // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Physics.Arcade.html#.CheckCollisionObject
      checkCollision: {
        up: true,
        down: true,
        left: true,
        right: true,
      },
      /*debug: true,
      debugBodyColor: 0xff00ff,
      debugShowBody: true,
      debugShowStaticBody: true,
      debugShowVelocity: true,
      debugStaticBodyColor: 0x0000ff,
      debugVelocityColor: 0x00ff00,*/
      forceX: false,
      fps: 60,
      gravity: {
        x: 0,
        y: 0,
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
      y: 0,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
}

const BALLS_LENGTH = 14

var player
var graphics
var cursor
var timeText
var gameOverText
let GLOB_VELOCITY = 100
var time = 0
var joystick
var powerUps

var game = new Phaser.Game(config)

function preload() {
  if (isMobile(this)) {
    this.load.plugin(
      'rexvirtualjoystickplugin',
      'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js',
      true
    )
  }

  this.load.image('ball', 'assets/person.png')
  this.load.image('infected', 'assets/infected.png')

  this.load.image('item_mask', 'assets/mask.png')
  this.load.image('item_forced_quarentine', 'assets/forced_quarentine.png')
  this.load.image('item_social_distancing', 'assets/social_distancing.png')
  this.load.image(
    'item_more_social_distancing',
    'assets/more_social_distancing.png'
  )
  this.load.image('item_respirator', 'assets/respirator.png')

  this.load.image('solid_block', 'assets/block.png')

  this.load.image('player', 'assets/player.png')
  this.load.image('player_mask', 'assets/player_mask.png')
  this.load.image('player_respirator', 'assets/player_respirator.png')
  this.load.image('player_mask_respirator', 'assets/player_mask_respirator.png')
}

function create() {
  const playerUpdateTexture = () => {
    const data = player.getData('player')

    if (data.mask && data.respirator) {
      player.setTexture('player_mask_respirator')
    } else if (data.mask) {
      player.setTexture('player_mask')
    } else if (data.respirator) {
      player.setTexture('player_respirator')
    } else {
      player.setTexture('player')
    }
  }

  const ballUpdateTexture = (ball) => {
    const infected = ball.getData('infected')

    if (infected) {
      ball.setTexture('infected')
    } else {
      ball.setTexture('ball')
    }
  }
  // this.physics.world.setBounds(50, 50, 700, 500);

  // graphics = this.add.graphics();

  timeText = this.add.text(2, 2)

  player = this.physics.add.image(
    this.game.config.width / 2 - 20,
    this.game.config.height / 2 - 20,
    'player'
  )
  player.setVelocityX(GLOB_VELOCITY * -1)
  player.setSize(200, 200, true)
  player.setDisplaySize(40, 40)
  // player.body.gameObject.tint = 0xff0000
  player.setCollideWorldBounds(true)
  player.setBounce(1)

  balls = this.physics.add.group({
    key: 'ball',
    frameQuantity: BALLS_LENGTH,
    collideWorldBounds: true,
    bounceX: 1,
    bounceY: 1,
    velocityX: GLOB_VELOCITY,
    velocityY: GLOB_VELOCITY,
  })

  Phaser.Actions.RandomRectangle(balls.getChildren(), this.physics.world.bounds)

  // var a = new Phaser.Physics.Arcade.Group(this.physics.world, this.physics.scene, balls.getChildren())

  // a.addMultiple(balls.getChildren(), true)

  balls.getChildren().forEach((ball) => {
    ball.setSize(200, 200, true)
    ball.setDisplaySize(40, 40)

    if (Phaser.Math.Between(0, 1) === 1) {
      ball.setVelocity(GLOB_VELOCITY * -1)
    }
  })

  balls.getChildren()[0].setData('infected', true)
  ballUpdateTexture(balls.getChildren()[0])

  this.physics.add.collider(balls, balls, (_ballA, _ballB) => {
    if (_ballA.getData('infected') && !_ballB.getData('infected')) {
      _ballB.setData('infected', true)
      ballUpdateTexture(_ballB)
    } else if (_ballB.getData('infected') && !_ballA.getData('infected')) {
      _ballA.setData('infected', true)
      ballUpdateTexture(_ballA)
    }
  })

  this.physics.add.collider(player, balls, (_player, _ball) => {
    const playerData = _player.getData('player') || {}

    if (_ball.getData('infected')) {
      if (playerData.mask) {
        playerData.mask = false
        _player.setData('player', playerData)
        playerUpdateTexture()
      } else if (playerData.respirator) {
        _ball.setData('infected', false)
        ballUpdateTexture(_ball)
        playerData.respirator = false
        _player.setData('player', playerData)
        playerUpdateTexture()
      } else {
        player.destroy()
        gameOverText = this.add.text(0, this.game.config.height / 2)
        gameOverText.setStyle({
          fontSize: '24px',
          color: '#000000',
          align: 'center',
          backgroundColor: '#f9f9f9',
          fixedWidth: this.game.config.width,
        })
        gameOverText.setText('GAME OVER')
        gameOverText.setPosition(
          0,
          this.game.config.height / 2 - gameOverText.height / 2
        )

        const textRestart = this.add.text(
          0,
          this.game.config.height / 2 - gameOverText.height + 60
        )
        textRestart.setStyle({
          fontSize: '20px',
          color: '#ffffff',
          align: 'center',
          fixedWidth: this.game.config.width,
        })
        textRestart.setText('click to restart')
        GLOB_VELOCITY = 100

        textRestart.setInteractive()
        textRestart.on('pointerdown', () => {
          this.scene.restart()
        })
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

  if (isMobile(this)) {
    joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
      x: config.width - 60 - 40,
      y: config.height - 60 - 40,
      dir: '4dir',
      radius: 60,
      base: this.add.circle(0, 0, 60, 0x888888),
      thumb: this.add.circle(0, 0, 30, 0xcccccc),
    })
    cursors = joystick.createCursorKeys()
  } else {
    cursors = this.input.keyboard.createCursorKeys()
  }
  //cursors = this.input.keyboard.createCursorKeys();

  // SETUP PowerUps
  powerUps = new PowerUp(this)
  console.info(powerUps)

  const setMaskItem = () => {
    const widthObject = 40
    const x = Phaser.Math.Between(0, this.game.config.width - widthObject)
    const y = Phaser.Math.Between(0, this.game.config.height - widthObject)

    const mask = this.physics.add.image(x, y, 'item_mask')
    mask.setDisplaySize(widthObject, widthObject)

    this.physics.add.overlap(player, mask, (_player, _mask) => {
      const prevData = _player.getData('player')

      _player.setData('player', { ...prevData, mask: true })
      playerUpdateTexture()

      _mask.destroy()
      timerNextItem()
    })
  }

  const setRespirator = () => {
    const widthObject = 40
    const x = Phaser.Math.Between(0, this.game.config.width - widthObject)
    const y = Phaser.Math.Between(0, this.game.config.height - widthObject)

    const respirator = this.physics.add.image(x, y, 'item_respirator')
    respirator.setDisplaySize(widthObject, widthObject)

    this.physics.add.overlap(player, respirator, (_player, _respirator) => {
      const prevData = _player.getData('player')

      _player.setData('player', { ...prevData, respirator: true })

      playerUpdateTexture()

      _respirator.destroy()
      timerNextItem()
    })
  }

  const setSocialDistancingItem = (
    howManyShouldBeStopped,
    textureImageForItem
  ) => {
    const widthObject = 40
    const x = Phaser.Math.Between(0, this.game.config.width - widthObject)
    const y = Phaser.Math.Between(0, this.game.config.height - widthObject)

    let itemSocialDistancing
    if (textureImageForItem === 1) {
      itemSocialDistancing = this.physics.add.image(
        x,
        y,
        'item_more_social_distancing'
      )
    } else {
      itemSocialDistancing = this.physics.add.image(
        x,
        y,
        'item_social_distancing'
      )
    }
    itemSocialDistancing.setDisplaySize(widthObject, widthObject)
    itemSocialDistancing.setData(
      'socialDistancingIntensity',
      howManyShouldBeStopped
    )

    this.physics.add.overlap(
      player,
      itemSocialDistancing,
      (_player, _itemSocialDistancing) => {
        const socialDistancingIntensity = _itemSocialDistancing.getData(
          'socialDistancingIntensity'
        )

        balls.getChildren().forEach((ball, i) => {
          const howManyShouldBeStopped = socialDistancingIntensity

          if (howManyShouldBeStopped > i) {
            ball.setVelocity(0)
            ball.setImmovable(true)

            this.time.addEvent({
              delay: 5000,
              callback: () => {
                const isPositive = Phaser.Math.Between(0, 1)
                ball.setVelocity(
                  isPositive ? GLOB_VELOCITY * -1 : GLOB_VELOCITY
                )
                ball.setImmovable(false)
              },
              //args: [],
              callbackScope: this,
              loop: false,
            })
          }
        })
        _itemSocialDistancing.destroy()
        timerNextItem()
      }
    )
  }

  const setQuarentineWall = () => {
    const widthObject = 20

    // if the world is landscape or portrait
    // landscape set wall vetical
    // portrait set wall horizontal
    const isLandscape = this.game.config.width >= this.game.config.height
    let line
    // add 10 because without this the line stars with -10 when is used with PlaceOnLine
    const addPixels = 10
    if (isLandscape) {
      const max = this.game.config.width - (widthObject + 100)
      const x = Phaser.Math.Between(100, max)
      line = new Phaser.Geom.Line(
        x,
        0 + addPixels,
        x,
        this.game.config.height + addPixels
      )
    } else {
      const max = this.game.config.height - (widthObject + 100)
      const y = Phaser.Math.Between(100, max)
      line = new Phaser.Geom.Line(
        0 + addPixels,
        y,
        this.game.config.width + addPixels,
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
      immovable: true,
    })

    blocks.getChildren().forEach((block) => {
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
      loop: false,
    })
  }

  const randomNextItem = () => {
    const rand = Phaser.Math.Between(0, 4)

    switch (rand) {
      case 0:
        setRespirator()
        return
      case 1:
        setMaskItem()
        return
      case 2:
        // more social distancing
        setSocialDistancingItem(Math.floor(BALLS_LENGTH / 2), 1)
        return
      case 3:
        // social distancing
        setSocialDistancingItem(Math.floor(BALLS_LENGTH / 4))
        return
      case 4:
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
      loop: false,
    })
  }

  timerNextItem()

  const updateVelocity = () => {
    const updateBodyVelocity = (object) => {
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
    balls.getChildren().forEach((ball) => {
      updateBodyVelocity(ball)
    })
  }

  time = 0
  const timer = () => {
    timeText.setText(`Time: ${time}`)
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!player.active) {
          return
        }

        time += 1
        const a = time % 5

        if (a === 0) {
          GLOB_VELOCITY = GLOB_VELOCITY * 1.05
          updateVelocity()
        }

        timer()
      },
      //args: [],
      callbackScope: this,
      loop: false,
    })
  }

  timer()
}

function update() {
  this.physics.world.wrap(balls)

  // graphics.clear().fillStyle(0).fillRectShape(this.physics.world.bounds);

  if (!player.active) {
    return
  }

  if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
    player.setVelocityY(0)
    player.setVelocityX(GLOB_VELOCITY * -1)
  } else if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
    player.setVelocityY(0)
    player.setVelocityX(GLOB_VELOCITY)
  }

  if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
    player.setVelocityX(0)
    player.setVelocityY(GLOB_VELOCITY * -1)
  } else if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
    player.setVelocityX(0)
    player.setVelocityY(GLOB_VELOCITY)
  }
}

function createWorldGui(world) {
  var gui = new dat.GUI({ width: 400 })

  var bounds = gui.addFolder('bounds')
  bounds.add(world.bounds, 'x', -400, 400, 10)
  bounds.add(world.bounds, 'y', -300, 300, 10)
  bounds.add(world.bounds, 'width', 0, 800, 10)
  bounds.add(world.bounds, 'height', 0, 600, 10)

  var check = gui.addFolder('checkCollision')
  check.add(world.checkCollision, 'left')
  check.add(world.checkCollision, 'up')
  check.add(world.checkCollision, 'right')
  check.add(world.checkCollision, 'down')

  var defaults = gui.addFolder('defaults')
  defaults.add(world.defaults, 'debugShowBody')
  defaults.add(world.defaults, 'debugShowStaticBody')
  defaults.add(world.defaults, 'debugShowVelocity')
  defaults.addColor(world.defaults, 'bodyDebugColor')
  defaults.addColor(world.defaults, 'staticBodyDebugColor')
  defaults.addColor(world.defaults, 'velocityDebugColor')

  var debug = gui.addFolder('debugGraphic')
  debug.add(world.debugGraphic, 'visible')
  debug.add(world.debugGraphic, 'clear')

  gui.add(world, 'drawDebug')

  gui.add(world, 'forceX')

  var gravity = gui.addFolder('gravity')
  gravity.add(world.gravity, 'x', -300, 300, 10)
  gravity.add(world.gravity, 'y', -300, 300, 10)

  // gui.add(world, 'isPaused');

  gui.add(world, 'OVERLAP_BIAS', -8, 8, 1)

  gui.add(world, 'pause')

  gui.add(world, 'resume')

  return gui
}

var isMobile = function (scene) {
  return !scene.sys.game.device.os.desktop
}
