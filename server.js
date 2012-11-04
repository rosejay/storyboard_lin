var express = require('express'),
	glob = require("glob"),
	http = require('http'),
    app = express.createServer();

app.use(express.static(__dirname+'/static'));
app.use(express.bodyParser());
app.use(express.cookieParser());

app.get('/get/files', function(req, res){
	glob("static/materials/**/*.jpeg", {}, function (er, files) {
	  res.send({
	  	files : files
	  });
	})
})


app.listen(8888);