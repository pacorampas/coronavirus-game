class PlayerClass {
  constructor(scene, velocity) {
    this.scene = scene
    this.velocity = velocity

    this.player = this.initSprite()

    this.player.setVelocity(0, velocity)
    this.player.setSize(150, 150, true)
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

  inferNewDirection() {
    const { x, y } = this.player.body.velocity

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

  setAnimationByDirection() {
    switch(this.inferNewDirection()) {
      case this.DIRECTIONS.up:
        this.player.setAngle(180)
        return
      case this.DIRECTIONS.upRight:
        this.player.setAngle(-135)
        return
      case this.DIRECTIONS.right:
        this.player.setAngle(-90)
        return
      case this.DIRECTIONS.downRight:
        this.player.setAngle(-45)
        return
      case this.DIRECTIONS.down:
        this.player.setAngle(0)
        return
      case this.DIRECTIONS.downLeft:
        this.player.setAngle(45)
        return
      case this.DIRECTIONS.left:
        this.player.setAngle(90)
        return
      case this.DIRECTIONS.upLeft:
        this.player.setAngle(135)
        return
    }
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
      
      const { x, y } = this.player.body.velocity
      if (x !== 0 || y !== 0) {
        this.setAnimationByDirection()
        return
      }

      if (_player.body.touching.up) {
        _player.setVelocityY(this.velocity * -1)
      } else if (_player.body.touching.right) {
        _player.setVelocityX(this.velocity * -1)
      } else if (_player.body.touching.down) {
        _player.setVelocityY(this.velocity)
      } else if (_player.body.touching.left) {
        _player.setVelocityX(this.velocity)
      }

      this.setAnimationByDirection()
    })
  }

  inputs(cursors) {
    if (!this.player.active) {
      return
    }
  
    if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
      this.player.setVelocityY(0)
      this.player.setVelocityX(this.velocity * -1)
      this.setAnimationByDirection()
    } else if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
      this.player.setVelocityY(0)
      this.player.setVelocityX(this.velocity)
      this.setAnimationByDirection()
    }
  
    if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
      this.player.setVelocityX(0)
      this.player.setVelocityY(this.velocity * -1)
      this.setAnimationByDirection()
    } else if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
      this.player.setVelocityX(0)
      this.player.setVelocityY(this.velocity)
      this.setAnimationByDirection()
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
