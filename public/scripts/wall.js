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