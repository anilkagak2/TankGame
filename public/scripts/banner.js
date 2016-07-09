define("Banner", [], function() {
	// Base Unit of wall
	var Banner = React.createClass({
		displayName: 'Banner',

		getDefaultProps: function() {
			return {
				visible: true,
				text: ""
			};
		},

		render: function() {
			var bannerStyle = {
				display: this.props.visible? 'block' : 'none',
			};

			var bannerBackground = React.createElement('div', {key:'bannerBackground', className: 'banner'}, "");
			var bannerBox = React.createElement('div', {key:'bannerBox', className: 'bannerBox'}, this.props.text);
			return (
				React.createElement('div', {
					style: bannerStyle,
				}, [bannerBackground, bannerBox])
			);
		}
	});

	return {
		Banner : Banner
	}
});