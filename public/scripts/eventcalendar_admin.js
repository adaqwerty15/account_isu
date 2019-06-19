'use strict';
// Minimal Clean Event Calendar Plugin For jQuery
console.log("Скрипт загружен");
var sameDaylastWeek = new Date().setDate(new Date().getDate() - 7);
var someDaynextMonth = new Date().setDate(new Date().getDate() + 31);
// INSERT INTO `calendar`( `description`, `title`, `time`, `link`, `id_date`) VALUES ('Создание нового элемента системы','Календарь','08:00:00','https://www.jqueryscript.net/time-clock/mini-event-calendar.html','1')
// var sampleEvents = [
// 	{
// 			    title: "Календарь",
//                 date: sameDaylastWeek, 
//                 time: "14:00",
//                 desc: "Создание нового элемента системы",
// 			    link: "https://www.jqueryscript.net/time-clock/mini-event-calendar.html"
// 	},
// 	{
// 			    title: "Отдых",
//                 date: new Date().getTime(), 
//                 time:"",
//                 desc:"",
// 			    link: ""
// 	},
// 	{
// 			    title: "новый день",
//                 date: someDaynextMonth,
//                 time:"",
//                 desc:"", 
// 			    link: ""
// 	}
// ];
var sampleEvents = [];

     
$(function() {


    $.ajax({
        type:"GET",
        url:'/events',
        success: function(result){
        var str = '';
        if(result)
            for (let i = 0; i < result.length; i++) {
                sampleEvents.push({
                                    id: result[i].id,
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


    

    

    $('.create__event-save').on("click",()=>{
        let date = $('#date').val();
        let time = $('#time').val();
        let title = $('#title').val();
        let desc = $('#desc').val();
        let link = $('#link').val();
        if(date.length>0 && time.length>0 && title.length>0){
            $.ajax({
                type:"POST",
                url:'/event/create',
                data:{date:date, time:time,title:title, desc:desc,link:link},
                success: function(result){
                var str = '';
                if(result)
                    sampleEvents = [];
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
        }
        
        $('.block__create__event').css({"display":"none"});
        $('.container').css({"opacity":"1"});
     });
    

    $('.create__event-cancel').on("click",()=>{
        $('.block__create__event').css({"display":"none"});
        $('.container').css({"opacity":"1"});
     });

     $('.card_event i').on("click",(ev)=>{
         console.log("dddd")
     });

});

function clickHandler(ev){
    console.log("delete event");
    let idblock = ev.target.id;
    console.log(idblock)

    if(idblock.substring(2) >= 0 ){
        var conf = confirm("Вы действительно хотите удалить мероприятие?");
        if(conf){
            $.ajax({
                type:"POST",
                url:'/event/delete',
                data:{idblock:idblock.substring(2)},
                success: function(result){
                var str = '';
                if(result)
                    sampleEvents = [];
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
        }
    }
}  
