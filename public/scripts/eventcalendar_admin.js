'use strict';
// Minimal Clean Event Calendar Plugin For jQuery

// var sampleEvents = [];


// $(document).ready(function(){        
    
//     alert('loaded');
// });
     
$(function() {

    console.log("Скрипт загружен");
    var sameDaylastWeek = new Date().setDate(new Date().getDate() - 7);
    var someDaynextMonth = new Date().setDate(new Date().getDate() + 31);
    // INSERT INTO `calendar`( `description`, `title`, `time`, `link`, `id_date`) VALUES ('Создание нового элемента системы','Календарь','08:00:00','https://www.jqueryscript.net/time-clock/mini-event-calendar.html','1')
    var sampleEvents = [];

    $.ajax({
        type:"GET",
        url:'/events',
        success: function(result){
        var str = '';
        if(result)
            
            for (let i = 0; i < result.length; i++) {
                sampleEvents.push({
                                    title: result[i].title,
                                    date: (new Date(result[i].date_value)).getTime(),
                                    time:result[i].time,
                                    desc:result[i].description, 
                                    link: result[i].link
                        });
            }

            $("#calendar").MEC({
                from_monday: true,
                events: sampleEvents
            });

        },
        error: function(){
            alert("Ошибка!");
        }
    });

    


    

    //alert("ready")
    console.log(sampleEvents)
    // $("#calendar").MEC({
    //     from_monday: true,
    //     events: sampleEvents
    // });

    

    $('.create__event-save').on("click",()=>{
        let date = $('#date').val();
        let time = $('#time').val();
        let tit = $('#title').val();
        let desc = $('#desc').val();
        let link = $('#link').val();
        if(date.length>0 && time.length>0 && tit.length>0){
            
        }
        
        $('.block__create__event').css({"display":"none"});
        $('.container').css({"opacity":"1"});
     });
    

    $('.create__event-cancel').on("click",()=>{
        $('.block__create__event').css({"display":"none"});
        $('.container').css({"opacity":"1"});
     });

    $('.delete_event').on("click",()=>{
       console.log("delett")
    });

    
});