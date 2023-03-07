import moment from 'moment';
declare module 'moment' {
    interface Moment {
        /**
         * format YYYY-MM-DD HH:mm
         * @return string
         */
        fmFullTimeWithoutSecond(): string;
        /**
         * format YYYY-MM-DD HH:mm:ss
         * @return string
         */
        fmFullTimeString(): string;
        /**
         * format YYYY-MM-DD
         * @return string
         */
        fmDayString(): string;
        /**
         * get start of day
         * @return Moment
         */
        startOfDay(): moment.Moment;
        /**
         * get start of day
         * @return string format YYYY-MM-DD HH:mm:ss
         */
        startOfDayString(): string;
        /**
         * get end of day
         * @return Moment
         */
        endOfDay(): moment.Moment;
        /**
         * get end of day
         * @return string format YYYY-MM-DD HH:mm:ss
         */
        endOfDayString(): string;
        /**
         * get start of tomorrow
         * @return Moment
         */
        startOfTomorrow(): moment.Moment;
        /**
         * get start of tomorrow
         * @return string format YYYY-MM-DD HH:mm:ss
         */
        startOfTomorrowString(): string;
        /**
         * get end of tomorrow
         * @return Moment
         */
        endOfTomorrow(): moment.Moment;
        /**
         * get end of tomorrow
         * @return string format YYYY-MM-DD HH:mm:ss
         */
        endOfTomorrowString(): string;
        /**
         * round second into 0
         * @return Moment
         */
        zeroSecond(): moment.Moment;
        /**
         * format HH:mm
         * @return string
         */
        fmHourMinuteString(): string;
        /**
         * format DD-MM
         * @return string
         */
        fmDayMonthString(): string;
        /**
         * format dddd
         * @return string
         */
        fmDayOfWeekString(): string;
        /**
         * format DD
         * @return string
         */
        fmDayOnlyString(): string;
        /**
         * format HH
         * @return string
         */
        fmHourOnlyTimeString(): string;
        /**
         * format MMMM
         * @return string
         */
        fmNameMonthString(): string;
        /**
         * format YYYY
         * @return string
         */
        fmYearString(): string;
        /**
         * format YYYY-MM
         * @return string
         */
        fmYearMonthString(): string;
        /**
         * format MM
         * @return string
         */
        fmMonthString(): string;
        /**
         * format ddd MMM DD YYYY
         * @return string
         */
        fmWeekString(): string;
        /**
         * format ddd HH:mm:ss
         * @return string
         */
        fmTimeString(): string;
        /**
         * format dddd (DD-MM)
         * @return string
         */
        fmDayNameMonthString(): string;
        /**
         * format MMMM - YYYY
         * @return string
         */
        fmMonthNameYearString(): string;
        /**
         * format MM/DD/YYYY HH:mm:ss
         * @return string
         */
        fmFullTimeSlashString(): string;
        /**
         * format DD-MM-YYYY HH:mm
         */
        fmDHTMLXString(): string;
    }
}

moment.fn.fmFullTimeWithoutSecond = function (): string {
    return this.format('YYYY-MM-DD HH:mm');
};

moment.fn.fmFullTimeString = function (): string {
    return this.format('YYYY-MM-DD HH:mm:ss');
};

moment.fn.fmDayString = function (): string {
    return this.format('YYYY-MM-DD');
};

moment.fn.startOfDay = function (): moment.Moment {
    return this.clone().startOf('day');
};

moment.fn.startOfDayString = function (): string {
    return this.clone().startOf('day').fmFullTimeString();
};

moment.fn.endOfDay = function (): moment.Moment {
    return this.clone().endOf('day');
};

moment.fn.endOfDayString = function (): string {
    return this.clone().endOf('day').fmFullTimeString();
};

moment.fn.startOfTomorrow = function (): moment.Moment {
    return this.clone().add(1, 'day').startOf('day');
};

moment.fn.startOfTomorrowString = function (): string {
    return this.clone().add(1, 'day').startOf('day').fmFullTimeString();
};

moment.fn.endOfTomorrow = function (): moment.Moment {
    return this.clone().add(1, 'day').endOf('day');
};

moment.fn.endOfTomorrowString = function (): string {
    return this.clone().add(1, 'day').endOf('day').fmFullTimeString();
};
moment.fn.zeroSecond = function (): moment.Moment {
    return this.set('second', 0);
};

moment.fn.fmHourMinuteString = function (): string {
    return this.format('HH:mm');
};

moment.fn.fmDayMonthString = function (): string {
    return this.format('DD-MM');
};

moment.fn.fmDayOfWeekString = function (): string {
    return this.format('dddd');
};

moment.fn.fmDayOnlyString = function (): string {
    return this.format('D');
};

moment.fn.fmHourOnlyTimeString = function (): string {
    return this.format('HH');
};

moment.fn.fmNameMonthString = function (): string {
    return this.format('MMMM');
};

moment.fn.fmYearString = function (): string {
    return this.format('YYYY');
};

moment.fn.fmYearMonthString = function (): string {
    return this.format('YYYY-MM');
};

moment.fn.fmMonthString = function (): string {
    return this.format('MM');
};

moment.fn.fmWeekString = function (): string {
    return this.format('ddd MMM DD YYYY');
};
moment.fn.fmTimeString = function (): string {
    return this.format('HH:mm:ss');
};
moment.fn.fmDayNameMonthString = function (): string {
    return this.format('dddd (DD-MM)');
};
moment.fn.fmMonthNameYearString = function (): string {
    return this.format('MMMM - YYYY');
};
moment.fn.fmFullTimeSlashString = function (): string {
    return this.format('MM/DD/YYYY HH:mm:ss');
};
moment.fn.fmDHTMLXString = function (): string {
    return this.format('DD-MM-YYYY HH:mm');
};
