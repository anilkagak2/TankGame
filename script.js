// Bric Colors
var BricColor = {
  naturalColor : '#87592c',
  silverColor : 'ghostwhite'
};

var keyCodes = {
  leftArrow :	37,
  upArrow : 38,
  rightArrow : 39,
  downArrow : 40
};

var CollisionBetweenRectangles = function(r1, r2, vicinity) {
  return  !(r2.left >= r1.right + vicinity
      || r2.right <= r1.left - vicinity
      || r2.top >= r1.bottom + vicinity
      || r2.bottom <= r1.top - vicinity);
};

// Base Unit of wall
var Brick = React.createClass({
  displayName: 'Brick',

  getDefaultProps: function() {
    return {
      backgroundColor: BricColor.naturalColor,
      width: '20px',
      height: '10px'
    };
  },

  checkCollision : function(playerRect, vicinity) {
    var domNode = ReactDOM.findDOMNode(this.refs.brick);
    var domRect = domNode.getBoundingClientRect();
    return CollisionBetweenRectangles(playerRect, domRect, vicinity);
  },

  render: function() {
    var tankStyle = {
      backgroundColor: this.props.backgroundColor,
      width: this.props.width,
      height: this.props.height,
      border: "3px solid black"
    };
    return (
      React.createElement('div', {
        ref : 'brick',
        style: tankStyle
      }, "")
    );
  }
});

// Wall consists of many bricks
var Wall = React.createClass({
  displayName: 'Wall',

  getDefaultProps: function() {
    return {
      backgroundColor: BricColor.naturalColor,
      width: '20px',
      height: '10px',
      bricks: 5,
      vertical: true,
      positionFixed: false,
      top: '15%',
      right: '60%'
    };
  },

  checkCollision: function(playerRect, vicinity) {
    for (var i = 0; i < this.props.bricks; ++i) {
      var brickReference = this.refs["brick" + i];
      if (brickReference.checkCollision(playerRect, vicinity)) {
        return true;
      }
    }
    
    return false;
  },

  render: function() {
    var bricks = [];
    for (var i = 0; i < this.props.bricks; ++i) {
      bricks.push(React.createElement(
        Brick, {
          key: i,
          ref: "brick" + i,
          backgroundColor: this.props.backgroundColor,
          width: this.props.width,
          height: this.props.height,
        }));
    }

    var wallStyle = {
      display: this.props.vertical ? 'block' : 'flex',
      top: this.props.positionFixed ? this.props.top : '',
      right: this.props.positionFixed ? this.props.right : '',
      position: this.props.positionFixed ? 'absolute' : ''
    };

    return (
      React.createElement('div', {
        style: wallStyle
      }, bricks)
    );
  }
});

// Bunker Object which needs to be protected
var Bunker = React.createClass({
  displayName: 'Bunker',
  
  checkCollision: function(playerRect, vicinity) {
    for (var i = 1; i <= 3; ++i) {
      var wallReference = this.refs["wall" + i];
      if (wallReference.checkCollision(playerRect, vicinity)) {
        return true;
      }
    }
    
    return false;
  },
  
  render: function() {
    var bunker = [];
    var bunkerStyle = {
      width: '70px',
      height: '70px',
      position: 'absolute',
      bottom: '1%',
      left: '44%'
    };

    var baseObjectProps = {
      key: "toBeSecured",
      src: "https://avatars.githubusercontent.com/u/1572699?v=3",
      alt: "Mike Wizowski",
      style: {
        width: '32px',
        height: '32px',
        position: 'absolute',
        top: '35%',
        right: '30%'
      }
    };

    bunker.push(React.createElement(Wall, { key: 'wall2', ref: 'wall2', vertical: false, width: '10px', height: '10px' }));
    bunker.push(React.createElement(Wall, { key: 'wall1', ref: 'wall1', vertical: true, width: '10px', height: '10px', bricks:3  }));
    bunker.push(React.createElement('img', baseObjectProps, null));
    bunker.push(React.createElement(Wall, { key: 'wall3', ref: 'wall3', vertical: true, width: '10px', height: '10px', bricks:3, positionFixed: true, top: '25%', right: '0%' }));
    return (
      React.createElement('div', {
        style: bunkerStyle
      }, bunker)
    );
  }
});

// Tank Game main control routine
var TankGame = React.createClass({
  displayName: 'TankGame',

  SPEED_INCREMENT: 1,
  WINDOW_WIDTH : 460,
  WINDOW_HEIGHT : 540,
  BUNKER_VICINITY : 0,
  WALL_VICINITY : 0,
  
  walls: 
  [
    // left
    [ true, true, '5%', '80%', '30px', '20px', 5 ],
    [ true, true, '5%', '65%', '30px', '20px', 5 ],
    [ true, true, '43%', '80%', '30px', '20px', 10 ],
    [ true, true, '43%', '65%', '30px', '20px', 10 ],
    
    // silver bricks
    [ true, true, '29%', '0%', '30px', '20px', 2, BricColor.silverColor ],
    [ false, true, '33%', '84%', '30px', '20px', 2, BricColor.silverColor ],
    
    // center
    [ true, true, '10%', '40%', '40px', '20px', 7 ],
    [ true, true, '10%', '50%', '30px', '20px', 7 ],
    [ true, true, '43%', '40%', '40px', '7px', 3, BricColor.silverColor ],
    [ true, true, '43%', '50%', '30px', '7px', 3, BricColor.silverColor ],
    [ true, true, '50%', '40%', '40px', '20px', 5 ],
    [ true, true, '50%', '50%', '30px', '20px', 5 ],
    
    // right
    [ true, true, '5%', '10%', '30px', '20px', 5 ],
    [ true, true, '5%', '25%', '30px', '20px', 5 ],
    [ true, true, '43%', '10%', '30px', '20px', 10 ],
    [ true, true, '43%', '25%', '30px', '20px', 10 ],
  ],
  
  // player speed and direction
  playerVelocity: {
    left : 10,
    bottom : 4
  },

  keyDownHandler : function(event) {
    var oldLeft = this.playerVelocity.left;
    var oldBottom = this.playerVelocity.bottom;

    switch(event.keyCode) {
      case keyCodes.leftArrow:
        this.playerVelocity.left -= this.SPEED_INCREMENT;
        break;
      case keyCodes.upArrow:
        this.playerVelocity.bottom += this.SPEED_INCREMENT;
        break;
      case keyCodes.rightArrow:
        this.playerVelocity.left += this.SPEED_INCREMENT;
        break;
      case keyCodes.downArrow:
        this.playerVelocity.bottom -= this.SPEED_INCREMENT;
        break;
      default:
        return;
    }
    
    if (this.playerVelocity.left<0) this.playerVelocity.left = 0;
    if (this.playerVelocity.bottom<0) this.playerVelocity.bottom = 0;
    if (this.playerVelocity.left>100) this.playerVelocity.left = 100;
    if (this.playerVelocity.bottom>100) this.playerVelocity.bottom = 100;

    // set the value currently, so that we can revert in case it does not fit
    var player = ReactDOM.findDOMNode(this.refs.player1);
    player.style.left = this.playerVelocity.left.toString() + "%";
    player.style.bottom = this.playerVelocity.bottom.toString() + "%";
    var playerRect = player.getBoundingClientRect();

    // check if collides with bunker
    if (this.refs.bunker.checkCollision(playerRect, this.BUNKER_VICINITY)) {
      this.playerVelocity.left = oldLeft;
      this.playerVelocity.bottom = oldBottom;
      
      player.style.left = oldLeft + "%";
      player.style.bottom = oldBottom + "%";
      return;
    }
    
    // check if collides with the walls
    for (var i=0; i<this.walls.length; ++i) {
      var wallString = "wall" + i;
      var wallReference = this.refs[wallString];
      var collisionOccurred = wallReference.checkCollision(playerRect, this.WALL_VICINITY);

      if (collisionOccurred) {
        this.playerVelocity.left = oldLeft;
        this.playerVelocity.bottom = oldBottom;
      
        player.style.left = oldLeft + "%";
        player.style.bottom = oldBottom + "%";
        return;
      }
    }
  },

  keyUpHandler : function(event) {
  },

  componentDidMount : function() {
    window.addEventListener('keydown', this.keyDownHandler, true);
    window.addEventListener('keyup', this.keyUpHandler, true);
  },
  
  componentWillUnmount : function () {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
  },
  
  render: function() {
    var objects = [];
    objects.push(
      React.createElement(
        'div', 
        {
          key: "player1",
          ref:'player1',
          className : "player",
          style: {bottom : this.playerVelocity.bottom + '%', left : this.playerVelocity.bottom + '%'}
        },
        "")
    );
    objects.push(React.createElement(Bunker, {key: 'bunker', ref : 'bunker'}));
    objects.push(React.createElement('hr', {
      key: 'obj2',
      style: {
        position: 'absolute',
        bottom: '0%',
        width: '100%'
      }
    }));

    this.walls.forEach(
      (val, index) => {
        objects.push(React.createElement(Wall, {
          key: index,
          ref: "wall" + index,
          vertical: val[0],
          positionFixed: val[1],
          top: val[2],
          right: val[3],
          width: val[4],
          height: val[5],
          bricks: val[6],
          backgroundColor : val[7]
        }));
      });

    var tankGameStyle = {
      backgroundColor: 'rgba(34, 34, 34, 0.95)',
      width: this.WINDOW_WIDTH + 'px',
      height: this.WINDOW_HEIGHT + 'px',
      position: 'absolute'
    };

    return (
      React.createElement('div', {
        style: tankGameStyle
      }, objects)
    );
  }
});

// render the tank game
ReactDOM.render(
  React.createElement(TankGame, null),
  document.getElementById('content')
);