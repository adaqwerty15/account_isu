'use strict';
console.log("Скрипт загружен");
$(function() {
    $(".info").dblclick(function(){
       console.log("+")
       $(this).css('background', 'lightgray');
    });
});