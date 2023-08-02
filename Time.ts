  /**
   * Represents the time in a day (beginning at midnight) with no Date 
   * part. The time is effectively stored in 24-hour format. Additiion
   * (and subtraction) are possible via the {@link Time|addTime} method.
   */
  export class Time {
    // Handy constants.
    public static MILLISECONDS_IN_SECOND = 1000;
    public static SECONDS_IN_MINUTE = 60;
    public static MINUTES_IN_HOUR = 60;
    public static HOURS_IN_DAY = 24;
    public static MILLISECONDS_IN_MINUTE = 60000;
    public static MILLISECONDS_IN_HOUR = 3600000;
    public static MILLISECONDS_IN_DAY = 86400000;

    // Time validation regex.
    public static TIME_VALIDATING_REGEX = /^(?:(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,3}))?)?|(0?\d|1(?:0|1|2)):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,3}))?)? ?((?:A|a)(?:m|M)|(?:P|p)(?:m|M)))$/;

    // Time stores hours and minutes. This can be between 0 and 2359. 
    // Because of privacy and the validation rules, it will only ever be 
    // values resembling 24-hour clock hours and minutes times e.g. 900, 
    // 901, ..., 959, ..., 2359. Although it is a normal number,
    // it will never containe values not resembling hour-and-minute 
    // 24-hour clock times such as 999, 777, 199, 99 etc.
    private _time: number = 0; //0=midnight.
    
    // Mills and secs stored separately.
    private _secs: number = 0;
    private _millis: number = 0;
    
    // Validation status of this Time.
    private _valid: boolean = true;
    private _validationMessage: string='';

    /**
     * 
     * @param _initialTime string or whole number representing a time. 
     * 
     * The string version is time formatted in either 12 or 24 hour
     * format. The longest 24-hour form is hh:mi:ss.ms 
     * e.g. 00:00:00.000 - 23:59:59.999. 
     * Seconds and milliseconds may be omitted. 
     * 
     * The longest 12-hour form is hh:mi:ss.ms 
     * e.g. 12:00:00.000 AM-12:59:59.999 PM
     * The AM / PM indicator is case insensitive and the space between
     * the time and AM/PM may be omitted. 
     * 
     * In the number form, hours are the hundreds part and minutes are 
     * the tens part. When the number form is used and the optional 
     * parameters are omitted (see below for details on the optional 
     * parameters), the seconds and milliseconds of this Time will both 
     * be set to zero (0).
     * 
     * Invalid values (e.g. 999, 777) will fail the validation check.
     * Valid values are numbers that look visually similar to 24-hour 
     * clock times with no leading zeros.
     * e.g. 0,100,101,1000,1101,2045,2156,2359).
     */
    constructor(_initialTime: number|string);
    /**
     * 
     * @param _initialTime {@link constructor}
     * @param _initialSeconds Initial seconds component of this Time. 
     * Valid values are 0-59. Invalid values will fail the validation 
     * check and generate a runtime error.
     */
    
    constructor(_initialTime: number|string, _initialSeconds?: number);
    /**
     * 
     * @param _initialTime {@link constructor}
     * @param _initialSeconds {@link constructor}
     * @param _initialMillis Initial milliseconds component of this Time.
     * Valid values are 0-999.
     */
    constructor(_initialTime: number|string, _initialSeconds?: number, _initialMillis?: number);
    
    constructor(_initialTime: number|string, _initialSeconds?: number, _initialMillis?: number) {
      if(!this.isValidTime(_initialTime,_initialSeconds,_initialMillis)){
        this._time = 0;
        this._secs = 0;
        this._millis = 0;
        this._valid = false;
        return;
      }

      if(typeof _initialTime === 'number') {
        this._time = _initialTime;
        this._secs = (typeof _initialSeconds !== 'undefined') ? _initialSeconds : this._secs;
        this._millis = (typeof _initialMillis !== 'undefined') ? _initialMillis : this._millis;
      }

      if(typeof _initialTime === 'string') {
        const match = Time.TIME_VALIDATING_REGEX.exec(_initialTime);
        
        // Since we have already validated the string, we should theoretically not have to 
        // test for match but TypeScript needs to be sure so...
        if(match) {
          const ampm = match.findIndex(e => (e.toUpperCase() === 'AM' || e.toUpperCase() === 'PM'));

          let timeDiddle = +match[1];

          if(ampm != -1 && match[ampm].toUpperCase() === 'PM') {
            timeDiddle += (timeDiddle < 12) ? 12 : 0;
          }

          this._time = (timeDiddle*100) + +match[2];
          this._secs = (typeof match[3] !== 'undefined') ? +match[3] : 0;
          this._millis = (typeof match[4] !== 'undefined') ? +match[4] : 0;
        }
      }
    }

    /**
     * Extracts the time component of a Date object and returns a new Time 
     * object representing that time.
     * 
     * @param _dateTime Date object from which to extract time.
     * @returns a new Time object containing the time component of 
     * _dateTime.
     */
    public static timeFromDate(_dateTime:Date):Time {
      return new Time(
        _dateTime.getHours()*100+_dateTime.getMinutes(),
        _dateTime.getSeconds(),
        _dateTime.getMilliseconds());
    }


    /**
     * 
     * @param _timeToValidate string or whole number representing a time. 
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
     * In the number form, hours are the hundreds part and minutes are 
     * the tens part. When the number form is used and the optional 
     * parameters are omitted (see below for details on the optional 
     * parameters), the seconds and milliseconds of this Time will both 
     * be set to zero (0).
     * 
     * Invalid values (e.g. 999, 777) will fail the validation check.
     * Valid values are numbers that look visually similar to 24-hour 
     * clock times with no leading zeros.
     * e.g. 0,100,101,1000,1101,2045,2156,2359).
     * @param _secondsToValidate Initial seconds component of this Time. 
     * Valid values are 0-59.
     * @param _millisecondsToValidate Initial milliseconds component of this Time.
     * Valid values are 0-999.
     * @returns true if parameters passed represent a valid time, false
     * if not.
     */
    public isValidTime(_timeToValidate: string|number, _secondsToValidate?: number, _millisecondsToValidate?: number): boolean {
      if(typeof _timeToValidate === 'string'){
        if(Time.TIME_VALIDATING_REGEX.test(_timeToValidate)){
          return true;
        } else {
          this._validationMessage = 'Invalid time string. Valid time formats are: hh:mi[:ss[.ms]][ ][AM|am|Am|aM|PM|pm|Pm|pM].';
          return false;
        }
      }
      
      if(typeof _timeToValidate === 'number') {
        // First either 0 hours or 2359 hours is a valid nnumber to use as 
        //a time.
        if(_timeToValidate < 0 || _timeToValidate > 2359) {
          this._validationMessage = 'Invalid numeric time value ['+_timeToValidate+'] - out of range. Valid values are 0-2359';
          return false;
        }

        // Special case, 0 (with no seconds or millis) is a valid time but 
        // it will fail mod (%) checks. Assuming if _secondsToValidate is 
        // undefined then millis will be too.
        if(_timeToValidate === 0 
          && typeof _secondsToValidate === 'undefined') {
            return true;
        }

        // Minutes value can only be 0-59.
        if(_timeToValidate > 0) {
          const _min = _timeToValidate % 100;
          if(_min < 0 && _min > 59) {
            this._validationMessage = 'Invalid minutes part of time value ['+_min+'] - out of range. Valid minute values are 0-59'; 
            return false;
          }
        }

        // Seconds can only be 0-59.
        if(typeof _secondsToValidate !== 'undefined' 
          && (_secondsToValidate <0 || _secondsToValidate>59)) {
            this._validationMessage = 'Invalid seconds value ['+_secondsToValidate+'] - out of range. Valid seconds values are 0-59'; 
            return false;
        }

        // Milliseconds can only be 0-999.
        if(typeof _millisecondsToValidate !== 'undefined'
          && (_millisecondsToValidate<0 || _millisecondsToValidate>999)) {
            this._validationMessage = 'Invalid milliseconds value ['+_millisecondsToValidate+'] - out of range. Valid milliseconds values are 0-999'; 
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
    get hours(): number {
      if(this._time===0){
        return 0;
      }
      return (this._time - this._time%100) / 100;
    }

    /**
     * @returns this Time object's minutes component as a positive integer
     * between 0 and 59.
     */
    get minutes(): number {
      if(this._time===0) {
        return 0;
      }
      return this._time%100;
    }

    /**
     * @returns today's date with its time component set to this Time.
     */
    get asTodaysDate(): Date {
      const date = new Date();
      date.setHours(this.hours,this.minutes,this.seconds,this.milliseconds);
      return date;
    }

    /**
     * @returns this Time object's hours and minutes component as a 
     * positive integer between 0 and 2359. The value does not include 
     * seconds and milliseconds.
     */
    get asNumber():number {
      return this._time;
    }

    /**
     * @returns this Time object's milliseconds component as a positive 
     * integer between 0 and 999.
     */
    get milliseconds():number {
      return this._millis;
    }

    /**
     * @returns this Time object's seconds component as a positive nteger 
     * between 0 and 59.
     */
    get seconds():number {
      return this._secs;
    }

    /**
     * @returns {boolean} The validation status of this Time. true for 
     * valid and false for invalid.
     * 
     */
    get isValid(): boolean{
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
    get validationMessages(): string {
      return this._validationMessage;
    }

    /**
     * 
     * @param _date The date to which this Time component will be added.
     * @returns a new date object with the year, month and day of _date 
     * and hours, minutes, seconds and milliseconds set to those of this 
     * Time. The input date's time value will be replaced by
     * this Time object's time value in the new Date object returned.
     */
    public dateWithThisTime(_date:Date):Date{
      const newDate = new Date(_date);
      newDate.setHours(this.hours,this.minutes,this.seconds,this.milliseconds);
      return newDate;
    }

    /**
     * @returns a whole number representing this Time in milliseconds since
     * midnight.
     */
    get milliSecondsSinceMidnight(): number {
      return (this.hours*3600000)+(this.minutes*60000)+(this.seconds*1000)+this.milliseconds;
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
    public addTime(_hours:number,_minutes?:number,_seconds?:number,_milliseconds?:number) {
      const intHours = this.timeToInteger(_hours);
      const intMinutes = this.timeToInteger((_minutes)?_minutes:0);
      const intSeconds = this.timeToInteger((_seconds)?_seconds:0);
      const intMilliseconds = this.timeToInteger((_milliseconds)?_milliseconds:0);

      // First sum everything into a millisecond total.
      const mightyMillisecondTotal = (intHours * Time.MILLISECONDS_IN_HOUR) 
        + (intMinutes * Time.MILLISECONDS_IN_MINUTE)
        + (intSeconds * Time.MILLISECONDS_IN_SECOND)
        + intMilliseconds;

      // Do nothing if total milliseconds === 0;
      if(mightyMillisecondTotal === 0) return;

      // Here begins the trickiness. A day is 86400000ms long. But the
      // current Time may be less than that number of milliseconds away
      // from the start or finish of the day. So we must arrive at a 
      // milliseconds from midnight value whichever direction the summing
      // of now and the milliseconds to add goes (-ve or +ve).
      
      // First Discard any whole days and the remaining milliseconds to 
      // this Time then round the result since we can only work with
      // integer numbers of milliseconds.
      let milliSecondsToAdd = Math.round((Time.MILLISECONDS_IN_DAY * ((mightyMillisecondTotal / Time.MILLISECONDS_IN_DAY)%1)));
      
      const theReaminsOfTheDay = Time.MILLISECONDS_IN_DAY - this.milliSecondsSinceMidnight;
      
      let finalTime = 0;

      // We need to do different stuff depending on whether we are adding
      // or subtracting milliseconds.
      if(milliSecondsToAdd<0) {
        // This is the easy case where we don't go earlier than midnight.
        if(Math.abs(milliSecondsToAdd) <= this.milliSecondsSinceMidnight) {
          finalTime = this.milliSecondsSinceMidnight + milliSecondsToAdd;
        } else {
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
      } else {
        // We are adding a positive number of millis rather than a -ve
        // number so we are moving forward past the next midnight.

        // This is the easy case where we don't go later than midnight.
        if(Math.abs(milliSecondsToAdd) <= theReaminsOfTheDay) {
          finalTime = this.milliSecondsSinceMidnight + milliSecondsToAdd;
        } else {
          // We're going forward past midnight.
          finalTime = Time.MILLISECONDS_IN_DAY + (milliSecondsToAdd - theReaminsOfTheDay)
        }
      }
      
      // Now we have the new total milliseconds since midnight value of
      // this time. As we work out the hours, minutes and seconds to add, 
      // we decrement the millisecond total so we don't add it multiple 
      // times.
      
      // Hours
      const newHours = this.timeToInteger(finalTime / Time.MILLISECONDS_IN_HOUR) * 100;
      
      finalTime -= newHours*Time.MILLISECONDS_IN_HOUR;
      
      const newMinutes = this.timeToInteger(finalTime / Time.MILLISECONDS_IN_MINUTE);

      // Remember that this class stores the hours and minutes part as
      // one number.
      const newTime = newHours+newMinutes;

      finalTime -= newMinutes*Time.MILLISECONDS_IN_MINUTE;

      const newSeconds = this.timeToInteger(finalTime / Time.MILLISECONDS_IN_SECOND);

      const newMilliseconds = finalTime - this.timeToInteger(newSeconds*Time.MILLISECONDS_IN_SECOND);

      this._time = newTime;
      this._secs = newSeconds;
      this._millis = newMilliseconds;
    }

    /**
     * 
     * @param _time a number with a potential decimal part.
     * @returns The floor of the number.
     */
    private timeToInteger(_time:number):number {
      return Math.floor(_time);
    }
  }