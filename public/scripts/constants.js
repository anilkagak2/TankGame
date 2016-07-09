define("Constants", [], function() {
	var BricColor = {
		naturalColor : '#87592c',
		silverColor : 'ghostwhite',
		transparent : 'transparent'
	};

	var keyCodes = {
		spaceBar: 32,
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

	var GameState = {
		PAUSED : 1,
		INPROGRESS : 2,
		OVER : 3
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
		GameState : GameState,
		CollisionBetweenRectangles : CollisionBetweenRectangles,
		RandomDirection : RandomDirection
	}
});