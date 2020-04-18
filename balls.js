class BallsClass {
  directions = directionsUtil
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

      // ball.anims.load('player_walk_down')

      // ball.anims.play('player_walk_down')

      BallsClass.uninfectABall(ball)

      this.directions.setAnimationByDirection(ball)
    })

    BallsClass.infectABall(this.balls.getChildren()[0])

    this.ballCollideWithBall()
  }

  getGroup() {
    return this.balls
  }

  static infectABall(ball) {
    ball.setData('infected', true)
    ball.setTint('0xd1045a')
  }

  static uninfectABall(ball) {
    ball.setData('infected', false)
    ball.setTint('0xfa5fd6')
  }
  
  ballCollideWithBall() {
    this.scene.physics.add.collider(this.balls, this.balls, (_ballA, _ballB) => {
      if (_ballA.getData('infected') && !_ballB.getData('infected')) {
        BallsClass.infectABall(_ballB)
      } else if (_ballB.getData('infected') && !_ballA.getData('infected')) {
        BallsClass.infectABall(_ballA)
      }

      this.directions.setAnimationByDirection(_ballA)
      this.directions.setAnimationByDirection(_ballB)
    })
  }

  setAnimationByDirection(ball) {
    this.directions.setAnimationByDirection(ball)
  }

}
