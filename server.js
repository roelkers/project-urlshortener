'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var urlModel = require(__dirname+'/urlModel.js');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGOLAB_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console,'connection error:'))
db.once('open', function() {
  console.log("connected!");
});

let nextInt;
/*Get highest integer name for urls*/
urlModel.count(function(err,count){
  if(count!=0)
    nextInt = count+1
  else {
    nextInt = 1;
  }
});

/*required for testing*/
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get('/api/shorturl/:urlid(\\d+)',function(req,res){
  urlModel.find({number: req.params.urlid}, function(err,data){
    if(err){
      res.json({error: "invalid urlid"})
    }
    res.redirect(301,`${data[0].path}`);
  })
});

app.post('/api/shorturl/new',function(req,res){
  const match = req.body.url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  const url = match[2];

  dns.lookup(url, function(err,adresses){
    if(err){
      res.json({ error: "invalid URL"});
    }
    else{
      const urlObj = {
        number: nextInt,
        path: req.body.url
      };
      urlModel.create(urlObj,
        function(err,data){
          if(err)
            console.log(err);
      })
      res.json(urlObj);
      nextInt = nextInt +1;
    }
  })
})

app.listen(port, function () {
  console.log('Node.js listening on port '+port+'...');
});
