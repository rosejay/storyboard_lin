var express = require('express'),
	glob = require("glob"),
	http = require('http'),
	fs = require('fs'),
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



app.post('/user/upload', function(req, res){
	//app.redirect("/");
	console.log(req);
	
	fs.readFile(req.files.displayImage.path, function (err, data) {
		var newPath = __dirname+'/static/materials/user';
		fs.writeFile(newPath, data, function (err) {
			app.redirect("/");
		});
	});
})

app.listen(8888);