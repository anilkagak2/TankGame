define("Constants", [], function() {
	var BricColor = {
		naturalColor : '#87592c',
		silverColor : 'ghostwhite',
		transparent : 'transparent'
	};

	var keyCodes = {
		leftArrow: 37,
		upArrow: 38,
		rightArrow: 39,
		downArrow: 40,
		fire: 70
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

	var RandomNumberBetweenXAndY = function(X, Y) {
		return Math.floor((Math.random() * Y) + X);
	}

	var RandomDirection = function() {
		return RandomNumberBetweenXAndY(1,4);
	}
	
	return {
		BricColor : BricColor,
		keyCodes : keyCodes,
		Direction : Direction,
		CollisionBetweenRectangles : CollisionBetweenRectangles,
		RandomDirection : RandomDirection
	}
});
define("Brick", ["Constants"], function(Constants) {
	// Base Unit of wall
	var Brick = React.createClass({
		displayName: 'Brick',

		getInitialState: function(){
			return {
				destroyed: false
			};
		},
	  
		getDefaultProps: function() {
			return {
				backgroundColor: Constants.BricColor.naturalColor,
				width: '20px',
				height: '10px',
				destroyed: false
			};
		},

		checkCollision : function(playerRect, vicinity, isBullet) {
			// if the brick has been destroyed, no point in checking collision
			if (this.state.destroyed) return false;

			var domNode = ReactDOM.findDOMNode(this.refs.brick);
			var domRect = domNode.getBoundingClientRect();
			var collided = Constants.CollisionBetweenRectangles(playerRect, domRect, vicinity);
		
			if (isBullet && collided && this.props.backgroundColor != Constants.BricColor.silverColor) {
				this.setState({
					destroyed : true
				});
			}
		
			return collided;
		},

		render: function() {
			var tankStyle = {
				backgroundColor: this.state.destroyed ? Constants.BricColor.transparent : this.props.backgroundColor,
				width: this.props.width,
				height: this.props.height,
				border: this.state.destroyed ? "3px solid transparent" : "3px solid black"
			};

			return (
				React.createElement('div', {
					ref : 'brick',
					style: tankStyle
				}, "")
			);
		}
	});
	
	return {
		Brick : Brick
	}
});
define("Wall", ["Constants", "Brick"], function(Constants, Brick) {
	// Wall consists of many bricks
	var Wall = React.createClass({
	  displayName: 'Wall',

	  getDefaultProps: function() {
		return {
		  backgroundColor: Constants.BricColor.naturalColor,
		  width: '20px',
		  height: '10px',
		  bricks: 5,
		  vertical: true,
		  positionFixed: false,
		  top: '15%',
		  right: '60%'
		};
	  },

	  checkCollision: function(playerRect, vicinity, isBullet) {
		for (var i = 0; i < this.props.bricks; ++i) {
		  var brickReference = this.refs["brick" + i];
		  if (brickReference.checkCollision(playerRect, vicinity, isBullet)) {
			return true;
		  }
		}
		
		return false;
	  },

	  render: function() {
		var bricks = [];
		for (var i = 0; i < this.props.bricks; ++i) {
		  bricks.push(React.createElement(
			Brick.Brick, {
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

	return {
		Wall : Wall
	}
});
define("Tank", ["Constants"], function(Constants) {

	// Tank object can be used as a player and as enemies
	var Tank = React.createClass({
	  displayName: 'Tank',
	  
	  getDefaultProps: function() {
		return {
		  bottom: '0',
		  left: '0',
		  direction: Constants.Direction.left,
		  bgFirst: 'silver',
		  bgMiddle: '#cc9900',
		  bgLast: 'silver',
		  bgGun: 'dimgray'
		};
	  },
	  
	  getTransformAngle: function() {
		switch(this.props.direction) {
			case Constants.Direction.left: return 'rotate(180deg)';
			case Constants.Direction.right: return 'rotate(0deg)';
			case Constants.Direction.top: return 'rotate(270deg)';
			case Constants.Direction.bottom: return 'rotate(90deg)';
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

	return {
		Tank : Tank
	}
});
define("Bullet", [], function(){
	var Bullet = React.createClass({
	  displayName: 'Bullet',
	  
	  render: function() {
		return (
			React.createElement(
				'div', 
				{
					className: "bullet",
					style: {
						bottom : this.props.bottom + "px",
						left : this.props.left + "px"
					}
				},
				""
			)
		);
	  }
	});

	return {
		Bullet : Bullet
	}
});
define("Bunker", ["Wall"], function(Wall) {

	// Bunker Object which needs to be protected
	var Bunker = React.createClass({
	  displayName: 'Bunker',
	  
	  checkCollision: function(playerRect, vicinity, isBullet) {
		for (var i = 1; i <= 3; ++i) {
		  var wallReference = this.refs["wall" + i];
		  if (wallReference.checkCollision(playerRect, vicinity, isBullet)) {
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

		bunker.push(React.createElement(Wall.Wall, { key: 'wall2', ref: 'wall2', vertical: false, width: '10px', height: '10px' }));
		bunker.push(React.createElement(Wall.Wall, { key: 'wall1', ref: 'wall1', vertical: true, width: '10px', height: '10px', bricks:3  }));
		bunker.push(React.createElement('img', baseObjectProps, null));
		bunker.push(React.createElement(Wall.Wall, { key: 'wall3', ref: 'wall3', vertical: true, width: '10px', height: '10px', bricks:3, positionFixed: true, top: '23%', right: '0%' }));
		return (
		  React.createElement('div', {
			style: bunkerStyle
		  }, bunker)
		);
	  }
	});

	
	return {
		Bunker : Bunker
	}
});
define("TankGame", ["Constants", "Brick", "Wall", "Tank", "Bullet", "Bunker"], function(Constants, Brick, Wall, Tank, Bullet, Bunker) {
	var PLAYER_MAX_POSITIONS = {
		DIRECTION_LEFT : {
			PLAYER_LEFT_MAX : 506,
			PLAYER_LEFT_MIN : 0,
			PLAYER_BOTTOM_MAX : 506,
			PLAYER_BOTTOM_MIN : 0,
		},
		
		DIRECTION_TOP : {
			PLAYER_LEFT_MAX : 506,
			PLAYER_LEFT_MIN : 0,
			PLAYER_BOTTOM_MAX : 506,
			PLAYER_BOTTOM_MIN : 0,
		}
	};

	var BULLET_MAX_POSITIONS = {
		DIRECTION : {
			PLAYER_LEFT_MAX : 526,
			PLAYER_LEFT_MIN : 0,
			PLAYER_BOTTOM_MAX : 526,
			PLAYER_BOTTOM_MIN : 0,
		}
	};

	var DIRECTION_CHANGE_TIME = 20;
	var BULLET_FIRE_GAP = 30;
	var WINDOW_WIDTH = 540;
	var WINDOW_HEIGHT = 540;
	var SPEED_INCREMENT = 5;
	var BULLET_INCREMENT = 15;
	var BUNKER_VICINITY = 0;
	var WALL_VICINITY = 0;

	// Tank Game main control routine
	var TankGame = React.createClass({
	  displayName: 'TankGame',

	  walls: 
	  [
		// left
		[ true, true, '7%', '80%', '30px', '20px', 5 ],
		[ true, true, '7%', '65%', '30px', '20px', 5 ],
		[ true, true, '43%', '80%', '30px', '20px', 10 ],
		[ true, true, '43%', '65%', '30px', '20px', 10 ],
		
		// silver bricks
		[ true, true, '29%', '0%', '30px', '20px', 2, Constants.BricColor.silverColor ],
		[ false, true, '33%', '84%', '30px', '20px', 2, Constants.BricColor.silverColor ],
		
		// center
		[ true, true, '10%', '40%', '40px', '20px', 7 ],
		[ true, true, '10%', '50%', '30px', '20px', 7 ],
		[ true, true, '43%', '40%', '40px', '7px', 3, Constants.BricColor.silverColor ],
		[ true, true, '43%', '50%', '30px', '7px', 3, Constants.BricColor.silverColor ],
		[ true, true, '50%', '40%', '40px', '20px', 5 ],
		[ true, true, '50%', '50%', '30px', '20px', 5 ],
		
		// right
		[ true, true, '7%', '10%', '30px', '20px', 5 ],
		[ true, true, '7%', '25%', '30px', '20px', 5 ],
		[ true, true, '43%', '10%', '30px', '20px', 10 ],
		[ true, true, '43%', '25%', '30px', '20px', 10 ],
	  ],
	  
	  // bullets positions and orientation
	  bullets :[],
	  
	  lastFiredTime: 0,
	  
	  // enemy characteristics (positions, directions)
	  enemyCharacteristics: [
		{
			left: 506,
			bottom: 506,
			direction: Constants.Direction.left,
			bgFirst: 'silver',
			bgMiddle: 'ghostwhite',
			bgLast: 'silver',
			bgGun: 'cadetblue',
			lastDirectionChangeTime: 0,
			readyToFire: true,
			source: 'enemy'
		},
		{
			left: 0,
			bottom: 506,
			direction: Constants.Direction.right,
			bgFirst: 'silver',
			bgMiddle: 'ghostwhite',
			bgLast: 'silver',
			bgGun: 'cadetblue',
			lastDirectionChangeTime: 0,
			readyToFire: true,
			source: 'enemy'
		}
	  ],
	  
	  // player speed and direction
	  playerCharacteristics: {
		left : 200,
		bottom : 0,
		direction: Constants.Direction.top,
		readyToFire: true,
		source: 'player'
	  },

	  getInitialState: function(){
		return {
			time: this.getNewTimeValue()
		};
	  },
	  
	  getNewTimeValue: function() {
		return Math.floor((Date.now() / 5000));
	  },
	  
	  tick : function() {
		var t = this.getNewTimeValue();

		// 1
		// do this for all the enemies
		// change direction if not changed for given time
		// increase the position as per direction
		this.enemyCharacteristics.forEach(
		  (enemy, index) => {
			enemy.lastDirectionChangeTime += 1;
			if (enemy.lastDirectionChangeTime > DIRECTION_CHANGE_TIME) {
				enemy.lastDirectionChangeTime = 0;
				enemy.direction = Constants.RandomDirection();
			} else {
				var oldLeft = enemy.left, oldBottom = enemy.bottom;
				var oldDirection = enemy.direction, oldAngle = this.getAngleFromDirection(enemy.direction);
			
				enemy.left -= (enemy.direction == Constants.Direction.left)?SPEED_INCREMENT:0;
				enemy.left += (enemy.direction == Constants.Direction.right)?SPEED_INCREMENT:0;
				enemy.bottom += (enemy.direction == Constants.Direction.top)?SPEED_INCREMENT:0;
				enemy.bottom -= (enemy.direction == Constants.Direction.bottom)?SPEED_INCREMENT:0;
				
				var playerMaxPositions = this.getPlayerMaxPositionsForDirection(enemy.direction);
				if (enemy.left<playerMaxPositions.PLAYER_LEFT_MIN) enemy.left = playerMaxPositions.PLAYER_LEFT_MIN;
				if (enemy.bottom<playerMaxPositions.PLAYER_BOTTOM_MIN) enemy.bottom = playerMaxPositions.PLAYER_BOTTOM_MIN;
				if (enemy.left>playerMaxPositions.PLAYER_LEFT_MAX) enemy.left = playerMaxPositions.PLAYER_LEFT_MAX;
				if (enemy.bottom>playerMaxPositions.PLAYER_BOTTOM_MAX) enemy.bottom = playerMaxPositions.PLAYER_BOTTOM_MAX;

				var enemyTank = ReactDOM.findDOMNode(this.refs['enemy' + index]);
				enemyTank.style.left = enemy.left.toString() + "px";
				enemyTank.style.bottom = enemy.bottom.toString() + "px";
				var playerRect = enemyTank.getBoundingClientRect();
				if (this.checkObjectCollision(playerRect, false)) {
					this.updatePlayerCharacteristic(enemy, enemyTank, oldLeft, oldBottom, oldAngle, oldDirection);
				}

				this.fireBullet(enemy);
			}
		  });

		// 2 TODOs
		// traverse the bullet journey
		// Vanish when reaches a boundary or hit some object
		// Also vanish the affected object
		this.bullets.forEach(
		  (bullet, index, object) => {
			bullet.left -= (bullet.direction == Constants.Direction.left)?BULLET_INCREMENT:0;
			bullet.left += (bullet.direction == Constants.Direction.right)?BULLET_INCREMENT:0;
			bullet.bottom += (bullet.direction == Constants.Direction.top)?BULLET_INCREMENT:0;
			bullet.bottom -= (bullet.direction == Constants.Direction.bottom)?BULLET_INCREMENT:0;
			
			var bulletMaxPositions = this.getBulletMaxPositionsForDirection(bullet.direction);
			var deleteBullet = false;
			if (bullet.left<bulletMaxPositions.PLAYER_LEFT_MIN) deleteBullet = true;
			if (bullet.bottom<bulletMaxPositions.PLAYER_BOTTOM_MIN) deleteBullet = true;
			if (bullet.left>bulletMaxPositions.PLAYER_LEFT_MAX) deleteBullet = true;
			if (bullet.bottom>bulletMaxPositions.PLAYER_BOTTOM_MAX) deleteBullet = true;
			
			if (!deleteBullet) {
				var bulletNode = ReactDOM.findDOMNode(this.refs['bullet' + index]);
				if (bulletNode) {
					var bulletRect = bulletNode.getBoundingClientRect();
					if (this.checkObjectCollision(bulletRect, true)) deleteBullet = true;
				}
			}

			if (deleteBullet) object.splice(index, 1);
		  });
		
		requestAnimationFrame(this.tick);
		this.setState({
			time : t
		}); 
	  },

	  updatePlayerCharacteristic: function(playerCharacteristics, player, left, bottom, degree, direction) {
		playerCharacteristics.left = left;
		playerCharacteristics.bottom = bottom;
		playerCharacteristics.direction = direction;
		player.style.left = left + "px";
		player.style.bottom = bottom + "px";
		player.style.transform = "rotate(" + degree + "deg)";
	  },
	  
	  getPlayerMaxPositionsForDirection: function(direction) {
		switch(direction) {
			case Constants.Direction.top:
			case Constants.Direction.bottom:
				return PLAYER_MAX_POSITIONS.DIRECTION_TOP;
			case Constants.Direction.left:
			case Constants.Direction.right:
				return PLAYER_MAX_POSITIONS.DIRECTION_LEFT;
		}
	  },
	  
	  getBulletMaxPositionsForDirection: function(direction) {
		switch(direction) {
			case Constants.Direction.top:
			case Constants.Direction.bottom:
			case Constants.Direction.left:
			case Constants.Direction.right:
				return BULLET_MAX_POSITIONS.DIRECTION;
		}
	  },
	  
	  getBulletPositionFromSource: function(direction, left, bottom) {
		var bulletLeft = left, bulletBottom = bottom;
		switch(direction) {
			case Constants.Direction.top:
				bulletLeft += 10;
				bulletBottom += 10;
				break;
			case Constants.Direction.bottom:
				bulletLeft += 10;
				bulletBottom -= 10;
				break;
			case Constants.Direction.left:
				bulletLeft -= 10;
				bulletBottom += 10;
				break;
			case Constants.Direction.right:
				bulletLeft += 10;
				bulletBottom += 10;
				break;
		}

		return {left: bulletLeft, bottom: bulletBottom};
	  },
	  
	  getAngleFromDirection: function(direction) {
		switch(direction) {
			case Constants.Direction.top: return 270;
			case Constants.Direction.bottom: return 90;
			case Constants.Direction.left: return 180;
			case Constants.Direction.right: return 0;
		}
	  },
	  
	  fireBullet: function(playerCharacteristics) {	
		if (playerCharacteristics.readyToFire) {
			playerCharacteristics.readyToFire = false;

			var source = playerCharacteristics.source;
			var direction = playerCharacteristics.direction;
			var left = playerCharacteristics.left;
			var bottom = playerCharacteristics.bottom;
			var bulletPosition = this.getBulletPositionFromSource(direction, left, bottom);

			this.bullets.push({
				left: bulletPosition.left,
				bottom: bulletPosition.bottom,
				direction: direction,
				source: source
			});
		}
	  },
	  
	  keyDownHandler : function(event) {
		var oldLeft = this.playerCharacteristics.left;
		var oldBottom = this.playerCharacteristics.bottom;
		var oldDirection = this.playerCharacteristics.direction;
		var oldAngle = this.getAngleFromDirection(oldDirection);
		var newAngle = 0;

		switch(event.keyCode) {
		  case Constants.keyCodes.leftArrow:
			this.playerCharacteristics.left -= SPEED_INCREMENT;
			newAngle = 180;
			this.playerCharacteristics.direction = Constants.Direction.left;
			break;
		  case Constants.keyCodes.upArrow:
			this.playerCharacteristics.bottom += SPEED_INCREMENT;
			newAngle = 270;
			this.playerCharacteristics.direction = Constants.Direction.top;
			break;
		  case Constants.keyCodes.rightArrow:
			this.playerCharacteristics.left += SPEED_INCREMENT;
			newAngle = 0;
			this.playerCharacteristics.direction = Constants.Direction.right;
			break;
		  case Constants.keyCodes.downArrow:
			this.playerCharacteristics.bottom -= SPEED_INCREMENT;
			newAngle = 90;
			this.playerCharacteristics.direction = Constants.Direction.bottom;
			break;
		  case Constants.keyCodes.fire:
			this.fireBullet(this.playerCharacteristics);
			return;
		  default:
			return;
		}

		// set the value currently, so that we can revert in case it does not fit
		var player = ReactDOM.findDOMNode(this.refs.player1);
		if (oldDirection != this.playerCharacteristics.direction) {
			player.style.transform = "rotate(" + newAngle + "deg)";
		} else {
			var playerMaxPositions = this.getPlayerMaxPositionsForDirection(this.playerCharacteristics.direction);
			if (this.playerCharacteristics.left<playerMaxPositions.PLAYER_LEFT_MIN)
				this.playerCharacteristics.left = playerMaxPositions.PLAYER_LEFT_MIN;

			if (this.playerCharacteristics.bottom<playerMaxPositions.PLAYER_BOTTOM_MIN)
				this.playerCharacteristics.bottom = playerMaxPositions.PLAYER_BOTTOM_MIN;

			if (this.playerCharacteristics.left>playerMaxPositions.PLAYER_LEFT_MAX)
				this.playerCharacteristics.left = playerMaxPositions.PLAYER_LEFT_MAX;

			if (this.playerCharacteristics.bottom>playerMaxPositions.PLAYER_BOTTOM_MAX)
				this.playerCharacteristics.bottom = playerMaxPositions.PLAYER_BOTTOM_MAX;

			player.style.left = this.playerCharacteristics.left.toString() + "px";
			player.style.bottom = this.playerCharacteristics.bottom.toString() + "px";
			
			var playerRect = player.getBoundingClientRect();
			if (this.checkObjectCollision(playerRect, false)) {
				this.updatePlayerCharacteristic(this.playerCharacteristics, player, oldLeft, oldBottom, oldAngle, oldDirection);
			}
		}
	  },

	  checkObjectCollision: function(objectRect, isBullet) {
		// check if it collides with bunker
		if (this.refs.bunker.checkCollision(objectRect, BUNKER_VICINITY, isBullet)) {
			return true;
		}

		// check if it collides with the walls
		for (var i=0; i<this.walls.length; ++i) {
		  var wallString = "wall" + i;
		  var wallReference = this.refs[wallString];
		  var collisionOccurred = wallReference.checkCollision(objectRect, WALL_VICINITY, isBullet);

		  if (collisionOccurred) {
			return true;
		  }
		}

		return false;
	  },
	  
	  keyUpHandler : function(event) {
	  },

	  componentWillMount: function(){
		requestAnimationFrame( this.tick );
	  },
	  
	  componentDidMount : function() {
		window.addEventListener('keydown', this.keyDownHandler, true);
		window.addEventListener('keyup', this.keyUpHandler, true);
	  },

	  componentDidUpdate : function() {
		this.lastFiredTime += 1;
		if (this.lastFiredTime > BULLET_FIRE_GAP) {
			this.lastFiredTime = 0;
			this.playerCharacteristics.readyToFire = true;
			this.enemyCharacteristics.forEach(
			(enemy, index) => {
				enemy.readyToFire = true;
			});
		}
	  },

	  componentWillUnmount : function () {
		window.removeEventListener('keydown', keyDownHandler);
		window.removeEventListener('keyup', keyUpHandler);
	  },
	  
	  render: function() {  
		var objects = [];
		objects.push(React.createElement(Tank.Tank, {key: 'Tank', ref : 'player1', left: this.playerCharacteristics.left, bottom: this.playerCharacteristics.bottom, direction: this.playerCharacteristics.direction}));
		objects.push(React.createElement(Bunker.Bunker, {key: 'bunker', ref : 'bunker'}));
		
		this.bullets.forEach(
		  (bullet, index) => {
				objects.push(React.createElement(Bullet.Bullet, {
					key: 'bullet' + index,
					ref : 'bullet' + index,
					left: bullet.left,
					bottom: bullet.bottom,
					direction: bullet.direction,
					source: 'player'
				}));
			}
		);

		this.enemyCharacteristics.forEach(
		  (enemy, index) => {
				objects.push(React.createElement(Tank.Tank, {
					key: 'enemy' + index,
					ref : 'enemy' + index,
					left: enemy.left,
					bottom: enemy.bottom,
					direction: enemy.direction,
					bgFirst: enemy.bgFirst,
					bgMiddle: enemy.bgMiddle,
					bgLast: enemy.bgLast,
					bgGun: enemy.bgGun
				}));
			}
		);
		
		this.walls.forEach(
		  (val, index) => {
			objects.push(React.createElement(Wall.Wall, {
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
		  width: WINDOW_WIDTH + 'px',
		  height: WINDOW_HEIGHT + 'px',
		  position: 'absolute'
		};

		return (
		  React.createElement('div', {
			style: tankGameStyle
		  }, objects)
		);
	  }
	});

	return {
		TankGame : TankGame
	}
});
require(["TankGame"], function(TankGame) {
	// render the tank game
	ReactDOM.render(
		React.createElement(TankGame.TankGame, null),
		document.getElementById('content')
	);
});
define("gamedriver", function(){});

