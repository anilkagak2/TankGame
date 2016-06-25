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

var Direction = {
	left : 1,
	right : 2,
	top : 3,
	bottom : 4
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
      bottom: '-4px',
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
        right: '27%'
      }
    };

    bunker.push(React.createElement(Wall, { key: 'wall2', ref: 'wall2', vertical: false, width: '10px', height: '10px' }));
    bunker.push(React.createElement(Wall, { key: 'wall1', ref: 'wall1', vertical: true, width: '10px', height: '10px', bricks:3  }));
    bunker.push(React.createElement('img', baseObjectProps, null));
    bunker.push(React.createElement(Wall, { key: 'wall3', ref: 'wall3', vertical: true, width: '10px', height: '10px', bricks:3, positionFixed: true, top: '23%', right: '0%' }));
    return (
      React.createElement('div', {
        style: bunkerStyle
      }, bunker)
    );
  }
});

// Tank object can be used as a player and as enemies
var Tank = React.createClass({
  displayName: 'Tank',
  
  getDefaultProps: function() {
    return {
      bottom: '0',
	  left: '0',
	  direction: Direction.left,
	  bgFirst: 'silver',
	  bgMiddle: '#cc9900',
	  bgLast: 'silver',
	  bgGun: 'dimgray'
    };
  },
  
  getTransformAngle: function() {
	switch(this.props.direction) {
		case Direction.left: return 'rotate(180deg)';
		case Direction.right: return 'rotate(0deg)';
		case Direction.top: return 'rotate(270deg)';
		case Direction.bottom: return 'rotate(90deg)';
	}
  },
  
  render: function() {
	var transformAngle = this.getTransformAngle();
	
	var children = [];
	children.push(React.createElement('div', {key:'first', className: "firstStripe", style: {background: this.props.bgFirst} },""));
	children.push(React.createElement('div', {key:'middle', className: "middleStripe", style: {background: this.props.bgMiddle} },""));
	children.push(React.createElement('div', {key:'last', className: "lastStripe", style: {background: this.props.bgLast} },""));
	children.push(React.createElement('div', {key:'gun', className: "gun", style: {background: this.props.bgGun}}, ""));
	
    return (
		React.createElement(
			'div', 
			{
				className: "new-player",
				style: {
					bottom : this.props.bottom + "px",
					left : this.props.left + "px",
					transform: transformAngle,
					display: 'inline'
				}
			},
			children
		)
    );
  }
});

var PLAYER_MAX_POSITIONS = {
	DIRECTION_LEFT : {
		PLAYER_LEFT_MAX : 486,
		PLAYER_LEFT_MIN : 0,
		PLAYER_BOTTOM_MAX : 506,
		PLAYER_BOTTOM_MIN : 0,
	},
	
	DIRECTION_TOP : {
		PLAYER_LEFT_MAX : 506,
		PLAYER_LEFT_MIN : 0,
		PLAYER_BOTTOM_MAX : 496,
		PLAYER_BOTTOM_MIN : 0,
	}
};

// Tank Game main control routine
var TankGame = React.createClass({
  displayName: 'TankGame',

  SPEED_INCREMENT: 5,
  WINDOW_WIDTH : 540,
  WINDOW_HEIGHT : 540,
  BUNKER_VICINITY : 0,
  WALL_VICINITY : 0,
  PLAYER_LEFT_MAX : 486,
  PLAYER_BOTTOM_MAX : 506,
  
  walls: 
  [
    // left
    [ true, true, '7%', '80%', '30px', '20px', 5 ],
    [ true, true, '7%', '65%', '30px', '20px', 5 ],
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
    [ true, true, '7%', '10%', '30px', '20px', 5 ],
    [ true, true, '7%', '25%', '30px', '20px', 5 ],
    [ true, true, '43%', '10%', '30px', '20px', 10 ],
    [ true, true, '43%', '25%', '30px', '20px', 10 ],
  ],
  
  // player speed and direction
  playerCharacteristics: {
    left : 200,
    bottom : 0,
	direction: Direction.top
  },

  updatePlayerCharacteristic: function(player, left, bottom, degree, newDirection) {
	this.playerCharacteristics.left = left;
    this.playerCharacteristics.bottom = bottom;
	this.playerCharacteristics.direction = newDirection;
    player.style.left = left + "px";
    player.style.bottom = bottom + "px";
	player.style.transform = "rotate(" + degree + "deg)";
  },
  
  getPlayerMaxPositionsForDirection: function() {
	switch(this.playerCharacteristics.direction) {
		case Direction.top:
		case Direction.bottom:
			return PLAYER_MAX_POSITIONS.DIRECTION_TOP;
		case Direction.left:
		case Direction.right:
			return PLAYER_MAX_POSITIONS.DIRECTION_LEFT;
	}
  },
  
  getAngleFromDirection: function(direction) {
	switch(direction) {
		case Direction.top: return 270;
		case Direction.bottom: return 90;
		case Direction.left: return 180;
		case Direction.right: return 0;
	}
  },
  
  keyDownHandler : function(event) {
    var oldLeft = this.playerCharacteristics.left;
    var oldBottom = this.playerCharacteristics.bottom;
	var oldDirection = this.playerCharacteristics.direction;
	var oldAngle = this.getAngleFromDirection(oldDirection);
	var newAngle = 0;

    switch(event.keyCode) {
      case keyCodes.leftArrow:
        this.playerCharacteristics.left -= this.SPEED_INCREMENT;
		newAngle = 180;
		this.playerCharacteristics.direction = Direction.left;
        break;
      case keyCodes.upArrow:
        this.playerCharacteristics.bottom += this.SPEED_INCREMENT;
		newAngle = 270;
		this.playerCharacteristics.direction = Direction.top;
        break;
      case keyCodes.rightArrow:
        this.playerCharacteristics.left += this.SPEED_INCREMENT;
		newAngle = 0;
		this.playerCharacteristics.direction = Direction.right;
        break;
      case keyCodes.downArrow:
        this.playerCharacteristics.bottom -= this.SPEED_INCREMENT;
		newAngle = 90;
		this.playerCharacteristics.direction = Direction.bottom;
        break;
      default:
        return;
    }

	var playerMaxPositions = this.getPlayerMaxPositionsForDirection();
    if (this.playerCharacteristics.left<playerMaxPositions.PLAYER_LEFT_MIN)
		this.playerCharacteristics.left = playerMaxPositions.PLAYER_LEFT_MIN;

    if (this.playerCharacteristics.bottom<playerMaxPositions.PLAYER_BOTTOM_MIN)
		this.playerCharacteristics.bottom = playerMaxPositions.PLAYER_BOTTOM_MIN;

    if (this.playerCharacteristics.left>playerMaxPositions.PLAYER_LEFT_MAX)
		this.playerCharacteristics.left = playerMaxPositions.PLAYER_LEFT_MAX;

    if (this.playerCharacteristics.bottom>playerMaxPositions.PLAYER_BOTTOM_MAX)
		this.playerCharacteristics.bottom = playerMaxPositions.PLAYER_BOTTOM_MAX;

    // set the value currently, so that we can revert in case it does not fit
	var player = ReactDOM.findDOMNode(this.refs.player1);
	if (oldDirection != this.playerCharacteristics.direction) {
		player.style.transform = "rotate(" + newAngle + "deg)";
	} else {
		player.style.left = this.playerCharacteristics.left.toString() + "px";
		player.style.bottom = this.playerCharacteristics.bottom.toString() + "px";
	}

    var playerRect = player.getBoundingClientRect();

    // check if collides with bunker
    if (this.refs.bunker.checkCollision(playerRect, this.BUNKER_VICINITY)) {
		this.updatePlayerCharacteristic(player, oldLeft, oldBottom, oldAngle, oldDirection);
		return;
    }

    // check if collides with the walls
    for (var i=0; i<this.walls.length; ++i) {
      var wallString = "wall" + i;
      var wallReference = this.refs[wallString];
      var collisionOccurred = wallReference.checkCollision(playerRect, this.WALL_VICINITY);

      if (collisionOccurred) {
		this.updatePlayerCharacteristic(player, oldLeft, oldBottom, oldAngle, oldDirection);
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

	objects.push(React.createElement(Tank, {key: 'Tank', ref : 'player1', left: this.playerCharacteristics.left, bottom: this.playerCharacteristics.bottom, direction: this.playerCharacteristics.direction}));

	objects.push(React.createElement(Tank, {key: 'enemy2', ref : 'enemy2', left: '0', bottom: '506', direction: Direction.right, bgFirst: 'silver', bgMiddle: 'ghostwhite', bgLast: 'silver', bgGun: 'cadetblue'}));
	objects.push(React.createElement(Tank, {key: 'enemy1', ref : 'enemy1', left: '506', bottom: '506',  direction: Direction.left, bgFirst: 'silver', bgMiddle: 'ghostwhite', bgLast: 'silver', bgGun: 'cadetblue'}));

    objects.push(React.createElement(Bunker, {key: 'bunker', ref : 'bunker'}));

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