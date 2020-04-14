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
    player.get().setVelocity(200)

    setTimeout(() => {
      this.sprintButton.text = 'Sprint!'
      this.sprintButton.input.enabled = true
      player.get().setVelocity(GLOB_VELOCITY)
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
  player = new PlayerClass(this, GLOB_VELOCITY)
  // player = this.physics.add.image(
  //   this.game.config.width / 2 - 20,
  //   this.game.config.height / 2 - 20,
  //   'player'
  // )
  // player.setVelocityX(GLOB_VELOCITY * -1)
  // player.setSize(200, 200, true)
  // player.setDisplaySize(40, 40)
  // player.body.gameObject.tint = 0xff0000
  // player.setCollideWorldBounds(true)
  // player.setBounce(1)

  balls = new BallsClass(this, GLOB_VELOCITY, BALLS_LENGTH)

  // var a = new Phaser.Physics.Arcade.Group(this.physics.world, this.physics.scene, balls.getChildren())

  // a.addMultiple(balls.getChildren(), true)

  
  const handleGameOver = () => {
    GLOB_VELOCITY = 100
  }
  player.collideWithBall(balls.getGroup(), handleGameOver)
  

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

  // SETUP PowerUps
  powerUps = new PowerUp(this)
  console.info(powerUps)

  timerNextItem.bind(this)()

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
    updateBodyVelocity(player.get())
    balls.getGroup().getChildren().forEach((ball) => {
      updateBodyVelocity(ball)
    })
  }

  time = 0
  const timer = () => {
    timeText.setText(`Time: ${time}`)
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!player.get().active) {
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
  this.physics.world.wrap(balls.getGroup())

  // graphics.clear().fillStyle(0).fillRectShape(this.physics.world.bounds);

  player.inputs(cursors)
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
