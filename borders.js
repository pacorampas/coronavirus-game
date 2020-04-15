
class Borders {
  BORDER_WIDTH = 10
  constructor(scene) {
    this.scene = scene
    this.borderUp = this.scene.physics.add.image(this.scene.game.config.width / 2, 0)
    this.borderUp.setSize(this.scene.game.config.width, this.BORDER_WIDTH, true)
    this.borderUp.setImmovable(true)

    this.borderDown = this.scene.physics.add.image(this.scene.game.config.width / 2, this.scene.game.config.height)
    this.borderDown.setSize(this.scene.game.config.width, this.BORDER_WIDTH, true)
    this.borderDown.setImmovable(true)

    this.borderRight = this.scene.physics.add.image(this.scene.game.config.width, this.scene.game.config.height / 2)
    this.borderRight.setSize(this.BORDER_WIDTH, this.scene.game.config.height, true)
    this.borderRight.setImmovable(true)

    this.borderLeft = this.scene.physics.add.image(0, this.scene.game.config.height / 2)
    this.borderLeft.setSize(this.BORDER_WIDTH, this.scene.game.config.height, true)
    this.borderLeft.setImmovable(true)

    this.bordersGroup = new Phaser.GameObjects.Group(this, [this.borderUp, this.borderDown, this.borderRight, this.borderLeft])
  }

  getGroup() {
    return this.bordersGroup
  }

  getBorders() {
    return {
      up: this.borderUp,
      down: this.borderDown,
      left: this.borderLeft,
      right: this.borderRight
    }
  }

  collideWith(objectsBody, callback) {
    objectsBody.forEach(element => {
      this.scene.physics.add.collider(this.bordersGroup, element, callback)
    });
  }
}
