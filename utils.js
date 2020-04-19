const timer = function() {
  timeText.setText(`Time: ${time}`)
  this.time.addEvent({
    delay: 1000,
    callback: () => {
      if (!player.get().active) {
        return
      }

      time += 1
      const a = time % 5

      if (a === 0 && this.physics.world.timeScale >= 0.2) {
        this.physics.world.timeScale -= 0.02;
      }

      timer.bind(this)()
    },
    //args: [],
    callbackScope: this,
    loop: false,
  })
}

var isMobile = function (scene) {
  return !scene.sys.game.device.os.desktop
}

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
  callback
  constructor(scene, cb) {
    this.scene = scene
    this.callback = cb

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
    this.callback && this.callback()
  }

  setText(newText) {
    this.sprintButton.text = newText
  }
}

class DirectionsUtilClass {
  DIRECTIONS = {
    up: 1,
    upRight: 2,
    right: 3,
    downRight: 4,
    down: 5,
    downLeft: 6,
    left: 7,
    upLeft: 8
  }

  getDirections() {
    return this.DIRECTIONS
  }

  inferNewDirection(object) {
    if (!object || !object.body) {
      return 
    }

    const { x, y } = object.body.velocity

    const up = y < 0
    const down = y > 0
    const right = x > 0
    const left = x < 0

    if (up) {
      if (right) {
        return this.DIRECTIONS.upRight
      } else if (left) {
        return this.DIRECTIONS.upLeft
      }

      return this.DIRECTIONS.up

    } else if (down) {
      if (right) {
        return this.DIRECTIONS.downRight
      } else if (left) {
        return this.DIRECTIONS.downLeft
      }
      return this.DIRECTIONS.down
    } 
    
    if (right) {
      return this.DIRECTIONS.right
    } else if (left) {
      return this.DIRECTIONS.left
    }
  }

  setAnimationByDirection(object) {
    switch(this.inferNewDirection(object)) {
      case this.DIRECTIONS.up:
        object.setAngle(180)
        return
      case this.DIRECTIONS.upRight:
        object.setAngle(-135)
        return
      case this.DIRECTIONS.right:
        object.setAngle(-90)
        return
      case this.DIRECTIONS.downRight:
        object.setAngle(-45)
        return
      case this.DIRECTIONS.down:
        object.setAngle(0)
        return
      case this.DIRECTIONS.downLeft:
        object.setAngle(45)
        return
      case this.DIRECTIONS.left:
        object.setAngle(90)
        return
      case this.DIRECTIONS.upLeft:
        object.setAngle(135)
        return
    }
  }
}

const directionsUtil = new DirectionsUtilClass()

// class TimeBar extends Phaser.GameObjects.Image {

//   constructor (scene, x, y, myExtra) {
//       super(scene, x, y)
//       this.myExtra = myExtra
//       this.setTexture('cachedtexturekey')
//       this.setPosition(x, y)
//   }
  
//   preload() {

//   }
  
//   create() {

//   } 
  
//   preUpdate (time, delta) {
//     // do stuff with this.myExtra
//   }

// }
