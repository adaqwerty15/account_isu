'use strict';
console.log("Скрипт загружен");
var currentID = 0;
$(function() {
    $("#add").click(function(){
        $("#code").val("");
        $("#iname").val("");
        $.ajax({
            url:'/getAllDir',
            success: function(result){
                var rows = [];
                rows[0] = '<option value="0" > Выберите направление</option>';
                for(var i=0;i<result.length;i++){
                    rows[i+1] = '<option value="'+result[i].id+'">'+result[i].direction+'</option>'
                }
                $('#sel1').html(rows);
            }
        });
        $(".add").css('display', 'grid');
        $("table").css('opacity', '0.5');
     });
     $(".cancel").click(function(){
        $(".add").css('display', 'none');
        $("table").css('opacity', '1');
     });
    $(".addButton").click(function(){
        var code =  $("#code").val();
        var name =  $("#iname").val();
        var dir = $("#sel1 option:selected").val();
        if(!(code.trim() == '' || name.trim() == '') && dir!=0){
            $.ajax({
                type:"POST",
                url:'/addGroup',
                data:{year:code,name:name,id:dir},
                success: function(result){
                if(result)
                  location.reload();
                  alert("Готово!"); },
                error: function(){
                    alert("Ошибка!");
                }
        });
            $(".add").css('display', 'none');
            $("table").css('opacity', '1');

        }else{
            $("#code").css('box-shadow', '0 0 10px red');
            $("#iname").css('box-shadow', '0 0 10px red');
            if(dir==0)
              $("#sel1").css('box-shadow', '0 0 10px red');
            else
              $("#sel1").css('box-shadow', '0 0 10px green');
        }
       
     });


     //delete
    
     $(".info").click(function(){
        var row = $(this);
   
         if(row.css('background-color')=='rgb(255, 255, 255)'){
            row.css('background-color', 'rgb(230, 230, 230)');
         }else{
            row.css('background-color', 'rgb(255, 255, 255)');
         }
        
         $("#del").click(function(){
            if(row.css('background-color')=='rgb(230, 230, 230)'){
                 $.ajax({
                type:"POST",
                url:'/deleteGroup',
                data:{id:row.find("#id").text()},
                success: function(result){
                if(result)
                  location.reload();
                    alert("Готово!"); },
                error: function(){
                    alert("Ошибка!");
                }
        });
            }
        });
     });


     //update
     $(".info").dblclick(function(){
        currentID = $(this).find("#id").text();
        var cod = $(this).find("#cod").text();
        var name = $(this).find("#name").text();
        var dir = $(this).find("#dir").text();
        
        $.ajax({
            url:'/getAllDir',
            success: function(result){
                var rows = [];
                rows[0] = '<option value="0" > Выберите направление</option>';
                for(var i=0;i<result.length;i++){
                    if(result[i].direction==dir){
                     
                       rows[i+1] = '<option selected value="'+result[i].id+'">'+result[i].direction+'</option>';}
                    else
                       rows[i+1] = '<option value="'+result[i].id+'">'+result[i].direction+'</option>';
                }
                $('#oldDir').html(rows);
            }
        });
        $("#oldCode").val(cod);
        $("#oldName").val(name);
        $(".update").css('display', 'grid');
        $("table").css('opacity', '0.5');
 
     });
     $(".cancelChange").click(function(){
        $(".update").css('display', 'none');
        $("table").css('opacity', '1');
     });

     
    $(".saveButton").click(function(){
        var code =  $("#oldCode").val();
        var name =  $("#oldName").val();
        var dir = $("#oldDir option:selected").val();

        if(!(code.trim() == '' || name.trim() == '') && dir!=0){
            $.ajax({
                type:"POST",
                url:'/changeGroup',
                data:{year:code,name:name,id:currentID,idDir:dir},
                success: function(result){
                if(result)
                  location.reload();
                  alert("Готово!"); },
                error: function(){
                    alert("Ошибка!");
                }
        });
            $(".update").css('display', 'none');
            $("table").css('opacity', '1');

        }else{
            $("#oldCode").css('box-shadow', '0 0 10px red');
            $("#oldName").css('box-shadow', '0 0 10px red');
            if(dir==0)
              $("#sel1").css('box-shadow', '0 0 10px red');
            else
              $("#sel1").css('box-shadow', '0 0 10px green');
        }
       
     });


});