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