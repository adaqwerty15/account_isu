'use strict';

$(function() {

    var res;
    var checked;
    var checkedgroups;

    $.ajax({
        type:"POST",
        url:'/users',
        success: function(result){
           res = result;
           checked = rol(res)
           checkedgroups = groups(res) 
           console.log(res)
        }
    })

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
        $(".block__add").fadeOut();
        $("table").css('opacity', '1');
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
                res = result;
                if(result)
                    $('.table_body').html("");
                    for(let i = 0; i < result.length;i++ ){
                        result[i].groupname = (result[i].groupname==null) ? "" : result[i].groupname
                        result[i].year = (result[i].year==null) ? "" : result[i].year
                        result[i].direction = (result[i].direction==null) ? "" : result[i].direction
                        str += '<tr class="info">' +
                        '<th id="info-id">'+ result[i].id + '</th>'+
                        '<th id="info-dir">'+ result[i].surname +'</th>'+
                        '<th id="info-code">'+ result[i].name +'</th>'+
                        '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                        '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                        '</th><th id="info-code" class="'+result[i].password+'">'+ result[i].username +'</th>'+
                        '</th><th id="info-code" class="role">'+ result[i].role +'</th>'+
                        '</th><th id="info-code">'+ result[i].groupname +'</th>'+
                        '</th><th id="info-code">'+ result[i].year +'</th>'+
                        '</th><th id="info-code">'+ result[i].direction +'</th>'+                       
                        '</tr>';
                    }
                    $('.table_body').append(str);
                    $( ".info" ).on( "click", selectClick);
                    $( ".info" ).on( "mouseout", exHover);
                    $( ".info" ).on( "mouseover", startHover);
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
                        res = result;
                        if(result)
                            $('.table_body').html("");
                            for(let i = 0; i < result.length;i++ ){
                                result[i].groupname = (result[i].groupname==null) ? "" : result[i].groupname
                                result[i].year = (result[i].year==null) ? "" : result[i].year
                                result[i].direction = (result[i].direction==null) ? "" : result[i].direction
                                str += '<tr class="info">' +
                                '<th id="info-id">'+ result[i].id + '</th>'+
                                '<th id="info-dir">'+ result[i].surname +'</th>'+
                                '<th id="info-code">'+ result[i].name +'</th>'+
                                '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                                '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                                '</th><th id="info-code" class="'+result[i].password+'">'+ result[i].username +'</th>'+
                                '</th><th id="info-code" class="role">'+ result[i].role +'</th>'+
                                '</th><th id="info-code">'+ result[i].groupname +'</th>'+
                                '</th><th id="info-code">'+ result[i].year +'</th>'+
                                '</th><th id="info-code">'+ result[i].direction +'</th>'+ 
                                '</tr>';
                            }
                            $('.table_body').append(str);
                            $( ".info" ).on( "click", selectClick);
                            $( ".info" ).on( "mouseout", exHover);
                            $( ".info" ).on( "mouseover", startHover);
                            },
                    error: function(){
                        alert("Ошибка!");
                }
            });
        }}
    });

   function createTable(result) {
    $('.table_body').html("");
        var str = '';
         if(result)
           $('.table_body').html("");
              for(let i = 0; i < result.length;i++ ){
                  result[i].groupname = (result[i].groupname==null) ? "" : result[i].groupname
                  result[i].year = (result[i].year==null) ? "" : result[i].year
                  result[i].direction = (result[i].direction==null) ? "" : result[i].direction
                  str += '<tr class="info">' +
                  '<th id="info-id">'+ result[i].id + '</th>'+
                  '<th id="info-dir">'+ result[i].surname +'</th>'+
                  '<th id="info-code">'+ result[i].name +'</th>'+
                  '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                  '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                  '</th><th id="info-code" class="'+result[i].password+'">'+ result[i].username +'</th>'+
                  '</th><th id="info-code" class="role">'+ result[i].role +'</th>'+
                  '</th><th id="info-code">'+ result[i].groupname +'</th>'+
                  '</th><th id="info-code">'+ result[i].year +'</th>'+
                  '</th><th id="info-code">'+ result[i].direction +'</th>'+ 
                  '</tr>';
             }
        $('.table_body').append(str);
        $( ".info" ).on( "click", selectClick);
        $( ".info" ).on( "mouseout", exHover);
        $( ".info" ).on( "mouseover", startHover);
   }

   $(document).on('change', '.all', function () {
        if ($(".all input").prop('checked')==true)
            $(".el").prop('checked', true)
        else $(".el").prop('checked', false)
    });

   $(document).on('change', '.el', function () {
        var e = $(".el");
        var f = true
        e.each(function(){
            if ($(this).prop('checked')==false)
                f = false
        })
        if (f)
            $(".all input").prop('checked', true)
        if ($(this).prop('checked')==false)
            $(".all input").prop('checked', false)
    });

   $(document).on('click', '.r', function () {
        $("table").css('opacity', '0.5');
        var roles = res.data
        var role = []
        
        for (var i=0; i<roles.length; i++) {
            role.push(roles[i].role)
        }
        var unique = role.filter((v, i, a) => a.indexOf(v) === i); 
        
        $("#block__filter").html("")
        if (checked.length==unique.length)
            $("#block__filter").append("<label class='c all'><input type='checkbox' value='all' checked>Выделить всё</label>")
        else $("#block__filter").append("<label class='c all'><input type='checkbox' value='all'>Выделить всё</label>")
        for (var i=0; i<unique.length; i++) {
            if (checked.includes(unique[i]))
            $("#block__filter").append("<label class='c'><input type='checkbox' class='el' value='"+unique[i]+"' checked>"+unique[i]+"</label>")
            else $("#block__filter").append("<label class='c'><input type='checkbox' class='el' value='"+unique[i]+"'>"+unique[i]+"</label>")
        }
        $("#block__filter").append('<div id="subm" class="btn btn-primary button__add">Ок</div>')
        $("#block__filter").append('<div id="cancel" class="btn btn-primary button__add">Отмена</div>')
        var but = document.getElementById('block__filter');
        but.style.cssText = "position:fixed;";
        but.style.left = $(this).offset().left + "px";
        but.style.top = $(this).offset().top + $(this).outerHeight() +"px";
        $("#block__filter").fadeIn();
       
    });

   $(document).on('click', '.g', function () {
        $("table").css('opacity', '0.5');
        
        var unique = groups(res)
        
        $("#block__filter").html("")
        if (checkedgroups.length==unique.length)
            $("#block__filter").append("<label class='c all'><input type='checkbox' value='all' checked>Выделить всё</label>")
        else $("#block__filter").append("<label class='c all'><input type='checkbox' value='all'>Выделить всё</label>")
        for (var i=0; i<unique.length; i++) {
            if (checkedgroups.includes(unique[i])) {
                $("#block__filter").append("<label class='c'><input type='checkbox' class='el' value='"+unique[i]+"' checked>"+unique[i]+"</label>")
            }
            else 
            {
               $("#block__filter").append("<label class='c'><input type='checkbox' class='el' value='"+unique[i]+"'>"+unique[i]+"</label>") 
            }
            
        }
        $("#block__filter").append('<div id="subm2" class="btn btn-primary button__add">Ок</div>')
        $("#block__filter").append('<div id="cancel" class="btn btn-primary button__add">Отмена</div>')
        var but = document.getElementById('block__filter');
        but.style.cssText = "position:fixed;";
        but.style.left = $(this).offset().left + "px";
        but.style.top = $(this).offset().top + $(this).outerHeight() +"px";
        $("#block__filter").fadeIn();
       
    });


   function rol(r) {
        var roles = r.data

        var role = []
        
        for (var i=0; i<roles.length; i++) {
            role.push(roles[i].role)
        }
        var unique = role.filter((v, i, a) => a.indexOf(v) === i);
        return unique;
   }

   function groups(r) {
        var roles = r.data
        var role = []
        
        for (var i=0; i<roles.length; i++) {
            role.push(roles[i].groupname)
        }
        var unique = role.filter((v, i, a) => a.indexOf(v) === i);
        if (unique.includes(null)) {
            var ind = unique.indexOf(null)
            unique.splice(ind, 1)
            unique.push("")
        }
        return unique.sort();
   }

    $(document).on('click', '#subm', function () {
        checked = []
        checkedgroups = groups(res)
        var roles = $('.el')
        var role = []
        roles.each(function(){
            if ($(this).prop('checked')==true) {
                var p = $(this).parent().text()
                checked.push(p)
                var k = res.data.filter(e => e.role==p)
                role = role.concat(k)
            }
            
        })
        createTable(role)
        $("#block__filter").fadeOut();
        $("table").css('opacity', '1');
    });

    $(document).on('click', '#subm2', function () {
        checkedgroups = []
        checked = rol(res)
        var roles = $('.el')
        var role = []
        roles.each(function(){
            if ($(this).prop('checked')==true) {
                var p = $(this).parent().text()
                if (p==null || p=="") {
                    p="";
                    var k = res.data.filter(e => e.groupname==null)
                    role = role.concat(k)
                }
                checkedgroups.push(p)
                var k = res.data.filter(e => e.groupname==p)
                role = role.concat(k)
            }
            
        })
        createTable(role)
        $("#block__filter").fadeOut();
        $("table").css('opacity', '1');
    });


    //Cancel
    $(".button__cancel-add").click(function(){
        $(".block__add").fadeOut();
        $("table").css('opacity', '1');
    });

    $(document).on('click', "#cancel", function(){
        $("#block__filter").fadeOut();
        $("table").css('opacity', '1');
    });

    $(".button__cancel-save").click(function(){
        line.removeClass("clicked");
        line.css('background-color','white');
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
    var line = '';
    $('.block__line-update').click(function(event){
        var data = $('.clicked');
 
         if(data.length != 0){
            line = $(data[0]);
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
            var stut = $(data[0]).children()[6].innerHTML;
            $(".item_stut #"+stut+"1").prop("checked", true);
            if(stut=="student"){
                var event = new Event("click");
                student1.dispatchEvent(event);
            }
            yearEnter = $(data[0]).children()[8].innerHTML;
            groupName = $(data[0]).children()[9].innerHTML;
            $("#group2").html("");

            $(".block__update").fadeIn();
            $("table").css('opacity', '0.5');
         }
    });

    
    $('.block__line-check').click(()=>{
        $(".table_body").find('tr').each(function(){
                if(!$(this).hasClass("clicked")) {
                    $(this).addClass("clicked")
                    $(this).css('background-color','#abb8f1');
                }      
         });
    })

    $('.block__line-clear').click(()=>{
        $(".table_body").find('tr').each(function(){
                if($(this).hasClass("clicked")) {
                    $(this).removeClass("clicked")
                    $(this).css('background-color','white');
                }      
         });
    })

    $('.button__save').click(()=>{
            $(".block__update").fadeOut();
            $("table").css('opacity', '1');
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
                    res = result;
                    if(result)
                        $('.table_body').html("");

                        for(let i = 0; i < result.length;i++ ){
                            result[i].groupname = (result[i].groupname==null) ? "" : result[i].groupname
                            result[i].year = (result[i].year==null) ? "" : result[i].year
                            result[i].direction = (result[i].direction==null) ? "" : result[i].direction
                            str += '<tr class="info">' +
                            '<th id="info-id">'+ result[i].id + '</th>'+
                            '<th id="info-dir">'+ result[i].surname +'</th>'+
                            '<th id="info-code">'+ result[i].name +'</th>'+
                            '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                            '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                            '</th><th id="info-code" class="'+result[i].password+'">'+ result[i].username +'</th>'+
                            '</th><th id="info-code" class="role">'+ result[i].role +'</th>'+
                            '</th><th id="info-code">'+ result[i].groupname +'</th>'+
                            '</th><th id="info-code">'+ result[i].year +'</th>'+
                            '</th><th id="info-code">'+ result[i].direction +'</th>'+ 
                            '</tr>';
                        }
                        $('.table_body').append(str);
                        $( ".info" ).on( "click", selectClick);
                        $( ".info" ).on( "mouseout", exHover);
                        $( ".info" ).on( "mouseover", startHover);
                    },
                    error: function(){
                        alert("Ошибка!");
                    }
                });
            }else{
                alert("Заполнены не все поля!")
            }
    });


    $('#pass').click(()=>{
        var data = $('.clicked');
        var str = '';
        var index;

        var children = $(data[0]).children();
        index = children[0].innerHTML;
        str += children[0].innerHTML+' '+children[1].innerHTML+' '+children[2].innerHTML +' '+ children[3].innerHTML +'\n';
        
        if(index.length != 0){
            var conf = confirm(str + "Вы действительно хотите обновить пароль?");
            if (conf) {
                $.ajax({
                    type:"POST",
                    url:'/updatePasswords',
                    data: {id: index},
                    success: function(result){
                        $('.table_body').html("");
                        str = '';
                        res = result;
                        if(result)
                            $('.table_body').html("");
                            for(let i = 0; i < result.length;i++ ){
                                result[i].groupname = (result[i].groupname==null) ? "" : result[i].groupname
                                result[i].year = (result[i].year==null) ? "" : result[i].year
                                result[i].direction = (result[i].direction==null) ? "" : result[i].direction
                                str += '<tr class="info">' +
                                '<th id="info-id">'+ result[i].id + '</th>'+
                                '<th id="info-dir">'+ result[i].surname +'</th>'+
                                '<th id="info-code">'+ result[i].name +'</th>'+
                                '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                                '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                                '</th><th id="info-code" class="'+result[i].password+'">'+ result[i].username +'</th>'+
                                '</th><th id="info-code" class="role">'+ result[i].role +'</th>'+
                                '</th><th id="info-code">'+ result[i].groupname +'</th>'+
                                '</th><th id="info-code">'+ result[i].year +'</th>'+
                                '</th><th id="info-code">'+ result[i].direction +'</th>'+ 
                                '</tr>';
                            }
                            $('.table_body').append(str);
                            $( ".info" ).on( "click", selectClick);
                            $( ".info" ).on( "mouseout", exHover);
                            $( ".info" ).on( "mouseover", startHover);
                            },
                    error: function(){
                        alert("Ошибка!");
                }
            });
        }}
    });
    

//Add group of students
$('.block__line-download').click(function(){
    $('#namefile').html("");
    $('.material-icons').html("cloud_upload");
    $(".block__download").fadeIn();
    $("table").css('opacity', '0.5');

});


//Add group of students
$('.block__line-download').click(function(){
    if($('#group3')[0].children.length==0){
        $.ajax({
            type:"POST",
            url:'/groups',
            success: function(result){
            var str = '<option value="0" selected >Выберите группу</option>';
            if(result)
                for (let i = 0; i < result.length; i++) {
                    let year = result[i].year;
                    let group = result[i].name;
                    str += "<option value='"+result[i].id+"'>"+ group +", "+year+"</option>";
                }
                $('#group3').append(str);
            },
            error: function(){
                alert("Ошибка!");
            }
        });
    }
    $('#group3 option[value="0"]').prop("selected",true);
 
    $('#namefile').html("");
    $('.material-icons').html("cloud_upload");
    $(".block__download").fadeIn();
    $("table").css('opacity', '0.5');

});


    $('#upload-container').submit(function(e) {
            let idgroup = $('#group3').val();
            var val = $("button[clicked=true]").val();
            if(val=='dw'){
                let files = $('#file')[0].files[0];
                if(files!=undefined && idgroup>0 ){
                    $(this).ajaxSubmit({
                        error: function(xhr) {
                            status('Error: ' + xhr.status);
                        },
                        success: function(response) {
                            console.log("File is uploaded");
                            if(response.error_code == -1){
                                alert("Файлы должны быть с расширением .xls или .xlsx.");
                            }else{
                                if(response.error_code == 0){
                                    var len = response.data.length;
                                    if(len>0){
                                        let data = [];
                                        for (let i = 0; i < len; i++) {
                                            var formattedDate = new Date(response.data[i].birthday);
                                            var d = ("0" + formattedDate.getDate()).slice(-2);
                                            var m =  ("0" + (formattedDate.getMonth() + 1)).slice(-2);
                                            var y = formattedDate.getFullYear();
                                            data.push([response.data[i].name,response.data[i].surname,response.data[i].lastname,y + "-" + m + "-" + d]);
                                        }
                                        $.ajax({
                                            url: '/load/groupStudents',
                                            type: 'POST',
                                            data: {d: JSON.stringify(data), id : idgroup},
                                            success: function( result ){
                                                if (result) {
                                                    $.ajax({
                                                        type:"POST",
                                                        url:'/load/users',
                                                        success: function(result){
                                                           res = result;    
                                                                if( typeof result.error === 'undefined' ){
                                                                    $('.table_body').html("");
                                                                    var str='';
                                                                    for(let i = 0; i < result.length;i++ ){
                                                                        result[i].groupname = (result[i].groupname==null) ? "" : result[i].groupname
                                                                        result[i].year = (result[i].year==null) ? "" : result[i].year
                                                                        result[i].direction = (result[i].direction==null) ? "" : result[i].direction
                                                                        str += '<tr class="info">' +
                                                                        '<th id="info-id">'+ result[i].id + '</th>'+
                                                                        '<th id="info-code">'+ result[i].name +'</th>'+
                                                                        '<th id="info-dir">'+ result[i].surname +'</th>'+
                                                                        '</th><th id="info-code">'+ result[i].lastname +'</th>'+
                                                                        '</th><th id="info-code">'+ result[i].birthday +'</th>'+
                                                                        '</th><th id="info-code" class="'+result[i].password+'">'+ result[i].username +'</th>'+
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
                                                                    $(".block__download").fadeOut();
                                                                    $("table").css('opacity', '1');
                                                                }
                                                        }
                                                    })
                                                }
                                            
                                            },
                                            error: function( jqXHR, textStatus, errorThrown ){
                                                console.log('ОШИБКИ AJAX запроса: ' + textStatus );
                                            }
                                        });
                                    }
                                }
                            }
                            
                        }
                });
                }else{
                    alert("Выберите файл или группу!");
                }
            }
        return false;
        
    });

    $("form button").click(function() {
        $("button", $(this).parents("form")).removeAttr("clicked");
        $(this).attr("clicked", "true");
    });

    $('.block__line-print').click(function(){
        var data = $('.clicked');
        var f = false
        var str = []
        data.each(function(){
           var trow = $(this);
           var k = new Object();
           k.surname = trow.find("th:eq(1)").text()
           k.name    = trow.find("th:eq(2)").text()
           k.lastname = trow.find("th:eq(3)").text()
           k.username = trow.find("th:eq(5)").text()
           k.password = trow.find("th:eq(5)").attr("class")
           if (trow.find("th:eq(6)").text()=="student") f = true
           k.group =  trow.find("th:eq(7)").text()
           str.push(k) 
         });

        $.ajax({
        type: "POST",
        url: "/users/print",
        data: {
            "str": JSON.stringify(str),
            "f": f
        },
        success: function(rows){
            window.open('/print');
        }
        });
        
    });



});

