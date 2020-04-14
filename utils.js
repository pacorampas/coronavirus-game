const updateVelocity = function() {
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

      if (a === 0) {
        GLOB_VELOCITY = GLOB_VELOCITY * 1.05
        updateVelocity()
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
