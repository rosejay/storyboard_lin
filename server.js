var express = require('express'),
	glob = require("glob"),
	http = require('http'),
	fs = require('fs'),
	upload = require('jquery-file-upload-middleware'),
    app = express();

app.use(express.static(__dirname+'/static'));
app.use(express.bodyParser());
app.use(express.cookieParser());

upload.configure({
    uploadDir: __dirname + '/materials/uploads',
    uploadUrl: '/uploads',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80
        }
    }
});
app.use('/upload', upload.fileHandler())

app.get('/get/files', function(req, res){
	glob("static/materials/**/*.jpeg", {}, function (er, files) {
	  res.send({
	  	files : files
	  });
	})
})

app.listen(8888);