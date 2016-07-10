define("TankGame", ["Constants", "Brick", "Wall", "Tank", "Bullet", "Bunker", "Banner"], function(Constants, Brick, Wall, Tank, Bullet, Bunker, Banner) {
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
	
	var DefaultEnemy1 = {
		left: 506,
		bottom: 506,
		direction: Constants.Direction.left,
		bgFirst: 'silver',
		bgMiddle: 'ghostwhite',
		bgLast: 'silver',
		bgGun: 'cadetblue',
		lastDirectionChangeTime: 0,
		readyToFire: true,
		source: 'enemy1'
	};
	
	var DefaultEnemy2 = {
		left: 0,
		bottom: 506,
		direction: Constants.Direction.right,
		bgFirst: 'silver',
		bgMiddle: 'ghostwhite',
		bgLast: 'silver',
		bgGun: 'cadetblue',
		lastDirectionChangeTime: 0,
		readyToFire: true,
		source: 'enemy2'
	};
	
	var DefaultPlayer1 = {
		left : 200,
		bottom : 0,
		direction: Constants.Direction.top,
		readyToFire: true,
		source: 'player1'
	};

	var DefaultWalls = [
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
	];
	
	// Tank Game main control routine
	var TankGame = React.createClass({
	  displayName: 'TankGame',

	  walls: DefaultWalls,
	  bullets :[],
	  lastFiredTime: 0,
	  enemyCharacteristics: [ Object.create( DefaultEnemy1 ), Object.create(  DefaultEnemy2 ) ],
	  playerCharacteristics: Object.create( DefaultPlayer1 ),

	  resetGame: function() {
		this.bullets = [];
		this.lastFiredTime = 0;
		this.enemyCharacteristics = [ Object.create( DefaultEnemy1 ), Object.create(  DefaultEnemy2 ) ];
		this.playerCharacteristics = Object.create( DefaultPlayer1 );
		
		this.walls.forEach(
		  (val, index) => {
			var wallRef = this.refs["wall" + index];
			wallRef.reset();
		  });

		var bunkerRef = this.refs.bunker;
		bunkerRef.reset();
		this.setState({
			time : 0,
			gameState : Constants.GameState.PAUSED
		});
	  },
	  
	  getInitialState: function(){
		return {
			time: this.getNewTimeValue(),
			gameState: Constants.GameState.PAUSED
		};
	  },
	  
	  getNewTimeValue: function() {
		return Math.floor((Date.now() / 5000));
	  },
	  
	  getBannerText: function() {
		switch(this.state.gameState) {
			case Constants.GameState.PAUSED: return "PAUSED";
			case Constants.GameState.INPROGRESS: return "INPROGRESS";
			case Constants.GameState.OVER: return "GAME OVER";
		}
	  },

	  tick : function() {
		// stop any action if Game is in Paused state
		if (this.state.gameState !== Constants.GameState.INPROGRESS) return;

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
				if (this.checkObjectCollision('enemy' + index, playerRect, false, "")) {
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
					if (this.checkObjectCollision('bullet' + index, bulletRect, true, bullet.source)) deleteBullet = true;
				}
			}

			if (deleteBullet) object.splice(index, 1);
		  });

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
	  
	  handleSpaceBarPress: function() {
		switch(this.state.gameState) {
			case Constants.GameState.PAUSED:
				this.setState({
					gameState: Constants.GameState.INPROGRESS
				});
				break;
			case Constants.GameState.INPROGRESS:
				this.setState({
					gameState: Constants.GameState.PAUSED
				});

				break;
			case Constants.GameState.OVER:
				this.resetGame();
				break;
		}
	  },

	  keyDownHandler : function(event) {
		// handle space bar events
		if (event.keyCode === Constants.keyCodes.spaceBar) {
			this.handleSpaceBarPress();
			return;
		}

		// stop any action if Game is in Paused state
		if (this.state.gameState !== Constants.GameState.INPROGRESS) return;

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
			if (this.checkObjectCollision("player1", playerRect, false, "")) {
				this.updatePlayerCharacteristic(this.playerCharacteristics, player, oldLeft, oldBottom, oldAngle, oldDirection);
			}
		}
	  },

	  willObjectBeDestroyed: function(objectType, isBullet, bulletSource) {
		return isBullet && (bulletSource.indexOf(objectType) === -1);
	  },
	  
	  checkObjectCollision: function(objectRefString, objectRect, isBullet, bulletSource) {
		// check if it collides with bunker
		var bunkerCollisionOutput = this.refs.bunker.checkCollision(objectRect, BUNKER_VICINITY, isBullet);
		if (bunkerCollisionOutput == Constants.CollisionOutput.BUNKER_DESTROYED) {
			this.setState({
				gameState: Constants.GameState.OVER
			});
			return true;
		}
		
		if (bunkerCollisionOutput == Constants.CollisionOutput.COLLISION) {
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

		// check if collides with player
		var willPlayerBeDestroyed = this.willObjectBeDestroyed('player', isBullet, bulletSource);
		if (objectRefString !== 'player1' && willPlayerBeDestroyed) {
			var player = this.refs.player1;
			var collidedWithPlayer = player.checkCollision(objectRect, 0, isBullet);
			if (collidedWithPlayer !== Constants.CollisionOutput.NO_COLLISION) {
				if (collidedWithPlayer === Constants.CollisionOutput.TANK_DESTROYED) {
					this.setState({
						gameState: Constants.GameState.OVER
					});
				}
				return true;
			}
		}

		// check if collides with enemy
		this.enemyCharacteristics.forEach(
		  (enemy, index, object) => {
			var enemyRefString = 'enemy' + index;
			var willEnemyBeDestroyed = this.willObjectBeDestroyed('enemy', isBullet, bulletSource);
			if (objectRefString !== enemyRefString && willEnemyBeDestroyed) {
				var enemyTank = this.refs['enemy' + index];
				var collisionOutput = enemyTank.checkCollision(objectRect, 0, isBullet);
				if (collisionOutput !== Constants.CollisionOutput.NO_COLLISION) {
					if (collisionOutput === Constants.CollisionOutput.TANK_DESTROYED) {
						object.splice(index, 1);
					}
					return true;
				}
			}
		  });
		
		return false;
	  },
	  
	  keyUpHandler : function(event) {
	  },

	  componentWillMount: function(){
		requestAnimationFrame( this.tick );
	  },
	  
	  componentWillUpdate: function(){
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
		objects.push(React.createElement(Banner.Banner, {key: 'Banner', text: this.getBannerText(), visible: this.state.gameState !== Constants.GameState.INPROGRESS}));
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
					source: bullet.source
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