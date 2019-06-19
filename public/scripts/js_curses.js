$(document).ready(function(){

var subjects;
let ch;
let dir;
let y;
let user;
let semnumb;

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
			semnumb = (d.getFullYear()-y)*2+1;
			if (d.getMonth()>=1 && d.getMonth()<=7) semnumb--
			
			str = 0;
			for (var i=0; i<s.length; i++)
				if (s[i].sem==semnumb)
					str+="<option selected>"+s[i].sem+"</option>"
				else
					str+="<option>"+s[i].sem+"</option>"
			$("#sem_change").html(str);	
				getData()
			 	
			}


		}
		});

function getData() {
	$.ajax({
					type: "POST",
					url: "/curses/sub",
					data: {
						user:user,
						dir:dir,
						year: y 			
					},
					success: function(msg){
						subjects = msg.dis;
						ch = msg.ch;
						createTable()
					}
				});
}

let block = 0;

var createTable = function() {

	let b = "";
	let mess;

	$.ajax({
		type: "POST",
		url: "/blc",
		data: {
			user:user,
			sem: semnumb			
		},
		success: function(msg){
			if (msg.length>0) {
				mess= "Выбор курсов заблокирован"
				b = " disabled "
			}
			else {
				mess = "Выберите дисциплину в каждом блоке и нажмите Ок"
				b = ""
			}
		
			res = ch.filter(e=>e.sem==semnumb)
			let choose = []
			for (let i=0; i<res.length; i++) {
				choose.push(res[i].dis_id)
			}
			result = subjects.filter(e=> e.sem==semnumb);
				if (result.length!=0) {
					let k = 0
				let str = "<p class='p2'>"+mess+"</p>"
				for (k; k<result.length/2; k++) {
					str+="<p class='p1'>Блок №"+(k+1)+": 	</p>"
					str+="<table class='table'>";
					str+="<thead><tr><th scope='col'>Дисциплина</th><th scope='col'>Отметка о выбранной дисциплине</th></tr></thead>"
					str+="<tbody>"
						for(var i = 0; i<2; i++) {
							if (choose.includes(result[k*2+i].id))
								str+="<tr scope='row'><td>"+result[k*2+i].dis+"</td><td class='cent'><input name='bl"+k+"' type='radio' checked "+b+" class='c' value='"+result[k*2+i].id+" '/> </td></tr>"
							else
								str+="<tr scope='row'><td>"+result[k*2+i].dis+"</td><td class='cent'><input name='bl"+k+"' type='radio' "+b+" class='c' value='"+result[k*2+i].id+" '/> </td></tr>"
						}
						block = k;
						str+="</tbody></table>"	
				}

				str+='<div id="subm" class="btn btn-primary button__add">Ок</div>'
				
				$("#table").html(str);
			}

			else $("#table").html("<p class='p1'>В данном семестре нет дисциплин по выбору</p>");
		}


	});
		
}


$("#sem_change").change(function() {
	semnumb = $("#sem_change option:selected").text();
	getData()
})

var ind = []

$(document).on('click', '#subm', function() {
	ind = []
	for (let i=0; i<=block; i++) {
		if ($('input[name="bl'+i+'"]:checked').val()!=undefined)
		ind.push($('input[name="bl'+i+'"]:checked').val())
	}
	if (ind.length!=0) {
		$.ajax({
        type:"POST",
        url:'/curses/load',
        data: {"user":user, "sem":semnumb, "data": JSON.stringify(ind)},
        success: function(result){
           $("#table").append("<div id='inform'>Изменения сохранены</div>")
           $("#inform").fadeIn().delay(1000).fadeOut()
        }
    })

	} 
})


});





	



