const mysql  = require('mysql');
var generatePassword = require('password-generator');
var cyrillictotranslit = require('cyrillic-to-translit-js');
const crypto = require('crypto');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'accountisu'
  });

module.exports = function(app,passport){
    
    //Authorization page
        function authentication() {
            return function (req, res, next) {
                if (req.isAuthenticated()) {
                    return next();
                }
                res.redirect('/login');
            }
        }

        app.get('/login',(req,res)=>{
            res.render('start_page',{name:req.flash('class'),error: req.flash('message')});   
        });


        app.post('/login',passport.authenticate('local', { successRedirect: '/profile',
                                                        failureRedirect: '/login',
                                                        failureFlash:true
        }));

        //Home page
        app.get('/profile',authentication(),(req,res)=>{
            connection.query("SELECT surname, name FROM users where username='"+req.user.username+"' AND password='"+req.user.password+"'",
            function(err, rows, fields) {
               if (rows && rows[0])
               str = rows[0].surname +" "+rows[0].name;
            });
            switch(req.user.role){
                case "admin": {
                    connection.query("SELECT * FROM groups order by year desc", function(err, rows, fields) {
                        var n;
                        var gr = rows;
                        connection.query("select t1.id, t2.surname, t2.name, t2.lastname, t1.text, t1.time  from notices as t1, users as t2 where t2.id=t1.user_id order by time desc", function(err, rows, fields) {
                            n = rows;
                            res.render('profile_admin', {groups: gr, not:n, user:req.user.username, username:str});
                        })

                    });
                    
                }
                break;
                
                case "teacher": {
                    connection.query("SELECT * FROM groups order by year desc", function(err, rows, fields) {
                        var n;
                        var gr = rows;
                        connection.query("SELECT id FROM users where username='"+req.user.username+"'", function(err, rows, fields) {
                            if (rows[0]) var id = rows[0].id;
                            connection.query("(select t2.username, t1.id, t2.surname, t2.name, t2.lastname, t1.text, t1.time  from notices as t1, users as t2 where t2.id=t1.user_id  and t1.user_id = "+id+") UNION (SELECT t2.username, t1.id, t2.surname, t2.name, t2.lastname, t1.text, t1.time  from notices as t1, users as t2 where t2.id=t1.user_id and t2.role='admin') order by time desc", function(err, rows, fields) {
                            n = rows;
                            console.log(rows)
                            res.render('profile_teacher', {groups: gr, not:n, user:req.user.username, username:str});
                            })
                        });
                    });
                }

                break;
                
                case "student": {
                    var n;
                    connection.query("SELECT group_id FROM users where username='"+req.user.username+"'", function(err, rows, fields) {
                            if (rows[0]) var id = rows[0].group_id;
                            
                            connection.query("(select t2.surname, t2.name, t2.lastname, t1.text, t1.time  from notices as t1, users as t2 where t2.id=t1.user_id and t1.audit='all') UNION (SELECT t2.surname, t2.name, t2.lastname, t1.text, t1.time from notices as t1, users as t2, not_aud WHERE t2.id=t1.user_id and not_aud.group_id="+id+" and not_aud.not_id=t1.id) order by time desc", function(err, rows, fields) {
                            n = rows;

                            res.render('profile_student', {not:n, user:req.user.username, username:str});
                            })
                        });
                }

                break;
            }

            

            
        })

        app.get('/users',(req,res)=>{
            connection.query("SELECT users.id,users.name,users.surname,users.lastname,DATE_FORMAT( `birthday` , '%d %M %Y' ) AS birthday,users.username,users.password,users.role,subquery1.name AS groupname,subquery1.direction,subquery1.year FROM users LEFT JOIN (SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id) subquery1 ON users.group_id=subquery1.id",function(err, rows, fields) {
                if(err) throw err;
                res.render('users',{data:rows,user:req.user.username, username: str});
            });
        })

        app.post('/users',(req,res)=>{
            connection.query("SELECT users.id,users.name,users.surname,users.lastname,DATE_FORMAT( `birthday` , '%d %M %Y' ) AS birthday,users.username,users.password,users.role,subquery1.name AS groupname,subquery1.direction,subquery1.year FROM users LEFT JOIN (SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id) subquery1 ON users.group_id=subquery1.id",function(err, rows, fields) {
                if(err) throw err;
                res.send({data:rows});
            });
        })

        
        app.post('/addUser',(req,res)=>{
            var randomLength = Math.floor(Math.random() * (12 - 9)) + 9;
            var password = generatePassword(randomLength, false, /[\w\d\?\-]/)
            var name = cyrillictotranslit().transform(req.body.surname+""+req.body.name[0]+""+req.body.fathername[0])
            connection.query("SELECT users.id from users where username='"+name+"'",(err,rows,fields)=>{
                    if(rows.length!=0) name = name+""+rows.length;
            const cipher = crypto.createCipher('aes192', 'a password in our project');
            var encrypted = cipher.update(password, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            connection.query("INSERT INTO `users`(`name`, `surname`, `lastname`, `birthday`, `username`, `password`, `role`, `group_id`) VALUES ('"+req.body.name+"','"+req.body.surname+"','"+req.body.fathername+"','"+req.body.bday+"','"+name+"','"+encrypted+"','"+req.body.stut+"','"+req.body.group+"')",function(err, rows, fields) {
                if(err) throw err;
                connection.query("SELECT users.id,users.name,users.surname,users.lastname,DATE_FORMAT( `birthday` , '%d %M %Y' ) AS birthday,users.username,users.password,users.role,subquery1.name AS groupname,subquery1.direction,subquery1.year FROM users LEFT JOIN (SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id) subquery1 ON users.group_id=subquery1.id",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });
            });
        })
        app.post('/deleteUsers',(req,res)=>{
            var query = '';
            for(let i = 0; i<req.body.length; i++){
                if(i != req.body.length-1)
                    query += req.body[i].id+', ';
                else
                    query += req.body[i].id;
            }
            connection.query("DELETE FROM `users` WHERE id IN ("+query+")",function(err, rows, fields) {
                if(err) throw err;
                connection.query("SELECT users.id,users.name,users.surname,users.lastname,DATE_FORMAT( `birthday` , '%d %M %Y' ) AS birthday,users.username,users.password,users.role,subquery1.name AS groupname,subquery1.direction,subquery1.year FROM users LEFT JOIN (SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id) subquery1 ON users.group_id=subquery1.id",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });
        })

        app.post('/updatePasswords',(req,res)=>{

            var randomLength = Math.floor(Math.random() * (12 - 9)) + 9;
            var password = generatePassword(randomLength, false, /[\w\d\?\-]/)
            const cipher = crypto.createCipher('aes192', 'a password in our project');
            var encrypted = cipher.update(password, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            console.log(req.body.id)
            connection.query("UPDATE `users` set password = '"+encrypted+"' WHERE id='"+req.body.id+"'",function(err, rows, fields) {
                if(err) throw err;
                connection.query("SELECT users.id,users.name,users.surname,users.lastname,DATE_FORMAT( `birthday` , '%d %M %Y' ) AS birthday,users.username,users.password,users.role,subquery1.name AS groupname,subquery1.direction,subquery1.year FROM users LEFT JOIN (SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id) subquery1 ON users.group_id=subquery1.id",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });
        })

        app.post('/changeUser',(req,res)=>{
            connection.query("UPDATE `users` SET name='"+req.body.name+
            "',surname='"+req.body.surname+
            "',lastname='"+req.body.fathername+
            "',birthday='"+req.body.bday+
            "',role='"+req.body.stut+
            "',group_id='"+req.body.group+
            "' WHERE id='"+req.body.id+"'",function(err, rows, fields) {
                if(err) throw err;
                connection.query("SELECT users.id,users.name,users.surname,users.lastname,DATE_FORMAT( `birthday` , '%d %M %Y' ) AS birthday,users.username,users.password,users.role,subquery1.name AS groupname,subquery1.direction,subquery1.year FROM users LEFT JOIN (SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id) subquery1 ON users.group_id=subquery1.id",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });
        });

        //Direction page
        app.get('/directions',(req,res)=>{
            connection.query("SELECT `id`,`code`,`direction` FROM `directions`",(err,rows,fields)=>{
                res.render('directions',{data:rows,user:req.user.username, username:str});
            });
        })

        app.post('/addDirection',(req,res)=>{   
            var code = req.body.code;
            var name = req.body.name;
            connection.query("INSERT INTO directions (`code`, `direction`) VALUES ('"+code+"','"+name+"')",(err,rows,fields)=>{
                if(err){
                    return err;
                }
                connection.query("SELECT id,code,direction FROM directions",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });        
        })


        
       app.post('/changeDirection',(req,res)=>{   
            var code = req.body.code;
            var name = req.body.name;
            var id = req.body.id;
            connection.query("UPDATE `directions` SET `code`='"+code+"',`direction`='"+name+"' where id="+id,(err,rows,fields)=>{
                if(err){
                    return err;
                }
                connection.query("SELECT id,code,direction FROM directions",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });        
        })

        app.post('/deleteDirection',(req,res)=>
        {   
            var query = '';
            for(let i = 0; i<req.body.length; i++){
                if(i != req.body.length-1)
                    query += req.body[i].id+', ';
                else
                    query += req.body[i].id;
            }
            connection.query("DELETE FROM `directions` where id IN ("+query+")",(err,rows,fields)=>{
                if(err){
                    return err;
                }
                connection.query("SELECT id,code,direction FROM directions",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });     
        })

        app.get('/getAllDir',(req,res)=>{   
            connection.query("SELECT `direction`,`id` FROM `directions`",(err,rows,fields)=>{
                if(err){
                    return err;
                }
                res.send(rows);
                res.end();
            });        
        })

        app.get('/groups',(req,res)=>{
            connection.query("SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id",(err,rows,fields)=>{
                res.render('groups',{data:rows,user:req.user.username, username:str});
            });
        })

         app.post('/groups',(req,res)=>{ 
            connection.query("SELECT groups.id,groups.year,groups.name FROM groups",(err,rows,fields)=>{ 
                if(err){ 
                    return err; 
                } 
            res.send(rows); 
            res.end(); 
            });
        })

        app.post('/addGroup',(req,res)=>{ 
            var id = req.body.id;
            var year = req.body.year;
            var name = req.body.name;  
            connection.query("INSERT INTO `groups`(`dir_id`, `year`, `name`) VALUES ('"+id+"','"+year+"','"+name+"')",(err,rows,fields)=>{
                if(err){
                    return err;
                }
                connection.query("SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });        
        })

        app.post('/changeGroup',(req,res)=>{ 
          
            var id = req.body.id;
            var year = req.body.year;
            var name = req.body.name;  
            var idDir = req.body.dir;
            console.log(id + "  " +idDir);
            connection.query("UPDATE groups SET `dir_id`="+idDir+",`year`="+year+",`name`='"+name+"' WHERE `id`="+id,(err,rows,fields)=>{
                if(err){
                    return err;
                }
                connection.query("SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });        
        })

        app.post('/deleteGroup',(req,res)=>{ 
            var query = '';
            console.log(req.body)
            for(let i = 0; i<req.body.length; i++){
                if(i != req.body.length-1)
                    query += req.body[i].id+', ';
                else
                    query += req.body[i].id;
            }
            connection.query("DELETE FROM `groups` WHERE id IN ("+query+")",(err,rows,fields)=>{
                if(err){
                    return err;
                }
                connection.query("SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id",(err,rows,fields)=>{
                    res.send(rows);
                    res.end();
                });
            });      
        })

        app.get('/marks', (req, res) => {  
          connection.query("SELECT * FROM groups order by year desc", function(err, rows, fields) {
              res.render('marks', {groups: rows, user:req.user.username, username:str})
          })
        });

        
        app.get('/marks/teacher', (req, res) => {  
          connection.query("SELECT * FROM groups order by year desc", function(err, rows, fields) {
              res.render('marks_teacher', {groups: rows, user:req.user.username, username:str})
          })
        });

        app.get('/schedule', (req, res) => {  
          res.render("schedule", {user:req.user.username, username:str});
        }); 

        app.get('/schedule/teacher', (req, res) => {  
          res.render("schedule_teacher", {user:req.user.username, username:str});
        });

        app.get('/schedule/student', (req, res) => {  
          res.render("schedule_student", {user:req.user.username, username:str});
        });

        app.get('/subjects', (req, res) => {  
          res.render("subjects", {user:req.user.username, username:str});
        }); 

        app.get('/marks/student', (req, res) => {  
          res.render("marks_student", {user:req.user.username, username:str});
        });


        app.get('/up', (req, res) => {  
            connection.query("SELECT * FROM directions order by code", function(err, rows, fields) {
                dirs = rows;
            }); 
            connection.query("SELECT year FROM dis group by year", function(err, rows, fields) {
                res.render('up', {dirs: dirs, masy:rows, user:req.user.username, username:str});
            }); 
            
        });

        app.get('/up/teacher', (req, res) => {  
          connection.query("SELECT * FROM directions order by code", function(err, rows, fields) {
            dirs = rows;
          }); 
          connection.query("SELECT year FROM dis group by year", function(err, rows, fields) {
            res.render('up_teacher', {dirs: dirs, masy:rows, user:req.user.username, username:str});
          }); 
          
        });
 	
	app.get('/eventcalendar',(req,res)=>{
            res.render('eventcalendar_admin',{user:req.user.username, username: str});
        })

        app.get('/events',(req,res)=>{
            connection.query("SELECT calendar.id,calendar.title,calendar.description,calendar.time,calendar.link,date.date_value FROM calendar, date WHERE calendar.id_date=date.id",(err,rows,fields)=>{
                res.send(rows);
                res.end();
            });
        })

}
