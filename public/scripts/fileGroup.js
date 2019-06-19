var mysql  = require('mysql');
const multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var generatePassword = require('password-generator');
var cyrillictotranslit = require('cyrillic-to-translit-js');
const crypto = require('crypto');

var storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, './')
    },
    filename: function (req, file, cb) {
        cb(null, 'test.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ 
    storage: storage,
    fileFilter : function(req, file, callback) { 
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(null, false);
        }
        callback(null, true);
    }}).single('file');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'accountisu'
  });

module.exports = function(app){
    let oname = "";
    let buff = "";
    let file = "";

    app.post('/load/groupStudents', (req, res) => {
  
        let data = JSON.parse(req.body.d)
        let i = 0;
        for (i = 0; i < data.length; i++) {
            let d = data[i];
            let name = cyrillictotranslit().transform(d[1]+""+d[0][0]+""+d[2][0])
            connection.query("SELECT users.id from users where username='"+name+"'",(err,rows,fields)=>{
                let randomLength = Math.floor(Math.random() * (12 - 9)) + 9;
                let password = generatePassword(randomLength, false, /[\w\d\?\-]/)
                if(rows.length!=0) name = name+""+rows.length;
                const cipher = crypto.createCipher('aes192', 'a password in our project');
                var encrypted = cipher.update(password, 'utf8', 'hex');
                encrypted += cipher.final('hex');
                connection.query("INSERT INTO `users`(`name`, `surname`, `lastname`, `birthday`, `username`, `password`, `role`, `group_id`) VALUES ('"+d[0]+"','"+d[1]+"','"+d[2]+"','"+d[3]+"','"+name+"','"+encrypted+"','student','"+req.body.id+"')",function(err, rows, fields) {
                    if(err) throw err;
                   
                });  
            });

        }

        res.send("Ok")

    });

     app.post('/load/users', (req, res) => {
        connection.query("SELECT users.id,users.name,users.surname,users.lastname,DATE_FORMAT( `birthday` , '%d %M %Y' ) AS birthday,users.username,users.password,users.role,subquery1.name AS groupname,subquery1.direction,subquery1.year FROM users LEFT JOIN (SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id) subquery1 ON users.group_id=subquery1.id",(err,rows,fields)=>{  
        res.send(rows);
        res.end();
        });
     })

    app.post('/load/group', (req, res) => {
        var exceltojson;
        // upload(req,res,(err) => {
        //     if(err) {
        //         return res.end("Error uploading file.");
        //     }
        //     file = req.file;
        //     oname = req.file.originalname;	
        //     buff = req.file.buffer;
        //     return res.end("File is uploaded");
        // });
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:-1,err_desc:"No file passed"});
                return;
            }
            
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            try {
                exceltojson({
                    input: req.file.path, 
                    output: null, 
                    lowerCaseHeaders:true
                }, function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    } 

                    res.json({error_code:0,err_desc:null, data: result});
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        });
    });

}

