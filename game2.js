var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  physics: {
      default: 'arcade',
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var player;
var cursors;
var human;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image('bg', 'assets/the-end-by-iloe-and-made.jpg');
  this.load.image('block', 'assets/block.png');
}

function create ()
{
  //  Set the camera and physics bounds to be the size of 4x4 bg images
  this.cameras.main.setBounds(0, 0, 500, 500);
  this.physics.world.setBounds(0, 0, 500, 500);

  //  Mash 4 images together to create our background
  this.add.image(0, 0, 'bg').setOrigin(0);
  this.add.image(1920, 0, 'bg').setOrigin(0).setFlipX(true);
  this.add.image(0, 1080, 'bg').setOrigin(0).setFlipY(true);
  this.add.image(1920, 1080, 'bg').setOrigin(0).setFlipX(true).setFlipY(true);

  cursors = this.input.keyboard.createCursorKeys();

  player = this.physics.add.image(400, 300, 'block');

  player.setCircle(46);
  player.body.gameObject.tint = 0xff0000;

  player.setCollideWorldBounds(true);
  // player.setImmovable()
  player.setBounce(1);

  human = this.physics.add.image(400, 300, 'block');
  human.setCircle(46);

  human.setCollideWorldBounds(true);

  human.setVelocityX(-300);
  human.setVelocityY(-300);
  human.setBounce(1);

  this.cameras.main.startFollow(player, true, 0.05, 0.05);

  this.physics.add.collider(player, human, function(_player, _human) {
    console.log(_player.body) 
    // human.setVelocityX(0);
    // human.setVelocityY(0);
    // if (_player.body.touching.up) {
    //   human.setVelocityY(-300);
    //   player.setVelocityY(300);
    // } else if (_player.body.touching.down) {
    //   human.setVelocityY(300);
    //   player.setVelocityY(-300);
    // }

    // if (_player.body.touching.right) {
    //   human.setVelocityX(300);
    //   player.setVelocityX(-300);
    // } else if (_player.body.touching.left) {
    //   human.setVelocityX(-300);
    //   player.setVelocityY(300);
    // }
  });
}

function update ()
{

  if (Phaser.Input.Keyboard.JustDown(cursors.left))
  {
    player.setVelocityY(0)
    player.setVelocityX(-300);
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.right))
  {
    player.setVelocityY(0)
    player.setVelocityX(500);
  }

  if (Phaser.Input.Keyboard.JustDown(cursors.up))
  { 
    player.setVelocityX(0)
    player.setVelocityY(-300);
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.down))
  {
    player.setVelocityX(0)
      player.setVelocityY(500);
  }
}
