module.exports = {
    name: "Utilities",
    init: function(bot){

        bot.util = {};

        /**
         * Returns a random number between `min` and `max`
         * @param {Number} min
         * @param {Number} max
         * @returns {number}
         */
        bot.util.intBetween = function(min, max){
            return parseInt((Math.random() * max)+min);
        };

        /**
        * Chooses a random object from `array`
        * @param {Array} array
        * @returns {*} A random object from the specified array
        */
        bot.util.arrayRand = function arrayRand(array){
            return array[Math.round(Math.random()*(array.length-1))];
        };

        /**
         *
         * @param {Function} callback The function called once the time is up
         * @param {Number} timeout_ms The amount of milliseconds until the time should be called
         */
        bot.util.setLongTimeout = function setLongTimeout(callback, timeout_ms){
            if(timeout_ms > 2147483646){
                setTimeout(function(){
                    setLongTimeout(callback, (timeout_ms - 2147483646));
                },2147483646);
            }
            else{
                setTimeout(callback, timeout_ms);
            }
        };

        /**
         * Returns the difference between two arrays
         * @param {Array} first
         * @param {Array} second
         * @returns {Array}
         */
        bot.util.arrayDiff = function(first, second) {
            return first.filter(function(i) {return second.indexOf(i) < 0;});
        };

        /**
         * Chooses a random object from `array`
         * @param {Array} array
         * @returns {*} A random object from the specified array
         */
        bot.util.arrayRand = function arrayRand(array){
            return array[Math.round(Math.random()*(array.length-1))];
        };

        /**
         * Randomly shuffles an array
         * @param {Array} a
         */
        bot.util.shuffle = function shuffle(a) {
            var j, x, i;
            for (i = a.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x
            }
        };

        /**
         *
         * @param {Array} data
         * @param {String} unit
         * @param {Number} value
         * @returns {Array}
         */
        bot.util.quantify = function quantify(data, unit, value) {
            if (value && value >= 1) {
                if (value > 1 || value < -1)
                    unit += 's';

                data.push(value + ' ' + unit);
            }

            return data;
        };

        /**
         * Parses a number of seconds as a proper time
         * @param {Number} seconds
         * @returns {String}
         */
        bot.util.prettySeconds = function prettySeconds(seconds) {

            var prettyString = '',
                data = [];

            if (typeof seconds === 'number') {
                data = bot.util.quantify(data, 'day',    parseInt((seconds % 31556926) / 86400));
                data = bot.util.quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
                data = bot.util.quantify(data, 'minute', parseInt((seconds % 3600) / 60));
                data = bot.util.quantify(data, 'second', Math.floor(seconds % 60));

                var length = data.length,
                    i;

                for (i = 0; i < length; i++) {

                    if (prettyString.length > 0)
                        if (i == length - 1)
                            prettyString += ' and ';
                        else
                            prettyString += ', ';

                    prettyString += data[i];
                }
            }

            return prettyString;
        };

        /**
         *
         * @param {Function} func
         * @param {Number} wait
         * @param {Boolean} immediate
         * @returns {Function}
         */
        bot.util.debounce = function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this
                    , args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate)
                        func.apply(context, args)
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow)
                    func.apply(context, args)
            }
        };

        /**
         *
         * @param {Function} fn
         * @param {Number} threshhold
         * @param {*} scope
         * @returns {Function}
         */
        bot.util.throttle = function throttle(fn, threshhold, scope) {
            threshhold || (threshhold = 250);
            var last, deferTimer;
            return function() {
                var context = scope || this;
                var now = +new Date
                    , args = arguments;
                if (last && now < last + threshhold) {
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args)
                    }, threshhold)
                } else {
                    last = now;
                    fn.apply(context, args)
                }
            }
        };

        bot.util.chunkify = function chunkify(a, n, balanced) {

            if (n < 2)
                return [a];

            var len = a.length,
                out = [],
                i = 0,
                size;

            if (len % n === 0) {
                size = Math.floor(len / n);
                while (i < len) {
                    out.push(a.slice(i, i += size));
                }
            }

            else if (balanced) {
                while (i < len) {
                    size = Math.ceil((len - i) / n--);
                    out.push(a.slice(i, i += size));
                }
            }

            else {

                n--;
                size = Math.floor(len / n);
                if (len % size === 0)
                    size--;
                while (i < size * n) {
                    out.push(a.slice(i, i += size));
                }
                out.push(a.slice(size * n));

            }

            return out;
        };

        String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
            function () {
                "use strict";
                let str = this.toString();
                if (arguments.length) {
                    let t = typeof arguments[0];
                    let key;
                    let args = ("string" === t || "number" === t) ?
                        Array.prototype.slice.call(arguments)
                        : arguments[0];

                    for (key in args) {
                        str = str.replace(new RegExp("\\{{" + key + "\\}}", "gi"), args[key]);
                    }
                }

                return str;
            };

    }
};