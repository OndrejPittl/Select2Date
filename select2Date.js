define(['jquery'], function($) {

    /**
     * Linked date fields realized with select2.
     */
    ;(function ($, document, window, undefined) {

        'use strict';

        var $window = $(window);

        var Select2Date = function (fields, settings) {

            var api = {},

                // crrently selected day, month and year
                day, month, year,

                // select elements
                dayInputEl, monthInputEl, yearInputEl,

                // select2 instances
                dayObj, monthObj, yearObj,

                // placeholder strings
                dayPlaceholder, monthPlaceholder, yearPlaceholder,

                // count of days of a current month
                dayInMonthCount;


            /**
            *   Initialize app.
            */
            function __init() {

                // find selects
                dayInputEl   = fields.find(settings.selectors.inputDay);
                monthInputEl = fields.find(settings.selectors.inputMonth);
                yearInputEl  = fields.find(settings.selectors.inputYear);

                // acquire predefined values
                day     = dayInputEl.data(settings.selectors.inputVal);
                month   = monthInputEl.data(settings.selectors.inputVal);
                year    = yearInputEl.data(settings.selectors.inputVal);

                // acquire placeholders
                dayPlaceholder = dayInputEl.attr('placeholder');
                monthPlaceholder = monthInputEl.attr('placeholder');
                yearPlaceholder = yearInputEl.attr('placeholder');

                // check all fields exist
                if(!isValid()) return;

                initFieldData();
                bindEvents();
            }

            /**
            *   Initialize selects.
            */
            function initFieldData() {
                var dayData = getDayObjData(),
                    monthData = getMonthObjData(),
                    yearData = getYearObjData();
                
                dayData = extendWithPlaceholder(dayData);
                monthData = extendWithPlaceholder(monthData);
                yearData = extendWithPlaceholder(yearData);

                dayObj = dayInputEl.select2({
                    data: dayData,
                    allowClear: true,
                    placeholder: dayPlaceholder
                });

                monthObj = monthInputEl.select2({
                    data: monthData,
                    allowClear: true,
                    placeholder: monthPlaceholder
                });

                yearObj = yearInputEl.select2({
                    data: yearData,
                    allowClear: true,
                    placeholder: yearPlaceholder
                });

                // predefined value –> use it
                if(day.length == 0) {
                    day = dayObj.val();
                } else {
                    dayObj.val(day).trigger('change');
                }

                if(month.length == 0) {
                    month = monthObj.val();
                } else {
                    monthObj.val(month).trigger('change');   
                }

                if(year.length == 0) {
                    year = yearObj.val();
                } else {
                    yearObj.val(year).trigger('change');   
                }
            }

            /**
            *   Bind events.
            */
            function bindEvents() {
                dayObj.on('select2:select select2:unselecting', handleDaySelect);
                monthObj.on('select2:select select2:unselecting', handleMonthSelect);
                yearObj.on('select2:select select2:unselecting', handleYearSelect);

            }

            /**
            *   Day select event. Store day value.
            */
            function handleDaySelect() {
                day = dayObj.val();
                if(day.length == 0) day = -1;
            }

            /**
            *   Month select event. Store value and update day subset.
            */
            function handleMonthSelect() {
                month = monthObj.val();
                if(month.length == 0) month = -1;
                dayUpdate();
            }

            /**
            *   Year select event. Store value and update day subset.
            */
            function handleYearSelect() {
                year = yearObj.val();
                if(year.length == 0) {
                    // year cleared
                    year = -1;
                } else {
                    // trigger day update
                    dayUpdate();
                }
            }

            /**
            *   Day subset update according to selected month and year.
            */
            function dayUpdate() {

                // acquire days
                var days = extendWithPlaceholder(getDayObjData(month, year));

                // clear and set new data
                dayObj.empty().select2({
                    data: days,
                    allowClear: true,
                    placeholder: dayPlaceholder
                });

                // select previously selected day if day is in available range
                // or select day 1
                if(day > dayInMonthCount) {
                    day = 1;
                }

                dayObj.val(day).trigger('change');
            }

            /**
            *   Builds day data.
            */
            function getDayObjData(month = 1, year = -1) {
                if(month == -1) month = 1;
                if(year == -1)  year = new Date().getYear();

                var arr = [];
                dayInMonthCount = new Date(year, month, 0).getDate();

                for(var i = 1; i <= dayInMonthCount; i++) {
                    var obj = { id: i, text: i };
                    arr.push(obj)
                }

                return arr;
            }

            /**
            *   Builds month data.
            */
            function getMonthObjData() {
                var monthCount = 12, arr = [];

                for(var i = 1; i <= monthCount; i++) {
                    var obj = { id: i, text: getMonthName(i) };
                    arr.push(obj)
                }

                return arr;
            }

            /**
            *   Builds year data.
            */
            function getYearObjData() {
                var currentYear = (new Date()).getFullYear(),
                    arr = [];

                for(var i = currentYear; i >= settings.minYear; i--) {
                    var obj = { id: i, text: i };
                    arr.push(obj)
                }

                return arr;
            }

            /**
            *   Month name string getter according to locale.
            */
            function getMonthName(month = 1) {
                var date = new Date(month + '/1/2000');
                return date.toLocaleString(settings.locale, { month: 'long' });
            }

            /**
            *   Checks whether all fields are available.
            */
            function isValid() {
                return dayInputEl.length && monthInputEl.length && yearInputEl.length;
            }

            /**
            *   Prepends with an option reserved for a placeholder.
            */
            function extendWithPlaceholder(arr) {
                arr.unshift({ id: '', text: ''});
                return arr;
            }

            // auto-init
            __init();

            return api;
        };


        /**
         * jQuery function.
         */
        $.fn.select2Date = function () {

            // process the plugin settings
            var settings = $.extend(true, {}, $.fn.select2Date.defaults, arguments[0]);

            // create an instance for each of the linked fields
            this.each(function () {
                new Select2Date($(this), settings);
            });

        };


        /**
         * Plugin defaults.
         */
        $.fn.select2Date.defaults = {
            locale: 'cs-CZ',
            minYear: 1900,
            defaultDayCount: 31,


            selectors: {
                inputDay:   '.select2Date__item--day',
                inputMonth: '.select2Date__item--month',
                inputYear:  '.select2Date__item--year',
                inputVal: 'select2date-value'
            }
        };

    })($, document, window);
});