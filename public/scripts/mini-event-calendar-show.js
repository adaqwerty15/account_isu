(function( $ ) {
	var calenderTpl = `
		<div id="main__block">
			<div id="calTitle">
				<button type="button" class="month-mover prev">
					<svg fill="#FFFFFF" height="30" viewBox="0 0 24 24" width="30" xmlns="http://www.w3.org/2000/svg">
						<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
					</svg>
				</button>
				<div id="monthYear"></div>
				<button type="button" class="month-mover next">
					<svg fill="#FFFFFF" height="30" viewBox="0 0 24 24" width="30" xmlns="http://www.w3.org/2000/svg">
						<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
					</svg>
				</button>
			</div>
			<div>
				<div id="calThead"></div>
				<div id="calTbody"></div>
			</div>
		</div>
		<div id="calTFooter">
			<div class="card_event">
				<div id="t">
					<div id="navTitle">
						<h3 id="eventTime"></h3>
						<h3 id="eventTitle">No events today.</h3>
					</div>		
				</div>
				<div id="m">
					<h5 id="eventDecs"></h5>
					<h5><a href="" id="eventLink"/></h5>
				</div>
			</div>
			
			<!--<a href="javascript:void(0);" id="calLink">ALL EVENTS</a>-->
		</div>
		
	`;
	var weekDaysFromSunday = '<div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>';
	var weekDaysFromMonday = '<div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>';
	var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

    $.fn.miniEventCalendar = $.fn.MEC = function(options) {
    	var settings = $.extend({
			calendar_link : "",
    		events: [],
			from_monday: false,
			onMonthChanged: null
		}, options );
		var miniCalendar = this;

        miniCalendar.addClass('mini-cal').html(calenderTpl);

		var thead = miniCalendar.find("#calThead");
		var tbody = miniCalendar.find("#calTbody");
		var calTitle = miniCalendar.find("#monthYear");
		var calFooter = miniCalendar.find("#calTFooter");
        var eventTitle = miniCalendar.find("#eventTitle");
		var eventsLink = miniCalendar.find("#calLink");
		var eventDecs = miniCalendar.find("#eventDecs");
		var eventTime = miniCalendar.find("#eventTime");
		var eventLink = miniCalendar.find("#eventLink");

		var today = new Date();
		var curMonth = today.getMonth();
		var curYear = today.getFullYear();

        eventTitle.text("No events today.");
		eventsLink.text("ALL EVENTS");
		eventsLink.attr("href", settings.calendar_link);

		if(settings.from_monday)
			thead.html(weekDaysFromMonday);
		else
			thead.html(weekDaysFromSunday);

		if(!settings.calendar_link.length && !settings.events.length)
			calFooter.css("display", "none");

		miniCalendar.find(".month-mover").each(function(){
			var mover = $(this);
			mover.bind("click", function(e){
				e.preventDefault();
				if(mover.hasClass("next"))
					viewNextMonth();
				else
					viewPrevMonth();
			});
		});

		
		miniCalendar.on("click touchstart", ".a-date", function(e){
			e.preventDefault(); 
			$(".a-date").removeClass('focused');
		    if(!$(this).hasClass('blurred')){
				showEvent($(this).data('event'));
				d = ("0" + $(this)[0].innerText).slice(-2);
				$(this).focus();
				$(this).addClass('focused');
			}
		});
		
		function populateCalendar(month, year, onInit) {
			tbody.html("");
			calTitle.text(shortMonths[month] + " " + year);
			eventTitle.text("Click day to see event");
			eventsLink.text("All Events");
			eventsLink.attr("href", "#");
			eventDecs.text('');
			eventTime.text('');
			eventLink.text('');
			$('.added').remove();
			$('.card_event').attr('id','idnull');

			curMonth = month;
			curYear = year;

			var ldate = new Date(year, month);
			var dt = new Date(ldate);
			var weekDay = dt.getDay();

			if(settings.from_monday)
				weekDay = dt.getDay() > 0 ? dt.getDay() - 1 : 6;

			if(ldate.getDate() === 1)
				tbody.append(lastDaysOfPrevMonth(weekDay));

			while (ldate.getMonth() === month) {
     			dt = new Date(ldate);

     			var isToday = areSameDate(ldate, new Date());
				 var event = null;
				 var eventIndex = [];
     			let count = 0;
				while(count < settings.events.length){
					if(areSameDate(dt, new Date(settings.events[count].date)) == true) eventIndex.push(count);
					count++;
				}
     			// var eventIndex = settings.events.findIndex(function(ev) {
		     	// 	return areSameDate(dt, new Date(ev.date));
				//  });


		        if(eventIndex != -1){
					// event = settings.events[eventIndex];
					if(eventIndex.length !== 0){ 
						event = eventIndex.map((val)=>{
							return settings.events[val]
						});
					}
		        	if(onInit && isToday)
		        		showEvent(event);
		        }

     			tbody.append(dateTpl(false, ldate.getDate(), isToday, event, onInit && isToday));

     			ldate.setDate(ldate.getDate() + 1);

     			var bufferDays = 43 - miniCalendar.find(".a-date").length;

		        if(ldate.getMonth() != month){
		        	for(var i = 1; i < bufferDays; i++){
						tbody.append(dateTpl(true, i));
					}
				}
			}
			 
			if(settings.onMonthChanged){
				settings.onMonthChanged(month, year);
			}
 		}

 		function lastDaysOfPrevMonth(day){
 			if(curMonth > 0){
				var monthIdx = curMonth - 1;
				var yearIdx = curYear;
			}
			else{
     			if(curMonth < 11){
     				var monthIdx = 0;
     				var yearIdx = curYear + 1;
     			}else{
     				var monthIdx = 11;
     				var yearIdx = curYear - 1;
     			}
     		}
     		
     		var prevMonth = getMonthDays(monthIdx, yearIdx);
     		var lastDays = "";
        	for (var i = day; i > 0; i--)
     			lastDays += dateTpl(true, prevMonth[prevMonth.length - i]);

        	return lastDays;
 		}

		function dateTpl(blurred, date, isToday, event, isSelected){
			var tpl = "<div class='a-date blurred'><span>"+date+"</span></div>";

			if(!blurred){
				var hasEvent = event && event !== null;
		        var cls = isToday ? "current " : "";
		        cls += hasEvent && isSelected ? "focused " : "";
		        cls += hasEvent ? "event " : "";
		        
		        var tpl ="<button type='button' class='a-date "+cls+"' data-event='"+JSON.stringify(event)+"'><span>"+date+"</span></button>";
			}

			return tpl;
		}

		function showEvent(event){

			$('.added').remove();
			
			if(event && event !== null && event !== undefined){
				console.log(event.length)
				if(event.length === 1){
					console.log("one")
					eventTitle.text(event[0].title);
					eventsLink.text("VIEW EVENT");
					eventDecs.text(event[0].desc);
					let t = '';
					if(event[0].time.length>0) t = (formatTime(event[0].time)) + " -  ";  
					eventTime.text(t);
					let p = '';
					if(event[0].link.length>0) p = "Подробнее: "+event[0].link;
					eventLink.text(p);
					eventLink.prop("href",event[0].link);
					$('.card_event').attr('id','card'+event[0].id);

				}else{
					console.log("more");
					let str = '';
					for (let i = 0; i < event.length; i++) {
						if(i===0){
							eventTitle.text(event[0].title);
							eventsLink.text("VIEW EVENT");
							eventDecs.text(event[0].desc);
							let t = '';
							if(event[0].time.length>0) t = (formatTime(event[0].time)) + " -  ";  
							eventTime.text(t);
							let p = '';
							if(event[0].link.length>0) p = "Подробнее: "+event[0].link;
							eventLink.text(p);
							eventLink.prop("href",event[0].link);
							$('.card_event').attr('id','card'+event[0].id);
						}
						else{
							console.log("+")
							let t = '';
								if(event[i].time.length>0)  t = (formatTime(event[i].time)) + " -  ";  
							let p = '';
								if(event[i].link.length>0) p = "Подробнее: "+event[i].link;
						
							str = str + '<div class="card_event added" id="card'+event[i].id+'">'+
											'<div id="t">'+
												'<div id="navTitle">'+
													'<h3 id="eventTime">'+t+'</h3>'+
													'<h3 id="eventTitle">'+event[i].title+'</h3>'+
												'</div>'+
											'</div>'+
											'<div id="m">'+
												'<h5 id="eventDecs">'+event[i].desc+'</h5>'+
												'<h5><a href="" id="eventLink" href="'+event[i].link+'"/>'+p+'</h5>'+
											'</div>'+
										'</div>';
					}}
					console.log(str)
					$('.card_event').after(str);
				}
				
			}else{
				eventTitle.text("No events on this day.");
				eventDecs.text('');
				eventTime.text('');
				eventLink.text('');
				eventsLink.text("ALL EVENTS");
				eventsLink.attr("href", settings.calendar_link);
				$('.card_event').attr('id','idnull');
			}

		}

		function formatTime(time){
			let t_ = time.substring(0,5);
			let h = '';
			if((t_.substring(0,2)).substring(0,1)=='0'){
				if((t_.substring(0,2)).substring(1)=='0') h = h = t_.substring(0,2);
				else h = (t_.substring(0,2)).substring(1,2);
			}else h = t_.substring(0,2);
			
			let m_ =  '';
			if(t_.substring(3).substring(0,1)=='0'){
				if(t_.substring(3).substring(1)=='0') m_ = t_.substring(3);	
				else m_ = t_.substring(3).substring(1,2);
			}else m_ = t_.substring(3);
			return h +":" +m_;
		}

		function viewNextMonth(){
			var nextMonth = curMonth < 11 ? curMonth + 1 : 0;
			var nextYear = curMonth < 11 ? curYear : curYear + 1;

			populateCalendar(nextMonth, nextYear);
		}

		function viewPrevMonth(){
			var prevMonth = curMonth > 0 ? curMonth - 1 : 11;
			var prevYear = curMonth > 0 ? curYear : curYear - 1;
			
			populateCalendar(prevMonth, prevYear);
		}

		function areSameDate(d1, d2) {
			return d1.getFullYear() == d2.getFullYear()
		        && d1.getMonth() == d2.getMonth()
		        && d1.getDate() == d2.getDate();
		}

		function getMonthDays(month, year) {
			var date = new Date(year, month, 1);
			var days = [];
			while (date.getMonth() === month) {
				days.push(date.getDate());
				date.setDate(date.getDate() + 1);
			}
			return days;
		}

		populateCalendar(curMonth, curYear, true);

        return miniCalendar;
    };
 
}( jQuery ));