const mysql  = require('mysql');
const fs = require("fs");
const crypto = require('crypto');
var path = require('path');



var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'accountisu'
  });

var format = function(day) {
      day = day.toString();
      if (day.length==1) return '0'+day;
      return day;
    }

module.exports = function(app){

    app.post("/submitmess",(req,res)=>{         
        
        connection.query("SELECT id, surname, name, lastname FROM users where username='"+req.session.passport.user+"'", function(err, rows, fields) {
         var aud = req.body['f[]'];
         var text = req.body.text;
         var id_c;
         data = rows;
          d = new Date()
          var date = d.getFullYear()+"-"+format(d.getMonth()+1)+"-"+format(d.getDate())+" "+format(d.getHours())+":"+format(d.getMinutes())
          if (aud=="all") {
            connection.query("INSERT into notices (user_id, text, time, audit) values ("+rows[0].id+", '"+
              text+"' , '"+date+"', 'all')", function(err, rows, fields) {id_c = rows.insertId; 
               res.send({"id_c":id_c, "auth":data[0].surname+ " "+data[0].name+ " "+data[0].lastname, "time":date, "message":text})  
              })
            }

          else {
             connection.query("INSERT into notices (user_id, text, time, audit) values ("+rows[0].id+", '"+
              text+"' , '"+date+"', null)", function(err, rows, fields) { 
                id_c = rows.insertId;
                  for (var i=0; i< aud.length; i++) {
                    connection.query("INSERT into not_aud (not_id, group_id) values ("+rows.insertId+","+aud[i]+")",
                     function(err, rows, fields) {})
                 }
                 res.send({"id_c":id_c, "auth":data[0].surname+ " "+data[0].name+ " "+data[0].lastname, "time":date, "message":text}) 
              })
          }
          
           
        }); 
    });

    app.post("/editsubmitmess",(req,res)=>{         
        var id = req.body.id;
        var aud = req.body['f[]'];
        var text = req.body.text;

        connection.query("delete from not_aud where not_id="+id, function(err, rows, fields) {
          if (aud=="all") {
            connection.query("update notices set text='"+text+"', audit='all' where id="+id, function(err, rows, fields) {})
          }
          else {
             connection.query("update notices set text='"+text+"', audit='null' where id="+id, function(err, rows, fields) {
                  for (var i=0; i< aud.length; i++) {
                    connection.query("INSERT into not_aud (not_id, group_id) values ("+id+","+aud[i]+")",
                     function(err, rows, fields) {})
                 }

              })
             
          }
            res.send("")
        })
    });

// app.get('/marks', (req, res) => {  
//   connection.query("SELECT * FROM groups order by year desc", function(err, rows, fields) {
//       res.render('marks', {groups: rows, user:req.user.username})
//   })
// });

// app.get('/marks/teacher', (req, res) => {  
//   connection.query("SELECT * FROM groups order by year desc", function(err, rows, fields) {
//       res.render('marks_teacher', {groups: rows, user:req.user.username})
//   })
// });

app.post('/marks/dis', (req, res) => { 
   group = req.body.group; 
   sem = req.body.sem;
  connection.query("SELECT t1.id, t1.dis, t1.control, t1.choise FROM dis as t1, groups as t2 where t1.year =t2.year and t1.dir_id = t2.dir_id and t2.name='"+group+"' and t1.sem="+sem, function(err, rows, fields) {
      res.send(rows)
  })
});

app.post('/marks/m', (req, res) => { 
   group = req.body.group; 
   dis = req.body.dis;
    connection.query("select users.id, concat(users.surname,' ', users.name,' ', users.lastname) as fio, marks2.mark, marks2.balls from users left join (SELECT * from marks where marks.dis_id="+dis+") marks2 on users.id=marks2.user_id where users.group_id="+group+" order by users.surname", function(err, rows, fields) {
      var m = rows;
      connection.query("SELECT t1.user_id, t1.mark, t2.id FROM current_marks as t1, col as t2 where t1.col_id =t2.id and t1.dis_id="+dis+"", function(err, rows, fields) {
        var c = rows;
        connection.query("SELECT id, date, comment FROM col where dis_id="+dis+"", function(err, rows, fields) {
          res.send({"c":c, "m":m, "cols":rows})
        })
      })
    })
});

app.post('/curses/m', (req, res) => { 
   group = req.body.group; 
   connection.query("select dir_id, year from groups where id="+group, function(err, rows, fields) {
    var d = rows[0]
    connection.query("select users.id, concat(users.surname,' ', users.name,' ', users.lastname) as fio from users where users.group_id="+group+" order by users.surname", function(err, rows, fields) {
      var m = rows;
      connection.query("SELECT curses.sem, curses.user_id, curses.dis_id, sub.dis FROM curses left join (SELECT * from dis) sub on curses.dis_id=sub.id ", function(err, rows, fields) {
        var c = rows;
        connection.query("SELECT id, dis, choise, sem FROM dis where year='"+d.year+"' and dir_id='"+d.dir_id+"' ", function(err, rows, fields) {
          res.send({"c":c, "m":m, "d":rows})
        })
      })
    })
  })
});

app.post('/marks/sem', (req, res) => { 
  group = req.body.group; 
  connection.query("SELECT t1.sem FROM dis as t1, groups as t2 where t1.year =t2.year and t1.dir_id = t2.dir_id and t2.name='"+group+"' group by sem order by sem", function(err, rows, fields) {
      res.send(rows)
  })
});

app.post('/marks/update', (req, res) => { 
  dis   = req.body.dis; 
  marks = JSON.parse(req.body.marks);
  cols = JSON.parse(req.body.cols);

  var values = []
  for (var i=0; i<marks.length; i++) {
    if (marks[i].mark!=undefined) {
      var j = []
      j.push(marks[i].user)
      j.push(dis)
      j.push(marks[i].mark)
      j.push(marks[i].balls)
      values.push(j)
    }
  }

  var users = []

  for (var i=0; i<marks.length; i++) {
    users.push(marks[i].user)
  }

  var columns = []
  for (var i=0; i<cols.length; i++) {
    var j = []
    j.push(dis)
    j.push(cols[i].date)
    j.push(cols[i].comment)
    columns.push(j)
  }

  connection.query("DELETE from col where dis_id ="+dis+"", function(err, rows, fields) {
    connection.query("INSERT into col (dis_id, date, comment) VALUES ?", [columns], function(err, rows, fields) {
      id_0 = (rows!=undefined) ? rows.insertId : 0;
      var current_marks = []
      for (var i=0; i<marks.length; i++) {
        for (var j=0; j<marks[i].curr_marks.length; j++) {
          var p = []
          p.push(marks[i].user)
          p.push(dis)
          p.push(marks[i].curr_marks[j].m)
          p.push(marks[i].curr_marks[j].col+id_0)
          current_marks.push(p)
        }
      } 
      connection.query("DELETE from current_marks where dis_id ="+dis+" and user_id IN (?)", [users], function(err, rows, fields) {
        connection.query("INSERT into current_marks (user_id, dis_id, mark, col_id) VALUES ?", [current_marks], function(err, rows, fields) {
            connection.query("DELETE from marks where dis_id ="+dis+" and user_id IN (?)", [users], function(err, rows, fields) {
              connection.query("INSERT into marks (user_id, dis_id, mark, balls) VALUES ?", [values], function(err, rows, fields) {
                res.send("Успешно!")
              })
            }) 
        })
      })
      
    })
  })

  
  
});

app.get('/schedule', (req, res) => {  
  res.render("schedule", {user:req.user.username});
}); 


app.get('/schedule/teacher', (req, res) => {  
  res.render("schedule_teacher", {user:req.user.username});
});

// app.get('/subjects', (req, res) => {  
//   res.render("subjects", {user:req.user.username});
// }); 

app.get('/subjects/sem', (req, res) => { 
  
  if (req.session.passport) {
  user = req.session.passport.user;
  console.log(user);
  connection.query("SELECT id, group_id FROM users where username='"+user+"' ", function(err, rows, fields) {
            if (rows[0]) {
              var id = rows[0].group_id;
              var user_id = rows[0].id;
                }
            connection.query("SELECT dir_id, year FROM groups where id="+id, function(err, rows, fields) {
              var year = rows[0].year;
              var dir = rows[0].dir_id;
              connection.query("SELECT t1.sem FROM dis as t1, groups as t2 where t1.year =t2.year and t1.dir_id = t2.dir_id and t2.id='"+id+"' group by sem order by sem", function(err, rows, fields) {
                  res.send({"sem":rows, "year":year, "id":user_id, "dir":dir})

              }) 
            })
          }); 
  }
  else
  {
    res.send("login")
  }

  
});

app.get('/print', (req, res) => {  
  res.sendFile(path.join(__dirname, '../', 'printpassword.html'));
});

app.post('/users/print', (req, res) => { 
  var str2 = JSON.parse(req.body.str);
  f = req.body.f;
  console.log(f)
  var s
  if (f=='false') s = ""
    else s = "<th>Группа</th>"
  
  ht = "<html> "+
      "<head> "+
        "<title>Печать паролей</title> "+
      "</head> "+
      "<style>td, th {padding: 6px; border: 1px solid black;} table {border: 1px solid black; border-collapse: collapse; }</style>"+
      "<body> "+
        "<table> "+
          " <thead><tr><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Логин</th><th>Пароль</th>"+s+"</tr></thead>"+
            "<tbody>"
  for (var i=0; i<str2.length; i++) {
    const decipher = crypto.createDecipher('aes192', 'a password in our project');
    var decrypted = decipher.update(str2[i].password, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    if (f=='false')
      ht+="<tr><td>"+str2[i].surname+"</td><td>"+str2[i].name+"</td><td>"+str2[i].lastname+"</td><td>"+str2[i].username+"</td><td>"+decrypted+"</td></tr>"
    else  
    ht+="<tr><td>"+str2[i].surname+"</td><td>"+str2[i].name+"</td><td>"+str2[i].lastname+"</td><td>"+str2[i].username+"</td><td>"+decrypted+"</td><td>"+str2[i].group+"</td></tr>"
  }
  ht+="</tbody></table></body></html>"
  fs.writeFile("./public/printpassword.html", ht, function() {
    res.send("ok")
  })  
}); 

app.post('/subjects/sub', (req, res) => { 
  user = req.body.user;
  dir = req.body.dir;
  year = req.body.year;

  connection.query("select dis.dis, dis.choise, dis.sem, dis.lek, dis.pr, dis.lab, dis.control from dis where dis.dir_id="+dir+" and dis.year="+year, function(err, rows, fields) {
      res.send(rows)
  })
}); 

app.post('/curses/sub', (req, res) => { 
  user = req.body.user;
  dir = req.body.dir;
  year = req.body.year;

  connection.query("select dis.id, dis.dis, dis.choise, dis.sem, dis.control from dis where dis.dir_id="+dir+" and dis.choise='1' and dis.year="+year, function(err, rows, fields) {
      let r = rows
      connection.query("select dis_id, sem from curses where user_id="+user, function(err, rows, fields) {
        res.send({"dis":r, "ch":rows})
      })
  })
}); 

app.post('/curses/user', (req, res) => {
  user = req.body.user;
  connection.query("select dis_id, sem from curses where user_id="+user, function(err, rows, fields) {
        res.send(rows)
  })
})

app.post('/curses/q', (req, res) => {
  let d = req.body.dis;
  let s = req.body.sem
  connection.query("select user_id from curses where dis_id="+d+" and sem="+s, function(err, rows, fields) {
        res.send(rows)
  })
})

app.post('/block', (req, res) => {
  let g = req.body.group;
  let s = req.body.sem
  connection.query("delete from block where group_id='"+g+"' and sem='"+s+"'", function(err, rows, fields) {
    connection.query("insert into block (group_id, sem) values ('"+g+"', '"+s+"')", function(err, rows, fields) {
          res.send(rows)
    })
  })  
})

app.post('/blc', (req, res) => {
  let user = req.body.user;
  let s = req.body.sem
  connection.query("select group_id from users where id='"+user+"'", function(err, rows, fields) {
    let g = rows[0].group_id;
    connection.query("select id from block where group_id='"+g+"' and sem='"+s+"'", function(err, rows, fields) {
          res.send(rows)
    })
  })  
})

app.post('/deblock', (req, res) => {
  let g = req.body.group;
  let s = req.body.sem
  connection.query("delete from block where group_id='"+g+"' and sem='"+s+"'", function(err, rows, fields) {
          res.send(rows)
  })  
})

app.post('/curses/load', (req, res) => { 
  user = req.body.user;
  sem = req.body.sem;
  data = JSON.parse(req.body.data);


  connection.query("delete from curses where user_id='"+user+"' and sem="+sem, function(err, rows, fields) {
      for (let i=0; i<data.length; i++) {
          connection.query("insert into curses (user_id, sem, dis_id) values ("+user+", "+sem+", "+data[i]+")", function(err, rows, fields) {
            
          })
      }
      res.send("Ok")
  })

  
}); 

app.post('/marks/sub', (req, res) => { 
  user = req.body.user;
  dir = req.body.dir;
  year = req.body.year;

  connection.query("select dis.id, dis.dis, dis.choise, dis.sem, marks2.mark, marks2.balls from dis"+
                    " left join (SELECT * from marks where marks.user_id="+user+") marks2 on dis.id=marks2.dis_id"+
                    " where dis.dir_id="+dir+" and dis.year="+year, function(err, rows, fields) {
      var itog = rows;
      connection.query("select dis.id, dis.dis, dis.choise, dis.sem, marks3.mark, marks3.date, marks3.comment from dis"+
                    " left join (SELECT current_marks.mark, col.date, col.comment, current_marks.dis_id from current_marks, col where current_marks.col_id=col.id and current_marks.user_id="+user+") marks3 on dis.id=marks3.dis_id"+
                    " where dis.dir_id="+dir+" and dis.year="+year+" and marks3.mark is not null", function(err, rows, fields) {
          res.send({"itog": itog, "curr_marks": rows})

      })
  })
}); 

app.post('/deletenote', (req, res) => { 

  id = req.body.id;

  connection.query("delete from notices where id="+id, function(err, rows, fields) {
      res.send("")
  })
});  

app.post('/getnote', (req, res) => { 

  id = req.body.id;
  connection.query("select * from notices where id="+id, function(err, rows, fields) {
      if (rows[0].audit!="all") {
        var data = rows;
          connection.query("select group_id from not_aud where not_id="+id, function(err, rows, fields) {
            res.send({"rows":data, "aud":rows})
          })
        }
      else res.send({"rows":rows, "aud":null})
      })
     
  });
    
        

}