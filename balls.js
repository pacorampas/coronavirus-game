class BallsClass {
  constructor(scene, velocity, ballsLength) {
    this.scene = scene
    this.velocity = velocity

    this.balls = scene.physics.add.group({
      key: 'ball',
      frameQuantity: ballsLength,
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1,
      velocityX: velocity,
      velocityY: velocity,
    })

    Phaser.Actions.RandomRectangle(this.balls.getChildren(), scene.physics.world.bounds)

    this.balls.getChildren().forEach((ball) => {
      ball.setSize(200, 200, true)
      ball.setDisplaySize(40, 40)
  
      if (Phaser.Math.Between(0, 1) === 1) {
        ball.setVelocity(GLOB_VELOCITY * -1)
      }
    })

    BallsClass.infectABall(this.balls.getChildren()[0])

    this.ballCollideWithBall()
  }

  getGroup() {
    return this.balls
  }

  static infectABall(ball) {
    ball.setData('infected', true)
    BallsClass.updateTexture(ball)
  }

  static uninfectABall(ball) {
    ball.setData('infected', false)
    BallsClass.updateTexture(ball)
  }

  static updateTexture(ball) {
    const infected = ball.getData('infected')

    if (infected) {
      ball.setTexture('infected')
    } else {
      ball.setTexture('ball')
    }
  }
  
  ballCollideWithBall() {
    this.scene.physics.add.collider(this.balls, this.balls, (_ballA, _ballB) => {
      if (_ballA.getData('infected') && !_ballB.getData('infected')) {
        BallsClass.infectABall(_ballB)
      } else if (_ballB.getData('infected') && !_ballA.getData('infected')) {
        BallsClass.infectABall(_ballA)
      }
    })
  }

}
