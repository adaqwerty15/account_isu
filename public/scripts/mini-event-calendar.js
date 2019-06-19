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
			<div class="nav__event">
				<i class='material-icons create_event'> create</i>
				<i class='material-icons delete_event'> delete</i>
			</div>
			<div id="t">
			   <h3 id="eventTime"></h3>
			   <h3 id="eventTitle">No events today.</h3>
			</div>
			<div id="m">
			   <h5 id="eventDecs"></h5>
			   <h5><a href="" id="eventLink"/></h5>
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

		let d = ("0" + today.getDate()).slice(-2);
		let y = curYear;
		let m = ("0" + (curMonth + 1)).slice(-2);
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

		$('.create_event').on("click",()=>{
			let date = $('#date').val(y + "-" + m + "-" + d);
			$('#time').val("");
        	$('#title').val("");
          	$('#desc').val("");
          	$('#link').val("");
			// console.log("open block create");
			$('.block__create__event').css({"display":"block"});
			$('.container').css({"opacity":"0.8"});
		 });
		let fd = '';

		miniCalendar.on("mouseover",".a-date",  (e)=>{
			var str = "<i class='material-icons  create'> create</i>";
			// console.log($(e.currentTarget)[0].childNodes[0].innerText);
			fd = ("0" + $(e.currentTarget)[0].childNodes[0].innerText).slice(-2);
			$('#cr').css({'top':(5+$(e.currentTarget)[0].offsetTop)+'px ','left':(5+$(e.currentTarget)[0].offsetLeft)+'px'});
			$('#cr').html(str);
		    if(!$(this).hasClass('blurred')){
				$(e.currentTarget).addClass('hover');
				$('#cr i').addClass('rise');
				$('#cr i').removeClass('fade');
			}
			
		});
		miniCalendar.on("mouseout", ".a-date", (e)=>{
			
			$(e.currentTarget).removeClass('hover');
			$('.hover i').removeClass('fade');
			$('#cr i').removeClass('rise');
			$('#cr i').addClass('fade');
			
		});

		$('#cr').on("click",  function(e){
			// console.log("click")
			let date = $('#date').val(y + "-" + m + "-" + fd);
			$('#time').val("");
			$('#title').val("");
			$('#desc').val("");
			$('#link').val("");
			$('.block__create__event').css({"display":"block"});
			$('.container').css({"opacity":"0.8"});
		});	
		
		function populateCalendar(month, year, onInit) {
			y = year;
			m = ("0" + (month + 1)).slice(-2);
			tbody.html("");
			calTitle.text(shortMonths[month] + " " + year);
			eventTitle.text("Click day to see event");
			eventsLink.text("All Events");
			eventsLink.attr("href", "#");
			eventDecs.text('');
			eventTime.text('');
			eventLink.text('');


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
     			var eventIndex = settings.events.findIndex(function(ev) {
		     		return areSameDate(dt, new Date(ev.date));
		     	});

		        if(eventIndex != -1){
		        	event = settings.events[eventIndex];

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
			if(event && event !== null && event !== undefined){
				eventTitle.text(event.title);
				eventsLink.text("VIEW EVENT");
				eventDecs.text(event.desc);
				let t = '';
				if(event.time.length>0) {
					t = (formatTime(event.time)) + " -  ";  
				}
				eventTime.text(t);
				let p = '';
				if(event.link.length>0) p = "Подробнее: "+event.link;
				eventLink.text(p);
				eventLink.prop("href",event.link);
			}else{
				eventTitle.text("No events on this day.");
				eventDecs.text('');
				eventTime.text('');
				eventLink.text('');
				eventsLink.text("ALL EVENTS");
				eventsLink.attr("href", settings.calendar_link);
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