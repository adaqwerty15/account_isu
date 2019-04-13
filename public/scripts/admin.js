$(function() {

	$(document).on('click', '.delete', function () {
		var del = confirm("Вы действительно хотите удалить запись?")
		
		if (del) {

			var id = $(this).attr("id")
			console.log(id)
			$.ajax({
	      		type: "POST",
	      		url: "/deletenote",
	      		data: {id:id},
	      		success: function(msg) {
	      			 document.location.href = "/profile";
	      		}
	      	})
		}
	})



	$("#create").click(function(){
		$("#Textarea1").val("")
		$("#createform").fadeIn();
		$(".all").prop('checked', true)
		$("#all").prop('checked', true)	
	})

	$("#subm").click(function(){
		$("#createform").fadeOut();	

		var ch = []
			$all = $(".all");
			if ($("#all").prop('checked')) ch.push("all");
			else {
				for (var i=0; i<$all.length; i++)
					if ($($all[i]).prop('checked'))
						ch.push($($all[i]).val())
			}
		
		if ($("#Textarea1").val()!="" && ch[0])
		$.ajax({
	      type: "POST",
	      url: "/submitmess",
	      data: {f:ch, text: $("#Textarea1").val()},
	      success: function(msg) {
	      	console.log(msg)
	      	var notes = $("#container").html();
	      	notes = "<div class='not'><p class='delete' id='"+msg.id+"'>Удалить</p><p class='mess'>"+msg.message+"</p><p class='auth'>"+msg.auth+"</p><p class='time'>"+msg.time+"</p></div>" + notes
	      	$("#container").html(notes)
	      }
    });

	})


	$(document).on('change', 'input[type=checkbox]', function () {
  	if ($(this).attr("id")=="all" && !($(this).prop('checked')))
  		$(".all").prop('checked', false) 
  	if ($(this).attr("id")=="all" && ($(this).prop('checked')))
  		$(".all").prop('checked', true)
  	if ($(this).hasClass("all") && !($(this).prop('checked')))
  		$("#all").prop('checked', false)
});

	
})