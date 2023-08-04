"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
/**
   * Represents the time in a day (beginning at midnight) with no Date
   * part. The time is effectively stored in 24-hour format. Additiion
   * (and subtraction) are possible via the {@link Time|addTime} method.
   */
class Time {
    constructor(_initialTimeOrHour, _initialMinutes, _initialSeconds, _initialMillis) {
        // Time stores hours and minutes. This can be between 0 and 2359. 
        // Because of privacy and the validation rules, it will only ever be 
        // values resembling 24-hour clock hours and minutes times e.g. 900, 
        // 901, ..., 959, ..., 2359. Although it is a normal number,
        // it will never containe values not resembling hour-and-minute 
        // 24-hour clock times such as 999, 777, 199, 99 etc.
        this._hours = 0;
        this._minutes = 0;
        this._secs = 0;
        this._millis = 0;
        // Validation status of this Time.
        this._valid = true;
        this._validationMessage = '';
        if (!this.isValidTime(_initialTimeOrHour, _initialMinutes, _initialSeconds, _initialMillis)) {
            this._hours = 0;
            this._minutes = 0;
            this._secs = 0;
            this._millis = 0;
            this._valid = false;
            return;
        }
        if (typeof _initialTimeOrHour === 'number') {
            this._hours = _initialTimeOrHour;
            this._minutes = (typeof _initialMinutes !== 'undefined') ? _initialMinutes : this._minutes;
            this._secs = (typeof _initialSeconds !== 'undefined') ? _initialSeconds : this._secs;
            this._millis = (typeof _initialMillis !== 'undefined') ? _initialMillis : this._millis;
            this._validationMessage = 'Time is valid.';
            return;
        }
        if (typeof _initialTimeOrHour === 'string') {
            const match = Time.TIME_VALIDATING_REGEX.exec(_initialTimeOrHour);
            // Since we have already validated the string, we should theoretically not have to 
            // test for match but TypeScript needs to be sure so...
            if (match) {
                /**
                 * In the case of 24-hour clock time, the match[] array will look as follows:
                 *  match[0] == <full match>
                 *  match[1] == 'hh' (00-23)
                 *  match[2] == 'mm' (00-59)
                 *  match[3] == 'ss'|undefined (00-59 | undefined)
                 *  match[4] == 'ms'|undefined (0-999 | undefined)
                 *
                 * In the case of a 12-hour clock time, the match[] array will look as follows:
                 *  match[0] = 'hh' (01-12)
                 *  match[1] = 'mm' (00-59)
                 *  match[3] == 'ss'|undefined (00-59 | undefined)
                 *  match[4] == 'ms'|undefined (0-999 | undefined)
                 *  match[5] (toUpperCase()) == 'AM|PM'
                 *
                 */
                let ampm = match.find(e => typeof e !== 'undefined' && (e.toUpperCase() === 'AM' || e.toUpperCase() === 'PM'));
                if (typeof ampm !== 'undefined') {
                    ampm = ampm.toUpperCase();
                }
                const filteredMatches = Array.from(match).filter((m) => m !== undefined && m.toUpperCase() !== 'AM' && m.toUpperCase() !== 'PM');
                let timeDiddle = (typeof filteredMatches[1] !== 'undefined') ? +filteredMatches[1] : 0;
                if (ampm === 'PM') {
                    timeDiddle += (timeDiddle !== 12) ? 12 : 0;
                }
                this._hours = timeDiddle;
                this._minutes = (typeof filteredMatches[2] !== 'undefined') ? +filteredMatches[2] : 0;
                this._secs = (typeof filteredMatches[3] !== 'undefined') ? +filteredMatches[3] : 0;
                this._millis = (typeof filteredMatches[4] !== 'undefined') ? +filteredMatches[4] : 0;
            }
        }
    }
    /**
     *
     * @param _timeOrHoursToValidate string  representing a formatted time
     * or whole number representing hours in a day (0-23).
     *
     * The string version is time formatted in either 12 or 24 hour
     * format. The longest 24-hour form is hh:mi[:ss[.ms]]
     * e.g. 00:00:00.000 - 23:59:59.999.
     * Seconds and milliseconds may be omitted as indicated by [].
     *
     * The longest 12-hour form is hh:mi[:ss[.ms]][ ][AM|PM]
     * e.g. 12:00:00.000 AM-12:59:59.999 PM
     * The AM / PM indicator is case insensitive and the space between
     * the time and AM/PM may be omitted.
     *
     * The string value is tested using regex.
     *
     * In the number form, the valid range is 0-23 (per 24-our clock). This value will always
     * be treated as a 24-hour clock hours value. When the number form is used and the optional
     * parameters are omitted (see below for details on the optional parameters), the seconds
     * and milliseconds of this Time will both be set to zero (0).
     *
     * @param _secondsToValidate Initial seconds component of this Time.
     * Valid values are 0-59.
     * @param _millisecondsToValidate Initial milliseconds component of this Time.
     * Valid values are 0-999.
     * @returns true if parameters passed represent a valid time, false
     * if not.
     */
    isValidTime(_timeOrHoursToValidate, _minutesToValidate, _secondsToValidate, _millisecondsToValidate) {
        if (typeof _timeOrHoursToValidate === 'string') {
            if (Time.TIME_VALIDATING_REGEX.test(_timeOrHoursToValidate)) {
                return true;
            }
            else {
                this._validationMessage = 'Invalid time string. Valid time formats are: hh:mi[:ss[.ms]][ ][AM|am|Am|aM|PM|pm|Pm|pM].';
                return false;
            }
        }
        if (typeof _timeOrHoursToValidate === 'number') {
            // First either 0 hours or 2359 hours is a valid nnumber to use as 
            //a time.
            if (_timeOrHoursToValidate < 0 || _timeOrHoursToValidate > 23) {
                this._validationMessage = 'Invalid numeric hours value [' + _timeOrHoursToValidate + '] - out of range. Valid values are 0-23';
                return false;
            }
            // Special case, 0 (with no minutes, seconds or milliseconds) 
            // is a valid time but it will fail mod (%) checks. Assuming 
            // if _minutesToValidate is undefined then seconds and 
            // millis will be too.
            if (_timeOrHoursToValidate === 0
                && typeof _minutesToValidate === 'undefined') {
                return true;
            }
            // Valid minutes-in-hour range is 0-59.
            if (_minutesToValidate && (_minutesToValidate < 0 || _minutesToValidate > 59)) {
                this._validationMessage = 'Invalid minutes part of time value [' + _minutesToValidate + '] - out of range. Valid minute values are 0-59';
                return false;
            }
            // Valid seconds-in-minute can only be 0-59.
            if (_secondsToValidate
                && (_secondsToValidate < 0 || _secondsToValidate > 59)) {
                this._validationMessage = 'Invalid seconds value [' + _secondsToValidate + '] - out of range. Valid seconds values are 0-59';
                return false;
            }
            // Valid milliseconds-in-second can only be 0-999.
            if (typeof _millisecondsToValidate !== 'undefined'
                && (_millisecondsToValidate < 0 || _millisecondsToValidate > 999)) {
                this._validationMessage = 'Invalid milliseconds value [' + _millisecondsToValidate + '] - out of range. Valid milliseconds values are 0-999';
                return false;
            }
        }
        // Otherwise all good.
        return true;
    }
    /**
     * @returns this Time object's hours component as a positive integer
     * between 0 and 23.
     */
    get hours() {
        return this._hours;
    }
    /**
     * @returns this Time object's minutes component as a positive integer
     * between 0 and 59.
     */
    get minutes() {
        return this._minutes;
    }
    /**
     * @returns this Time object's milliseconds component as a positive
     * integer between 0 and 999.
    */
    get milliseconds() {
        return this._millis;
    }
    /**
     * @returns this Time object's seconds component as a positive nteger
     * between 0 and 59.
     */
    get seconds() {
        return this._secs;
    }
    /**
     * @returns today's date with its time component set to this Time.
     */
    get asTodaysDate() {
        const date = new Date();
        date.setHours(this.hours, this.minutes, this.seconds, this.milliseconds);
        return date;
    }
    /**
     * @returns {boolean} The validation status of this Time. true for
     * valid and false for invalid.
     *
     */
    get isValid() {
        return this._valid;
    }
    /**
     * @returns a string containing the validation failure message for
     * this Time or '' (an empty string) if no messages have been added.
     *
     * Although a time value (number or string) or the various constructor
     * parameters may be invalid in a number of ways, the validation check
     * fails fast so the reason stored in validationMessage may not be the
     * only reason a paramter or set of parameters is wrong. Correcting
     * the parameter(s) may therefore result in further errors so debugging
     * will be required to achieve a valid result.
     *
     */
    get validationMessages() {
        return this._validationMessage;
    }
    /**
     * Extracts the time component of a Date object and returns a new Time object representing
     * that time.
     *
     * @param _dateTime a Date object.
     * @returns a new Date object with its time components (hours, minutes, seconda and
     * milliseconds) set to those of this Time.
     */
    static timeFromDate(_dateTime) {
        return new Time(_dateTime.getHours(), _dateTime.getMinutes(), _dateTime.getSeconds(), _dateTime.getMilliseconds());
    }
    /**
     *
     * @param _date The date to which this Time component will be added.
     * @returns a new date object with the year, month and day of _date
     * and hours, minutes, seconds and milliseconds set to those of this
     * Time. The input date's time value will be replaced by
     * this Time object's time value in the new Date object returned.
     */
    dateWithThisTime(_date) {
        const newDate = new Date(_date);
        newDate.setHours(this.hours, this.minutes, this.seconds, this.milliseconds);
        return newDate;
    }
    /**
     * @returns a whole number representing this Time in milliseconds since
     * midnight.
     */
    get milliSecondsSinceMidnight() {
        return (this.hours * Time.MILLISECONDS_IN_HOUR)
            + (this.minutes * Time.MILLISECONDS_IN_MINUTE)
            + (this.seconds * Time.MILLISECONDS_IN_SECOND)
            + this.milliseconds;
    }
    /**
     * @returns this Time's seconds value divided by
     * {@link Time.SECONDS_IN_MINUTE} to give a decimal fraction representing
     * the fraction of time through the hour this Time represents. This may
     * be useful in positioning UI components meant to visually align with
     * time measures on a page.
     */
    get secondsAsDecimalFractionOfMinute() {
        return (this.seconds === 0) ? 0 : this.seconds / Time.SECONDS_IN_MINUTE;
    }
    /**
     * @returns this Time's minutes value divided by
     * {@link Time.MINUTES_IN_HOUR} to give a decimal fraction representing
     * the fraction of time through the hour this Time represents. This may
     * be useful in positioning UI components meant to visually align with
     * time measures on a page.
     */
    get minutesAsDecimalFractionOfHour() {
        return (this.minutes === 0) ? 0 : this.minutes / Time.MINUTES_IN_HOUR;
    }
    /**
     * @returns this Time's millisecondsSinceMidnight value divided by
     * {@link Time.MILLISECONDS_IN_DAY} to give a decimal fraction
     * representing the fraction of a day this Time represents. This may be
     * useful in positioning UI components meant to visually align with time
     * measures on a page.
     */
    get asDecimalFractionOfDay() {
        if (this.milliSecondsSinceMidnight === 0)
            return 0;
        return this.milliSecondsSinceMidnight / Time.MILLISECONDS_IN_DAY;
    }
    /**
     * Adds (or subtracts) the hours, minutes, seconds and milliseconds
     * passed to this Time.
     *
     * The method adds all defined parameters into a single millisecond
     * total then adds this total to this Time.
     *
     * BEWARE:  If the total milliseconds in all supplied paramaters total
     * more than a day, the resulting time will be the time of day in a
     * past or future day the date / time addition results in. But since
     * this is a Time only class, only the time part of that day will be
     * represented. So the increment / decrement may appear smaller than
     * expected or as an increment when the user expected a decrement and
     * vice versa.
     *
     * EXAMPLE 1: this Time is currently 9:00:00.000 AM
     * Passing _hours=-1, _minutes=0, _seconds=0, milliseconds=172,800,000
     * The resulting new value of this Time would be 8:00:00.000 AM.
     * This is because 172,800,000 is 48 hours. So while -1 hours will be
     * added, 48 hours will also be added resulting in 8:00 AM in two
     * days time. But since this is a Time class only, no indication of
     * the additional days is given. Thus, time will appear to have been
     * decremented.
     *
     * EXAMPLE 2: this Time = 11:54:23.999 AM
     * Passing _hours=-72, _minutes=0,_seconds=90, _milliseconds=0
     * This Time will be set to 11:55:53.999.
     * This is because -72 hours is exactly 3 days. Days are not
     * represented in the Time class so we are effectively arriving at
     * 11:54:23.999 three days earlier then adding 90 seconds to that
     * time, resulting in a 90 second net increment to this Time (since
     * no day parts are retained).
     *
     * Finally, if the sum of all parameters adds up to zero (0)
     * milliseconds, the method will silently return and nothing will
     * change.
     *
     * @param _hours number of hours to add (-ve or +ve). Digits to
     * the right of any decimal point will be ignored per Math.floor().
     * @param _minutes number of minutes (-ve or +ve). Digits to the right
     * of any decimal point will be ignored per Math.floor().
     * @param _seconds number of seconds (-ve or +ve). Digits to the right
     * of any decimal point will be ignored per Math.floor().
     * @param _milliseconds number of minutes (-ve or +ve). Digits to the
     * right of any decimal point will be ignored per Math.floor().
     */
    addTime(_hours, _minutes, _seconds, _milliseconds) {
        const intHours = this.timeToInteger(_hours);
        const intMinutes = this.timeToInteger((_minutes) ? _minutes : 0);
        const intSeconds = this.timeToInteger((_seconds) ? _seconds : 0);
        const intMilliseconds = this.timeToInteger((_milliseconds) ? _milliseconds : 0);
        // First sum everything into a millisecond total.
        const mightyMillisecondTotal = (intHours * Time.MILLISECONDS_IN_HOUR)
            + (intMinutes * Time.MILLISECONDS_IN_MINUTE)
            + (intSeconds * Time.MILLISECONDS_IN_SECOND)
            + intMilliseconds;
        // Do nothing if total milliseconds === 0;
        if (mightyMillisecondTotal === 0)
            return;
        // Here begins the trickiness. A day is 86400000ms long. But the
        // current Time may be less than that number of milliseconds away
        // from the start or finish of the day. So we must arrive at a 
        // milliseconds from midnight value whichever direction the summing
        // of now and the milliseconds to add goes (-ve or +ve).
        // First Discard any whole days and the remaining milliseconds to 
        // this Time then round the result since we can only work with
        // integer numbers of milliseconds.
        let milliSecondsToAdd = Math.round((Time.MILLISECONDS_IN_DAY * ((mightyMillisecondTotal / Time.MILLISECONDS_IN_DAY) % 1)));
        const theReaminsOfTheDay = Time.MILLISECONDS_IN_DAY - this.milliSecondsSinceMidnight;
        let finalTime = 0;
        // We need to do different stuff depending on whether we are adding
        // or subtracting milliseconds.
        if (milliSecondsToAdd < 0) {
            // This is the easy case where we don't go earlier than midnight.
            if (Math.abs(milliSecondsToAdd) <= this.milliSecondsSinceMidnight) {
                finalTime = this.milliSecondsSinceMidnight + milliSecondsToAdd;
            }
            else {
                // First subtract down to midnight then subtract from midnight
                // by whatever is left of the milliseconds to subtract after 
                // that. The + (plus) addition may be confusing here. It works
                // because we already know milliSecondsToAdd is a -ve number so
                // adding it is effectively subtracting it as in: 
                // number1 + -number2
                // is the same as:
                // number1-numer2
                finalTime = Time.MILLISECONDS_IN_DAY + (milliSecondsToAdd + this.milliSecondsSinceMidnight);
            }
        }
        else {
            // We are adding a positive number of millis rather than a -ve
            // number so we are moving forward past the next midnight.
            // This is the easy case where we don't go later than midnight.
            if (Math.abs(milliSecondsToAdd) <= theReaminsOfTheDay) {
                finalTime = this.milliSecondsSinceMidnight + milliSecondsToAdd;
            }
            else {
                // We're going forward past midnight.
                finalTime = Time.MILLISECONDS_IN_DAY + (milliSecondsToAdd - theReaminsOfTheDay);
            }
        }
        // Now we have the new total milliseconds since midnight value of
        // this time. As we work out the hours, minutes and seconds to add, 
        // we decrement the millisecond total so we don't add it multiple 
        // times.
        // Hours
        const newHours = this.timeToInteger(finalTime / Time.MILLISECONDS_IN_HOUR);
        finalTime -= newHours * Time.MILLISECONDS_IN_HOUR;
        const newMinutes = this.timeToInteger(finalTime / Time.MILLISECONDS_IN_MINUTE);
        finalTime -= newMinutes * Time.MILLISECONDS_IN_MINUTE;
        const newSeconds = this.timeToInteger(finalTime / Time.MILLISECONDS_IN_SECOND);
        const newMilliseconds = finalTime - this.timeToInteger(newSeconds * Time.MILLISECONDS_IN_SECOND);
        this._hours = newHours;
        this._minutes = newMinutes;
        this._secs = newSeconds;
        this._millis = newMilliseconds;
    }
    /**
     *
     * @param _time a number with a potential decimal part.
     * @returns The floor of the number.
     */
    timeToInteger(_time) {
        return Math.floor(_time);
    }
}
exports.Time = Time;
// Handy constants.
Time.MILLISECONDS_IN_SECOND = 1000;
Time.SECONDS_IN_MINUTE = 60;
Time.MINUTES_IN_HOUR = 60;
Time.HOURS_IN_DAY = 24;
Time.MILLISECONDS_IN_MINUTE = 60000;
Time.MILLISECONDS_IN_HOUR = 3600000;
Time.MILLISECONDS_IN_DAY = 86400000;
// Time validation regex.
Time.TIME_VALIDATING_REGEX = /^(?:(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,3}))?)?|(0?\d|1(?:0|1|2)):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,3}))?)? ?((?:A|a)(?:m|M)|(?:P|p)(?:m|M)))$/;
