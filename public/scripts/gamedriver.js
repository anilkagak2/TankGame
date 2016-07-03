require(["TankGame"], function(TankGame) {
	// render the tank game
	ReactDOM.render(
		React.createElement(TankGame.TankGame, null),
		document.getElementById('content')
	);
});