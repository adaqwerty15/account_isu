// function showMenu(x) {	
//  var p = x.getBoundingClientRect();
//  var but = document.getElementById('edit');
//  but.style.cssText = "position:fixed;";
//  but.style.left = p.right - 10 + "px";
//  but.style.top = p.top - 30 + "px";
//  $("#edit").removeClass().addClass(x.id).fadeIn();
// }

// function hideMenu(x) {
//   $("#edit").delay(1000).hide();
// }

$(document).ready(function(){
 $("#submarks").hide();

// $("#cancel").click(function(){
// 	$("#createform").fadeOut()
// });

// $("#cancelchange").click(function(){
// 	$("#changeform").fadeOut()
// });

let users;
let curs;
let users_id = [];
let discip;
let y;
let s;

$("#group_change").change(function() {
	$("#table").html("");
	$("#submarks").hide();
	y =  $("#group_change option:selected").val();
	$("#dis_change").html("<option disabled selected>Выберите дисциплину</option>");
	$.ajax({
		type: "POST",
		url: "/marks/sem",
		data: {
			group: $("#group_change option:selected").text()
		},
		success: function(rows){
			if (rows[0]) {
				str = "<option disabled selected>Выберите семестр</option>"
				for (var i=0; i<rows.length; i++)
					str+="<option>"+rows[i].sem+"</option>"
				$("#sem_change").html(str);
			}
			else {
				str = "<option disabled selected>Выберите семестр</option>"
				str+="<option disabled selected>Не найдено</option>"
				$("#sem_change").html(str);
			}

			$.ajax({
				type: "POST",
				url: "/curses/m",
				data: {
					group: y
				},
				success: function(rows){
					console.log(rows)
					curs = rows.c;
					users = rows.m;	
					discip = rows.d;
					for (let i=0; i<users.length; i++) {
						users_id.push(users[i].id)
					}	
				}
			});

			
		}
		});

});

$(document).on('click', '#block', function() {
	console.log("dcfr")
	$.ajax({
				type: "POST",
				url: "/block",
				data: {
					group: y,
					sem: s
				},
				success: function(rows){
					console.log(rows)	
				}
	});
})

$(document).on('click', '#deblock', function() {
	$.ajax({
				type: "POST",
				url: "/deblock",
				data: {
					group: y,
					sem: s
				},
				success: function(rows){
					console.log(rows)	
				}
	});
})

var dis = [];

$("#sem_change").change(function() {
	$("#table").html("");
	$("#submarks").hide();
	s =  $("#sem_change option:selected").val();
	res = curs.filter(e=>e.sem==s && users_id.includes(e.user_id))
	res2 = discip.filter(e=>e.sem==s && e.choise==1)
	if (res2.length!=0) {
		str=""
		if (users.length!=0) {
			str+='<div id="block" class="btn btn-primary button__add">Заблокировать возможность выбора</div>'
			str+='<div id="deblock" class="btn btn-primary button__add">Разблокировать возможность выбора</div>'
			str+= "<table class='table'>";
			str+="<thead><tr><th>ФИО студента</th><th>Выбранные курсы</th></tr></thead>"
			str+="<tbody>"
			for (let i=0; i<users.length; i++) {
				str+="<tr><td>"+users[i].fio+"</td><td id='"+users[i].id+"'></td>"
			}
			str+="</tbody></table>"
			$("#table").html(str);

			for (let i=0; i<res.length; i++) {
				$("#"+res[i].user_id).append("<p class='pc'>"+res[i].dis+"</p>")
			}
		}
		else $("#table").html("<p>Студенты не найдены</p>");
	}
	else {
		$("#table").html("В данном семестре у группы нет курсов по выбору");
	}
	

	
	

});








});





	



