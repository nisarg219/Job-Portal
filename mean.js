var express = require('express'),
    app = express(),
    mongojs = require("mongojs"),
    bodyParser = require('body-parser'),
    mongoClient = require('mongodb').MongoClient;


var mongoose = require('mongoose');

var expressSession = require('express-session');
app.use(expressSession({secret:'Nisarg', saveUninitialized: false, resave: false}));

mongoose.connect('mongodb://localhost:27017/js_june');

var db = mongoose.connection;

var Schema = mongoose.Schema;
var jobPostSchema = new Schema({
    jobTitle: String,
    jobDescription: String,
    location: String,
    keywords: String
}, {collection: 'job-posts'});
var jobPost = mongoose.model('jobPosts', jobPostSchema);


app.use(express.static('public'));

app.use(bodyParser.urlencoded({'extended':false}));

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(__dirname+'/index.html');
});

app.post('/postData', function(req, res) {
    var fname = req.body.fname,
        lname = req.body.lname,
        emailid = req.body.emailid,
        password = req.body.password,
        userid = req.body.userid,
        phoneno = req.body.phoneno,
        userType = req.body.userType,
        doc = {
            "firstname":fname,
            "lastname": lname,
            "EmailId": emailid,
            "Password": password,
            "userId": userid,
            "PhoneNo": phoneno,
            "userType": userType
        };
    mongo_conn.collection('user').insert(doc, function(err, response) {
        if(response) {
            console.log('Data successfully saved!!!');
            res.end();
        }
    });
            
});

app.post('/postJob', function(req, res) {
    var jobTitle = req.body.jobTitle,
        jobDescription = req.body.jobDescription,
        location = req.body.location,
        keywords = req.body.keywords,
        jobDoc = {
            "JobTitle": jobTitle,
            "jobDescription": jobDescription,
            "Location": location,
            "Keywords": keywords
        };
    mongo_conn.collection('jobPosts').insert(jobDoc, function(err, response) {
        if(response) {
            console.log('Job Posting successfully saved!!!');
            res.end();
        }
    });
            
});

var conn_str = 'mongodb://localhost:27017/js_june',
    mongo_conn = '';
mongoClient.connect(conn_str, function(err, db) {
    if(!err) {
        mongo_conn = db;
        app.listen(8000, function() {
            console.log('Server running @ localhost:8000');
        });
    } else {
        console.log('DB connection error!!!');
    }
});


app.post('/getUser', function(req, res) {
   
     db.collection('user').findOne({
         "userId":req.body.username,
         "Password":req.body.password}                         
     ,function(err, doc){
      if(!doc){
          res.status(500).send({
              msg:'UserId or Password is Incorrect'
          })
          } 
         else {
          req.session.user= doc.userType;
          res.json(doc);
          res.status(200);
      }
    });
});

app.get('/sessions', function(req, res) {
    if(req.session.user == 'Company'){
        res.json({companyloggedIn: "true"});
    } else if(req.session.user == 'Job Seeker'){
        res.json({loggedIn: "true"});   
    }else{
        res.json([{loggedIn: "false"}, {companyloggedIn: "false"}]);         
    }
});

app.post('/logOut', function(req, res) {
    if(req.session.user == 'Company'){
        res.json({companyloggedIn: "false"});
        req.session.destroy();
    } 
    else {
        res.json({loggedIn: "false"});
        req.session.destroy();
    }
//    res.json({loggedIn: "false"}, {companyloggedIn: "false"});
});


app.post('/searchResult', function(req,res){
    var jobtitle = req.body.jobTitle,
        location = req.body.location;
    console.log(jobtitle);
    if(jobtitle != null || {} || ""){
    db.collection('jobPosts').find({
        $or:[
            {"JobTitle":
                { $regex: new RegExp("^" + jobtitle.toLowerCase(), "i") }
            },
            {"Location":
                { $regex: new RegExp("^" + location.toLowerCase(), "i") }
            }
        ]
    }).toArray(function(err, doc1){
      if(err) {
          console.log('heyyyyyyyyyyyyyyyy');
          res.send(err);  
      } else {
          res.json(doc1);
      }
    });
    } else{
        res.send("Please enter something.....")
    }
});
