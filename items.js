const timerNextItem = function() {
  this.time.addEvent({
    delay: 1000,
    callback: randomNextItem,
    //args: [],
    callbackScope: this,
    loop: false,
  })
}

const randomNextItem = function() {
  const rand = Phaser.Math.Between(0, 4)

  switch (rand) {
    case 0:
      setRespirator.bind(this)()
      return
    case 1:
      setMaskItem.bind(this)()
      return
    case 2:
      // more social distancing
      setSocialDistancingItem.bind(this)(Math.floor(BALLS_LENGTH / 2), 1)
      return
    case 3:
      // social distancing
      setSocialDistancingItem.bind(this)(Math.floor(BALLS_LENGTH / 4))
      return
    case 4:
      setQuarentineWall.bind(this)()
      return
  }
}

const setMaskItem = function() {
  const widthObject = 40
  const x = Phaser.Math.Between(0, this.game.config.width - widthObject)
  const y = Phaser.Math.Between(0, this.game.config.height - widthObject)

  const mask = this.physics.add.image(x, y, 'item_mask')
  mask.setDisplaySize(widthObject, widthObject)

  this.physics.add.overlap(player.get(), mask, (_player, _mask) => {
    const prevData = _player.getData('player')

    _player.setData('player', { ...prevData, mask: true })
    PlayerClass.updateTexture(_player)

    _mask.destroy()
    timerNextItem.bind(this)()
  })
}

const setRespirator = function() {
  const widthObject = 40
  const x = Phaser.Math.Between(0, this.game.config.width - widthObject)
  const y = Phaser.Math.Between(0, this.game.config.height - widthObject)

  const respirator = this.physics.add.image(x, y, 'item_respirator')
  respirator.setDisplaySize(widthObject, widthObject)

  this.physics.add.overlap(player.get(), respirator, (_player, _respirator) => {
    const prevData = _player.getData('player')

    _player.setData('player', { ...prevData, respirator: true })

    PlayerClass.updateTexture(_player)

    _respirator.destroy()
    timerNextItem.bind(this)()
  })
}

const setSocialDistancingItem = function(
  howManyShouldBeStopped,
  textureImageForItem
) {
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
    player.get(),
    itemSocialDistancing,
    (_player, _itemSocialDistancing) => {
      const socialDistancingIntensity = _itemSocialDistancing.getData(
        'socialDistancingIntensity'
      )

      balls.getGroup().getChildren().forEach((ball, i) => {
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
      timerNextItem.bind(this)()
    }
  )
}

const setQuarentineWall = function() {
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

  this.physics.add.collider(blocks, player.get(), () => {
    player.setAnimationByDirection()
  })
  this.physics.add.collider(blocks, balls.getGroup())

  this.time.addEvent({
    delay: 5000,
    callback: () => {
      blocks.clear(true, true)
      timerNextItem.bind(this)()
    },
    //args: [],
    callbackScope: this,
    loop: false,
  })
}
