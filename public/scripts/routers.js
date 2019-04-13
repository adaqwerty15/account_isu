const mysql  = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'accountisu'
  });

module.exports = function(app,passport){
    
        function authentication() {
            return function (req, res, next) {
                if (req.isAuthenticated()) {
                    return next();
                }
                res.redirect('/login');
            }
        }

        app.get('/login',(req,res)=>{
            res.render('index',{name:req.flash('class'),error: req.flash('message')});   
        });


        app.post('/login',passport.authenticate('local', { successRedirect: '/profile',
                                                        failureRedirect: '/login',
                                                        failureFlash:true
        }));

        app.get('/profile',authentication(),(req,res)=>{
            switch(req.user.role){
                case "admin": {
                    connection.query("SELECT * FROM groups order by year desc", function(err, rows, fields) {
                        var n;
                        var gr = rows;
                        connection.query("select t1.id, t2.surname, t2.name, t2.lastname, t1.text, t1.time  from notices as t1, users as t2 where t2.id=t1.user_id order by time desc", function(err, rows, fields) {
                            n = rows;
                            res.render('profile_admin', {groups: gr, not:n, user:req.user.username});
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
                            connection.query("select t1.id, t2.surname, t2.name, t2.lastname, t1.text, t1.time  from notices as t1, users as t2 where t2.id=t1.user_id  and t1.user_id = "+id+" order by time desc", function(err, rows, fields) {
                            n = rows;
                            res.render('profile_teacher', {groups: gr, not:n, user:req.user.username});
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

                            res.render('profile_student', {not:n, user:req.user.username});
                            })
                        });
                }

                break;
            }

            

            
        })

        app.get('/users',(req,res)=>{
            connection.query("SELECT users.id,users.name,users.surname,users.lastname,DATE_FORMAT( `birthday` , '%d %M %Y' ) AS birthday,users.username,users.password,users.role,subquery1.name AS groupname,subquery1.direction,subquery1.year FROM users LEFT JOIN (SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id) subquery1 ON users.group_id=subquery1.id",function(err, rows, fields) {
                if(err) throw err;
                res.render('users',{data:rows,user:req.user.username});
            });
        })

        app.get('/directions',(req,res)=>{
            connection.query("SELECT `id`,`code`,`direction` FROM `directions`",(err,rows,fields)=>{
                res.render('directions',{data:rows,user:req.user.username});
            });
        })
        app.get('/groups',(req,res)=>{
            connection.query("SELECT groups.id,groups.year,groups.name,directions.direction FROM groups,directions WHERE groups.dir_id=directions.id",(err,rows,fields)=>{
                res.render('groups',{data:rows,user:req.user.username});
            });
        })


        app.post('/addDirection',(req,res)=>{   
            var code = req.body.code;
            var name = req.body.name;
            connection.query("INSERT INTO directions (`code`, `direction`) VALUES ('"+code+"','"+name+"')",(err,rows,fields)=>{
                if(err){
                    return err;
                    //cant set headers after they are sent
                    /*res.send(true);
                    res.end();*/
                }
                res.send(true);
                res.end();
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
                res.send(true);
                res.end();
            });        
        })
        app.post('/deleteDirection',(req,res)=>{   
            var id = req.body.id;
            connection.query("DELETE FROM `directions` where id="+id,(err,rows,fields)=>{
                if(err){
                    return err;
                }
                res.send(true);
                res.end();
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
        app.post('/addGroup',(req,res)=>{ 
            var id = req.body.id;
            var year = req.body.year;
            var name = req.body.name;  
            connection.query("INSERT INTO `groups`(`dir_id`, `year`, `name`) VALUES ('"+id+"','"+year+"','"+name+"')",(err,rows,fields)=>{
                if(err){
                    return err;
                }
                res.send(true);
                res.end();
            });        
        })
        app.post('/changeGroup',(req,res)=>{ 
          
            var id = req.body.id;
            var year = req.body.year;
            var name = req.body.name;  
            var idDir = req.body.idDir;
            console.log(year)
            console.log(name)
            connection.query("UPDATE groups SET `dir_id`="+idDir+",`year`="+year+",`name`='"+name+"' WHERE `id`="+id,(err,rows,fields)=>{
                if(err){
                    return err;
                }
                res.send(true);
                res.end();
            });        
        })
        app.post('/deleteGroup',(req,res)=>{ 
            var id = req.body.id;
            var year = req.body.year;
            var name = req.body.name;  
            connection.query("DELETE FROM `groups` WHERE `id`="+id,(err,rows,fields)=>{
                if(err){
                    return err;
                }
                res.send(true);
                res.end();
            });      
        })

}