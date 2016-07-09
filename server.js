var express = require('express');
var app = express();
var requirejs = require('requirejs');

var config = {
    baseUrl: './public/scripts/',
    name: 'gamedriver',
    out: './public/script.js'
};

requirejs.optimize(config, function (buildResponse) {
    //buildResponse is just a text output of the modules
    //included. Load the built file for the contents.
    //Use config.out to get the optimized file contents.
	console.log("optimizing");
    var contents = fs.readFileSync(config.out, 'utf8');
}, function(err) {
	console.log("failed");
	console.log(err);
    //optimization err callback
});

// New call to compress content
app.use(express.compress());
app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || 3000);