var sampleEvents = [];
$(function() {
    console.log(sampleEvents)


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
});