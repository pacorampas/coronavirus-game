class PlayerClass {
  constructor(scene, velocity) {
    this.scene = scene
    this.velocity = velocity

    this.player = this.initSprite()

    this.player.setVelocity(0, velocity)
    this.player.setSize(256, 256, true)
    this.player.setDisplaySize(60, 60)

    this.player.setCollideWorldBounds(true)
    this.player.setBounce(1)
  }

  initSprite() {
    this.scene.anims.create({
      key: 'player_walk_down',
      frames: this.scene.anims.generateFrameNumbers('player_down'),
      frameRate: 8,
      yoyo: false,
      repeat: -1,
    })

    this.player = this.scene.physics.add.sprite(
      this.scene.game.config.width / 2 - 20,
      this.scene.game.config.height / 2 - 20,
      'player'
    )

    // TO UPDATE THE VELOCITY
    // this.player.anims.setTimeScale(4)


    this.player.anims.load('player_walk_down')

    this.player

    this.player.anims.play('player_walk_down')

    return this.player
  }

  get() {
    return this.player
  }

  collideWithBall(balls, onGameOver) {
    this.scene.physics.add.collider(this.player, balls, (_player, _ball) => {
      const playerData = _player.getData('player') || {}
  
      if (_ball.getData('infected')) {
        if (playerData.mask) {
          playerData.mask = false
          _player.setData('player', playerData)
          PlayerClass.updateTexture(_player)
        } else if (playerData.respirator) {
          BallsClass.uninfectABall(_ball) 
          playerData.respirator = false
          _player.setData('player', playerData)
          PlayerClass.updateTexture(_player)
        } else {
          _player.destroy()
          gameOverText = this.scene.add.text(0, this.scene.game.config.height / 2)
          gameOverText.setStyle({
            fontSize: '24px',
            color: '#000000',
            align: 'center',
            backgroundColor: '#f9f9f9',
            fixedWidth: this.scene.game.config.width,
          })
          gameOverText.setText('GAME OVER')
          gameOverText.setPosition(
            0,
            this.scene.game.config.height / 2 - gameOverText.height / 2
          )
  
          const textRestart = this.scene.add.text(
            0,
            this.scene.game.config.height / 2 - gameOverText.height + 60
          )
          textRestart.setStyle({
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            fixedWidth: this.scene.game.config.width,
          })
          textRestart.setText('click to restart')

          console.log(this.scene)
  
          textRestart.setInteractive()
          textRestart.on('pointerdown', () => {
            this.scene.scene.restart()
          })

          onGameOver()
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
  }

  inputs(cursors) {
    if (!this.player.active) {
      return
    }
  
    if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
      this.player.setVelocityY(0)
      this.player.setVelocityX(this.velocity * -1)
      this.player.setAngle(90)
    } else if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
      this.player.setVelocityY(0)
      this.player.setVelocityX(this.velocity)
      this.player.setAngle(-90)
    }
  
    if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
      this.player.setVelocityX(0)
      this.player.setVelocityY(this.velocity * -1)
      this.player.setAngle(180)
    } else if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
      this.player.setVelocityX(0)
      this.player.setVelocityY(this.velocity)
      this.player.setAngle(0)
    }
  }

  static updateTexture(player) {
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

}
