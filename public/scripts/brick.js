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