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
	  
	  checkCollision: function(playerRect, vicinity, isBullet) {		
		var domNode = ReactDOM.findDOMNode(this.refs["tank"]);
		var domRect = domNode.getBoundingClientRect();
		if ( Constants.CollisionBetweenRectangles(playerRect, domRect, vicinity) ) {
			if (isBullet) {
				return Constants.CollisionOutput.TANK_DESTROYED;
			}
			else {
				return Constants.CollisionOutput.COLLISION;
			}
		}

		return Constants.CollisionOutput.NO_COLLISION;
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
					ref: "tank",
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