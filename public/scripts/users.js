'use strict';
console.log("Скрипт загружен");
$(function() {

    $('#file').on("change",(e)=>{
		var fileName = '';
		//fileName = e.target.files[0].name;
		//$('#namefile').html(fileName);
		if (e.target.value){
			fileName = e.target.value.split('\\').pop();
			fileName ? $('#namefile').html(fileName) : $('#namefile').html("");
			$('.material-icons').html("cloud_done");
		} 
   		
	});
    
   //Add new user
   $('.block__line-add').click(function(){
        $("#group1").find('option').remove();
        $('.item_stut input').prop("checked",false);
        $("#field-birthday").val("");
        $("#field-surname").val("");
        $("#field-name").val("");
        $("#field-fathername").val("");
        $(".block__add").fadeIn();
        $("table").css('opacity', '0.5');
    });

    $(".item_stut input").on("click",(event)=>{
        let stat = $(event.currentTarget).attr("id");
        let id_block = 2;
        if(stat.indexOf("1")==-1)
            id_block = 1;
        if(stat.indexOf("student")==0){
            $.ajax({
                type:"POST",
                url:'/groups',
                success: function(result){
                var str = '';
                if(result)
                    for (let i = 0; i < result.length; i++) {
                        let year = result[i].year;
                        let group = result[i].name;
                        if(yearEnter.length!=0 && groupName.length!=0 && year == yearEnter && groupName == group && id_block == 2){
                            str += "<option value='"+result[i].id+"' selected >"+ group +", "+year+"</option>";
                        }else{
                            str += "<option value='"+result[i].id+"'>"+ group +", "+year+"</option>";
                        }
                    }
                    $('#group'+id_block).append(str);
                },
                error: function(){
                    alert("Ошибка!");
                }
            });
            $("#group"+id_block).prop('disabled',false);
        } 
        else{
            $("#group"+id_block).prop('disabled',true);
        }
    });

    $(".button-add").click(()=>{
        let surname = $("#field-surname").val();
        let name = $("#field-name").val();
        let fathername = $("#field-fathername").val();
        let stut = $(".block__add input:checked").attr("id");
        let bday = $("#field-birthday").val();
        let login = "0";
        let password = "0";
        let group = null;
        if(stut=="student")
            group = $("#group1").val();
        if(surname.length!=0 && name.length!=0 && stut!=undefined && bday.length!=0){
            $.ajax({
                type:"POST",
                url:'/addUser',
                data:{surname:surname,name:name,fathername:fathername,stut:stut,group:group, bday:bday,login:login, password:password},
                success: function(result){
                var str = '';
                if(result)
                    $('.table_body').html("");
                    for(let i = 0; i < result.length;i++ ){
                        str += '<tr class="info">' +
                        '<th id="info-id">'+ result[i].id + '</th>'+
                        '<th id="info-code">'+ result[i].name +'</th>'+
                        '<th id="info-dir">'+ result[i].surname +'</th>'+
                        '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                        '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                        '</th><th id="info-code">'+ result[i].username +'</th>'+
                        '</th><th id="info-code">'+ result[i].password +'</th>'+
                        '</th><th id="info-code">'+ result[i].role +'</th>'+
                        '</th><th id="info-code">'+ result[i].direction +'</th>'+
                        '</th><th id="info-code">'+ result[i].year +'</th>'+
                        '</th><th id="info-code">'+ result[i].groupname +'</th>'+
                        '</tr>';
                    }
                    $('.table_body').append(str);
                    $( ".info" ).on( "click", selectClick);
                    $( ".info" ).on( "mouseout", exHover);
                    $( ".info" ).on( "mouseover", startHover);
                    alert("Готово!"); 
                    console.log(result)
                },
                error: function(){
                    alert("Ошибка!");
                }
        });
        }else{
            alert("Заполнены не все поля!")
        }
    });

    //Delete user
   $('.block__line-del').click(function(){
        var data = $('.clicked');
        var str = '';
        var index = [];

        for(let i = 0; i < data.length; i++){
            var children = $(data[i]).children();
            index.push({"id":children[0].innerHTML});
            str += children[0].innerHTML+' '+children[1].innerHTML+' '+children[2].innerHTML +' '+ children[3].innerHTML +'\n';
        }
        if(index.length != 0){
            var conf = confirm(str + "Вы действительно хотите удалить запись?");
            if (conf) {
                $.ajax({
                    type:"POST",
                    url:'/deleteUsers',
                    contentType: 'application/json',
                    dataType: 'json',
                    data:JSON.stringify(index),
                    success: function(result){
                        $('.table_body').html("");
                        str = '';
                        if(result)
                            $('.table_body').html("");
                            for(let i = 0; i < result.length;i++ ){
                                str += '<tr class="info">' +
                                '<th id="info-id">'+ result[i].id + '</th>'+
                                '<th id="info-code">'+ result[i].name +'</th>'+
                                '<th id="info-dir">'+ result[i].surname +'</th>'+
                                '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                                '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                                '</th><th id="info-code">'+ result[i].username +'</th>'+
                                '</th><th id="info-code">'+ result[i].password +'</th>'+
                                '</th><th id="info-code">'+ result[i].role +'</th>'+
                                '</th><th id="info-code">'+ result[i].direction +'</th>'+
                                '</th><th id="info-code">'+ result[i].year +'</th>'+
                                '</th><th id="info-code">'+ result[i].groupname +'</th>'+
                                '</tr>';
                            }
                            $('.table_body').append(str);
                            $( ".info" ).on( "click", selectClick);
                            $( ".info" ).on( "mouseout", exHover);
                            $( ".info" ).on( "mouseover", startHover);
                            alert("Готово!"); },
                    error: function(){
                        alert("Ошибка!");
                }
            });
        }}
    });


    //Cancel
    $(".button__cancel-add").click(function(){
        $(".block__add").fadeOut();
        $("table").css('opacity', '1');
    });
    $(".button__cancel-save").click(function(){
        $(".block__update").fadeOut();
        $("table").css('opacity', '1');
    });
    $(".button__cancel-download").click(function(){
        $(".block__download").fadeOut();
        $("table").css('opacity', '1');
    });

    $('.info').hover(startHover,exHover);
    function startHover(event){
        var self = $(this);
        $(self).css('background-color','#abb8f1');
    }
    function exHover(event){
        var self = $(this);
        if(!$(self).hasClass("clicked")){
            $(self).css('background-color','white');
    }}
    $('.info').click(selectClick);
    function selectClick(event){
        var self = $(this);
        if($(self).hasClass("clicked")){
            $(self).css('background-color','white');
            $($(this)).removeClass("clicked");
        }
        else{
            $($(this)).css('background-color','#abb8f1');
            $($(this)).addClass("clicked");
        }
    }

    //Update user
    var current_id = -1;
    var yearEnter = "";
    var groupName = "";
    $('.block__line-update').click(function(event){
        var data = $('.clicked');
 
         if(data.length != 0){
            $("#group2").prop('disabled',true);
            $("#group2").find('option').remove();
            current_id = $(data[0]).children()[0].innerHTML;
            $("#field__current-surname").val($(data[0]).children()[1].innerHTML);
            $("#field__current-name").val($(data[0]).children()[2].innerHTML);
            $("#field__current-fathername").val($(data[0]).children()[3].innerHTML);
            var date = $(data[0]).children()[4].innerHTML;
            var formattedDate = new Date(date);
            var d = ("0" + formattedDate.getDate()).slice(-2);
            var m =  ("0" + (formattedDate.getMonth() + 1)).slice(-2);
            var y = formattedDate.getFullYear();
            $("#field__current-birthday").val(y + "-" + m + "-" + d);
            var stut = $(data[0]).children()[7].innerHTML;
            $(".item_stut #"+stut+"1").prop("checked", true);
            if(stut=="student"){
                var event = new Event("click");
                student1.dispatchEvent(event);
            }
            yearEnter = $(data[0]).children()[9].innerHTML;
            groupName = $(data[0]).children()[10].innerHTML;
            $("#group2").html("");

            $(".block__update").fadeIn();
            $("table").css('opacity', '0.5');
         }
    });
    
    $('.button__save').click(()=>{
            let surname = $("#field__current-surname").val();
            let name = $("#field__current-name").val();
            let fathername = $("#field__current-fathername").val();
            let bday = $("#field__current-birthday").val();
            let stut = $(".block__update input[type='radio']:checked").attr("id");
            let group = "";
            if(stut=="student1")
                group = $("#group2").val();

            if(surname.length!=0 && name.length!=0 && stut!=undefined && bday.length!=0){
                // console.log("done")
                $.ajax({
                    type:"POST",
                    url:'/changeUser',
                    data:{id: current_id,
                        surname:surname,
                        name: name,
                        fathername:fathername,
                        stut: stut.substring(0,stut.length-1),
                        group:group, 
                        bday:bday,
                        login:0,
                        password:0},
                    success: function(result){
                    var str = '';
                    if(result)
                        $('.table_body').html("");
                        for(let i = 0; i < result.length;i++ ){
                            str += '<tr class="info">' +
                            '<th id="info-id">'+ result[i].id + '</th>'+
                            '<th id="info-code">'+ result[i].name +'</th>'+
                            '<th id="info-dir">'+ result[i].surname +'</th>'+
                            '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                            '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                            '</th><th id="info-code">'+ result[i].username +'</th>'+
                            '</th><th id="info-code">'+ result[i].password +'</th>'+
                            '</th><th id="info-code">'+ result[i].role +'</th>'+
                            '</th><th id="info-code">'+ result[i].direction +'</th>'+
                            '</th><th id="info-code">'+ result[i].year +'</th>'+
                            '</th><th id="info-code">'+ result[i].groupname +'</th>'+
                            '</tr>';
                        }
                        $('.table_body').append(str);
                        $( ".info" ).on( "click", selectClick);
                        $( ".info" ).on( "mouseout", exHover);
                        $( ".info" ).on( "mouseover", startHover);
                        alert("Готово!");
                    },
                    error: function(){
                        alert("Ошибка!");
                    }
                });
            }else{
                alert("Заполнены не все поля!")
            }
    });
    
//     $(".item_stut1 input").click(handleClick);
//     function handleClick(event){
//         if($(event.currentTarget).attr("id")=="student1"){
//             $.ajax({
//                 type:"POST",
//                 url:'/groups',
//                 success: function(result){
//                 var str = '';
//                 if(result)
//                     for (let i = 0; i < result.length; i++) {
//                         let year = result[i].year;
//                         let group = result[i].name;
//                         if(year == yearEnter && groupName == group){
//                             str += "<option value='"+result[i].id+"' selected >"+ group +", "+year+"</option>";
//                         }else{
//                             str += "<option value='"+result[i].id+"'>"+ group +", "+year+"</option>";
//                         }
//                     }
//                     $('#group2').append(str);
//                 },
//                 error: function(){
//                     alert("Ошибка!");
//                 }
//             });
//             $("#group2").prop('disabled',false);
//         } 
//         else{
//             $("#group2").prop('disabled',true);
//         }
//     }  

//Add group of students
$('.block__line-download').click(function(){
    $('#namefile').html("");
    $('.material-icons').html("cloud_upload");
    $(".block__download").fadeIn();
    $("table").css('opacity', '0.5');

});

// $('.button__download').on("click",(event)=>{
//     let files = $('.file-group')[0].files;
//     // let idgroup = $('#group2').val();
//     let idgroup = 1;
//     if(files.length!=0 && idgroup!=null) {
//         let file = files[0];
//         let conf = confirm("Загрузить '"+file.name+"'?")

//         var data = new FormData();
//         data.append('file', file);
//         // data.append('id', idgroup);
           
//     }else{
//         alert("Выберите файл для загрузки и группу.");
//     }



    //https://codeforgeek.com/ajax-file-upload-node-js/
    $('#upload-container').submit(function(e) {
            let files = $('#file')[0].files[0];
            //if buuton - cancel then event propagation
            console.log(files)
            //http://qaru.site/questions/37074/jquery-how-to-get-which-button-was-clicked-upon-form-submission

            if(files!=undefined){
            // $("#status").empty().text("File is uploading...");
            console.log("File is uploading...");
            $(this).ajaxSubmit({

                error: function(xhr) {
                    status('Error: ' + xhr.status);
                },
                success: function(response) {
                    // $("#status").empty().text(response);
                    console.log("ans")
                    console.log(response);
                    $.ajax({
                                url: '/load/groupStudents',
                                type: 'POST',
                                success: function( respond ){
                                console.log(respond)
                                if( typeof respond.error === 'undefined' ){
                                    console.log("ready")
                                    //render
                                }
                                },
                                error: function( jqXHR, textStatus, errorThrown ){
                                    console.log('ОШИБКИ AJAX запроса: ' + textStatus );
                            }
                    });
                }
        });
        $(".block__download").fadeOut();
        $("table").css('opacity', '1');
        }
            
        
        return false;
        
    });

});

