function showMenu(x) {	
 var p = x.getBoundingClientRect();
 var but = document.getElementById('edit');
 but.style.cssText = "position:fixed;";
 but.style.left = p.right - 10 + "px";
 but.style.top = p.top - 30 + "px";
 $("#edit").removeClass().addClass(x.id).fadeIn();
}

function hideMenu(x) {
  $("#edit").delay(1000).hide();
}

$(document).ready(function(){

$("#submarks").hide();

$("#cancel").click(function(){
	$("#createform").fadeOut()
});

$("#cancelchange").click(function(){
	$("#changeform").fadeOut()
});


$("#group_change").change(function() {
	$("#table").html("");
	$("#submarks").hide();
	var y =  $("#group_change option:selected").text();
	$("#dis_change").html("<option disabled selected>Выберите дисциплину</option>");
	$.ajax({
		type: "POST",
		url: "/marks/sem",
		data: {
			group: y
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
			
		}
		});

});

var dis = [];

$("#sem_change").change(function() {
	$("#table").html("");
	$("#submarks").hide();
	var y =  $("#group_change option:selected").text();
	var s =  $("#sem_change option:selected").text();

	if (y!="Выберите группу")
	$.ajax({
		type: "POST",
		url: "/marks/dis",
		data: {
			group: y,
			sem: s
		},
		success: function(rows){
			if (rows[0]) {
				str = "<option disabled selected>Выберите дисциплину</option>"
				for (var i=0; i<rows.length; i++) {
					str+="<option value="+rows[i].id+">"+rows[i].dis+"</option>"
					dis.push({"id":rows[i].id, "control":rows[i].control})
				}
				$("#dis_change").html(str);

			}
			else {
				str = "<option disabled selected>Выберите дисциплину</option>"
				str+="<option disabled selected>Не найдено</option>"
				$("#dis_change").html(str);
			}
			
		}
		});

});


$("#submarks").click(function() {
	var d =  $("#dis_change option:selected").val();
	var answer = []
	var column = []
	$input_m = $(".mark")
	$cur_m = $(".marks")
	$dat = $(".dat")
	var n = $dat.length;
	for (var i=0; i<$dat.length; i++) {
		var c = new Object();
		c.date = $dat[i].classList[1];
		c.comment = $dat[i].attributes[4].value
		column.push(c)
	}
	
	$input_b = $(".balls")
	for (var i=0; i<$input_m.length; i++) {
		var k = new Object();
		k.user = users[i].id;
		var f = false
		if (($($input_m[i]).val())!="" || ($($input_b[i]).val())!="") {		
			k.mark = $($input_m[i]).val();
			k.balls = ($($input_b[i]).val()=="") ? null : $($input_b[i]).val();
			f = true
		}
		k.curr_marks = []

		for(var j = i*n; j<i*n+n; j++) {
			if ($cur_m[j].value!="") {
				f = true
				k.curr_marks.push({"m": $cur_m[j].value, "col":j%n})
			}
		}
		
		if (f)
		answer.push(k)
	}
	console.log(answer)

	var c = new Object;
		
	$.ajax({
		type: "POST",
		url: "/marks/update",
		data: {
			dis: d,
			"marks": JSON.stringify(answer),
			"cols":	JSON.stringify(column)	
		},
		success: function(msg){
			$("#inform").show().delay(3000).fadeOut();
		}
		});

})

var users;

$("#dis_change").change(function() {
	var y =  $("#group_change option:selected").val();
	var d =  $("#dis_change option:selected").val();
	result = dis.filter(e => e.id==d)
	$("#table").html("<p>Форма контроля: "+result[0].control+"</p>")
	$.ajax({
		type: "POST",
		url: "/marks/m",
		data: {
			group: y,
			dis: d
		},
		success: function(rows){
			var str = $("#table").html();
			var marks = rows.m;
			users = rows.m
			cols = rows.cols
			c = rows.c
			
			if (marks[0]) {
				str+= "<table class='table' id='tmarks'>";
				str+="<thead><tr><th>ФИО студента</th><th>Текущие баллы</th><th></th><th rowspan='2'>Суммарный балл</th><th rowspan='2'>Итоговая оценка</th><th rowspan='2'>Баллы</th></tr></thead>"
				str+="<tbody>"
				str+="<tr><td></td><td><button type='button' id='addColumn' title='Добавить колонку'>+</button></td></tr>"
				for(var i = 0; i<marks.length; i++) {
					mark = (marks[i].mark==null) ? "" : marks[i].mark
					balls = (marks[i].balls==null) ? "" : marks[i].balls
					str+="<tr><td id='"+marks[i].id+"'>"+marks[i].fio+"</td><td></td><td></td><td><input  class='form-control sum'  type='text' ' value='0' disabled/></td><td><input  class='form-control mark'  type='text' ' value='"+mark+"'/></td><td><input class='form-control balls' type='text'  value='"+balls+"'/></td></tr>"
				}
				str+="</tbody></table>"
				$("#table").html(str);
			$("#submarks").show();	

			for (var i=0; i<cols.length; i++) {
				addColumns(cols[i], i)
			}

			for (var i=0; i<c.length; i++) {
				$("input#m"+c[i].id+'_'+c[i].user_id).val(c[i].mark);
			}

			$(".sum").each(function(){
           		sumRow($(this))           
         	});

			addEnterItog("input.mark")
			addEnterItog("input.balls")

	 		}
	 	}
	});

});

$(document).on('click', '#addColumn', function () {
	var now = new Date();
	var m = now.getMonth()+1;
	m = m.toString().replace( /^([0-9])$/, '0$1' );
	var d = now.getDate();
	d = d.toString().replace( /^([0-9])$/, '0$1' );

	$("#date1").val(now.getFullYear()+"-"+ m+ "-" +d)	
	$("#text1").val("")
    $("#createform").fadeIn();      
});


function sumRow(el) {
	var o = el.parent().prev().prev()
	var sum = 0;
	
	o.children().each(function(i) {
		sum+=parseInt($(this).children().val()) || 0
	});
	el.val(sum)
}

$(document).on('input', '.marks', function () {
	var o = $(this).parent().parent()
	var sum = 0;
	o.children().each(function(i) {
		sum+=parseInt($(this).children().val()) || 0
	});
	$(this).parent().parent().next().next().children().val(sum)
});

var i=0;

$(document).on('click', '#subm', function () {
	i++
	$("#createform").fadeOut(); 
	var d = new Date($("#date1").val());
	month = (d.getMonth()+1).toString().replace( /^([0-9])$/, '0$1' );
	day = d.getDate().toString().replace( /^([0-9])$/, '0$1' );
         $("#tmarks").find('tr').each(function(){
           var trow = $(this);
             if(trow.index() === 0){
             	$(".del").remove()
             	$("#addColumn").remove()
             	trow.find("td:eq(1)").append('<td class="dat '+$("#date1").val()+'" id="m'+i+'"onmouseover="showMenu(this)" onmouseout="hideMenu(this)" title="'+$("#text1").val()+'">'+day+'.'+month+'</td><td class="del"><button type="button" id="addColumn" title="Добавить колонку">+</button></td>');
             }else{
                 trow.find("td:eq(1)").append('<td><input class="marks marks'+i+'"  type="text" value=""/></td></td>');
             }
             addEnter("input.marks"+i)
            
         });
});

var cl=""

$(document).on('click', '#submchange', function () {
	change();
});

function change() {
	$("#changeform").fadeOut(); 
	var d = new Date($("#date2").val());
	month = (d.getMonth()+1).toString().replace( /^([0-9])$/, '0$1' );
	day = d.getDate().toString().replace( /^([0-9])$/, '0$1' );
	$('.dat#'+cl+'').attr('title', ($("#text2").val()))	
	$('.dat#'+cl+'').html(day+'.'+month)
	$('.dat#'+cl+'').removeClass().addClass("dat").addClass($("#date2").val())
}

$(document).on('click', '#delete', function () {
	$("#changeform").fadeOut(); 
	 var ndx = $('.dat#'+cl+'').index() + 1;	
	 $("td td", event.delegateTarget).remove(":nth-child(" + ndx + ")");
    
});

$(document).on('click', '#edit', function () {
	$("#text2").val($('.dat#'+$(this).attr('class')+'').attr('title'));
	var classList = $('.dat#'+$(this).attr('class')+'').attr('class').split(/\s+/);
	$("#date2").val(classList[1])
	$("#changeform").fadeIn(); 
	cl = $(this).attr('class');
});

$(document).on('click', '.dat', function () {
	$("#text2").val($('.dat#'+$(this).attr('id')+'').attr('title'));
	var classList = $('.dat#'+$(this).attr('id')+'').attr('class').split(/\s+/);
	$("#date2").val(classList[1])
	$("#changeform").fadeIn(); 
	cl = $(this).attr('class');
});


function addEnter(to) {
	$(document).on("keypress",to, (function(event) {
        if(event.keyCode==13 && !$(this).is(":button")){
        	$(this).parent().parent().parent().next().find(to).focus()
        }
 	}));
}

function addEnterItog(to) {
	$(document).on("keypress",to, (function(event) {
        if(event.keyCode==13 && !$(this).is(":button")){
        	$(this).parent().parent().next().find(to).focus()
        }
 	}));
}

function addColumns(col, ind) {
	var d = new Date(col.date);
	month = (d.getMonth()+1).toString().replace( /^([0-9])$/, '0$1' );
	day = d.getDate().toString().replace( /^([0-9])$/, '0$1' );
         $("#tmarks").find('tr').each(function(){
           var trow = $(this);
             if(trow.index() === 0){
             	$(".del").remove()
             	$("#addColumn").remove()
             	trow.find("td:eq(1)").append('<td class="dat '+col.date+'" id="m'+ind+'"onmouseover="showMenu(this)" onmouseout="hideMenu(this)" title="'+col.comment+'">'+day+'.'+month+'</td><td class="del"><button type="button" id="addColumn" title="Добавить колонку">+</button></td>');
             }else{
             	var name = trow.find("td:eq(0)").attr("id");
                trow.find("td:eq(1)").append('<td><input class="marks marks'+ind+'" id="m'+col.id+'_'+name+'" type="text" value=""/></td></td>');
             }
             addEnter("input.marks"+ind)
            
         });
}





});





	



