let title = ''

function showMenu(x) {	
 var p = x.getBoundingClientRect();
 var but = document.getElementById('show');
 but.style.cssText = "position:fixed;";
 but.style.left = p.left + 10 + "px";
 but.style.top = p.top - 45 + "px";
 var classList = $(x).attr('class').split(/\s+/);
 $("#show #date").text("Дата: "+classList[0])
 if ($(x).attr('title')!="") {
 	title = $(x).attr('title');
 	$("#show #text").text("Вид работы: "+$(x).attr('title'))
 	$(x).attr('title', '')
 }	
 else {
 	$("#show #text").html("Вид работы: <i>не указано</i>")
 	title = ""
 }
 	
 $("#show").fadeIn();
}

function hideMenu(x) {
  $("#show").fadeOut();
  $(x).attr('title', title)
}


$(document).ready(function(){

var marks;
let user;
let curs;

$.ajax({
		type: "GET",
		url: "/subjects/sem",
		success: function(rows){
			if (rows=="login") document.location.href = "/login";
			else {
			s = rows.sem;
			y = rows.year;
			user = rows.id;
			dir = rows.dir;

			d = new Date();
			var semnumb = (d.getFullYear()-y)*2+1;
			if (d.getMonth()>=1 && d.getMonth()<=7) semnumb--
			
			str = 0;
			for (var i=0; i<s.length; i++)
				if (s[i].sem==semnumb)
					str+="<option selected>"+s[i].sem+"</option>"
				else
					str+="<option>"+s[i].sem+"</option>"
			$("#sem_change").html(str);	
			 	$.ajax({
					type: "POST",
					url: "/marks/sub",
					data: {
						user: user,
						dir: dir,
						year: y 			
					},
					success: function(msg){
						marks = msg;
						$.ajax({
							type: "POST",
							url: "/curses/user",
							data: {
								user: user			
							},
							success: function(msg){
								curs = msg;			
								createTable(semnumb)			
							}
						});
						
					}
				});
			}


		}
		});



var createTable = function(semnumb) {
	result = marks.itog.filter(e=> e.sem==semnumb);
	curs_c = curs.filter(e => e.sem==semnumb )
	let resolved = []
	for (let i=0; i<curs_c.length; i++) {
		resolved.push(curs_c[i].dis_id)
	}

	let c = result.filter(e=>e.choise==1)
	if (c.length==curs_c.length*2) {
			var str= "<table class='table'>";
			str+="<thead><tr><th scope='col'>Дисциплина</th><th scope='col'>Текущие оценки</th><th scope='col'>Суммарный балл</th><th scope='col'>Итоговая оценка</th><th scope='col'>Итоговые баллы</th></tr></thead>"
			str+="<tbody>"
			for(var i = 0; i<result.length; i++) {
				mark = (result[i].mark==null) ? "" : result[i].mark
				balls = (result[i].balls==null) ? "" : result[i].balls

				if (result[i].choise!=1)
				str+="<tr scope='row'><td>"+result[i].dis+"</td><td id='m"+result[i].id+"'></td><td><input class='form-control sum'  type='text' ' value='0' disabled/></td><td>"+mark+"</td><td>"+balls+"</td></tr>"	
				else if (resolved.includes(result[i].id))
				str+="<tr scope='row'><td class='curs'>"+result[i].dis+"</td><td id='m"+result[i].id+"'></td><td><input class='form-control sum'  type='text' ' value='0' disabled/></td><td>"+mark+"</td><td>"+balls+"</td></tr>"
				
				
			}
			cur = marks.curr_marks.filter(e=> e.sem==semnumb);
			str+="</tbody></table>"
			$("#table").html(str);	

			for (var i=0; i<cur.length; i++) {
				$("td#m"+cur[i].id).append("<div class='"+cur[i].date+" cm' onmouseover='showMenu(this)' onmouseout='hideMenu(this)' title='"+cur[i].comment+"'>"+cur[i].mark+"</div>")
			}

			$("#table").find('tr').each(function(){
		           var trow = $(this);
		             if(trow.index()!= 0){
		             	var s = 0
		             	trow.find("td:eq(1)").children().each(function(){
		             		s+=parseInt($(this).text())
		             	})
		             	trow.find("td:eq(2) input").val(s)
		             }            
		    });	
	}

	else $("#table").html("<p>Чтобы отобразить оценки за данный семестр, выберите курсы в модуле 'Курсы по выбору' или обратитесь к администратору системы</p>")
			
	

	
}


$("#sem_change").change(function() {
	$("#table").html("");
	createTable($("#sem_change option:selected").text())
})


});

