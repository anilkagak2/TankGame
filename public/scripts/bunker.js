define("Bunker", ["Constants", "Wall"], function(Constants, Wall) {

	// Bunker Object which needs to be protected
	var Bunker = React.createClass({
	  displayName: 'Bunker',
	  
	  reset: function() {
		for (var i = 1; i <= 3; ++i) {
		  var wallReference = this.refs["wall" + i];
		  wallReference.reset();
		}
	  },
	  
	  checkCollision: function(playerRect, vicinity, isBullet) {
		for (var i = 1; i <= 3; ++i) {
		  var wallReference = this.refs["wall" + i];
		  if (wallReference.checkCollision(playerRect, vicinity, isBullet)) {
			return Constants.CollisionOutput.COLLISION;
		  }
		}
		
		var domNode = ReactDOM.findDOMNode(this.refs["bunkerTarget"]);
		var domRect = domNode.getBoundingClientRect();
		if ( Constants.CollisionBetweenRectangles(playerRect, domRect, vicinity) ) {
			if (isBullet) {
				return Constants.CollisionOutput.BUNKER_DESTROYED;
			}
			else {
				return Constants.CollisionOutput.COLLISION;
			}
		}
		
		return Constants.CollisionOutput.NO_COLLISION;
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
		  ref: "bunkerTarget",
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