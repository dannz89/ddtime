"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Time_1 = require("./Time");
(0, globals_1.describe)('Time class', () => {
    (0, globals_1.test)('Time object creation', () => {
        const time = new Time_1.Time(10, 30);
        (0, globals_1.expect)(time.hours).toBe(10);
        (0, globals_1.expect)(time.minutes).toBe(30);
        (0, globals_1.expect)(time.seconds).toBe(0);
        (0, globals_1.expect)(time.milliseconds).toBe(0);
        (0, globals_1.expect)(time.isValid).toBe(true);
    });
    (0, globals_1.test)('Adding time', () => {
        const time = new Time_1.Time(10, 30);
        time.addTime(1, 15);
        (0, globals_1.expect)(time.hours).toBe(11);
        (0, globals_1.expect)(time.minutes).toBe(45);
    });
    (0, globals_1.test)('Adding time - whacky', () => {
        const time = new Time_1.Time(7, 59, 47, 999);
        (0, globals_1.expect)(time.hours).toBe(7);
        (0, globals_1.expect)(time.minutes).toBe(59);
        (0, globals_1.expect)(time.seconds).toBe(47);
        (0, globals_1.expect)(time.milliseconds).toBe(999);
        time.addTime(2, 0, 0, -Time_1.Time.MILLISECONDS_IN_DAY);
        (0, globals_1.expect)(time.hours).toBe(9);
        (0, globals_1.expect)(time.minutes).toBe(59);
        (0, globals_1.expect)(time.seconds).toBe(47);
        (0, globals_1.expect)(time.milliseconds).toBe(999);
        time.addTime(-2, 1, 1, 0);
        (0, globals_1.expect)(time.hours).toBe(8);
        (0, globals_1.expect)(time.minutes).toBe(0);
        (0, globals_1.expect)(time.seconds).toBe(48);
        (0, globals_1.expect)(time.milliseconds).toBe(999);
    });
    (0, globals_1.test)('Invalid time', () => {
        const invalidTime = new Time_1.Time(25, 30);
        (0, globals_1.expect)(invalidTime.isValid).toBe(false);
        (0, globals_1.expect)(invalidTime.validationMessages).toContain('Invalid numeric hours value');
    });
    (0, globals_1.test)('Invalid time string', () => {
        const invalidTime = new Time_1.Time('23:14:00.999 PM');
        (0, globals_1.expect)(invalidTime.isValid).toBe(false);
        (0, globals_1.expect)(invalidTime.validationMessages).toContain('Invalid time string. Valid time formats are: hh:mi[:ss[.ms]][ ][AM|am|Am|aM|PM|pm|Pm|pM].');
    });
    (0, globals_1.test)('Abbreviated time string, only hours and minutes.', () => {
        const validTime = new Time_1.Time('2:40PM');
        (0, globals_1.expect)(validTime.isValid).toBe(true);
        (0, globals_1.expect)(validTime.hours).toBe(14);
        (0, globals_1.expect)(validTime.minutes).toBe(40);
        (0, globals_1.expect)(validTime.seconds).toBe(0);
        (0, globals_1.expect)(validTime.milliseconds).toBe(0);
        (0, globals_1.expect)(validTime.milliSecondsSinceMidnight).toBe(validTime.hours * Time_1.Time.MILLISECONDS_IN_HOUR + validTime.minutes * Time_1.Time.MILLISECONDS_IN_MINUTE);
    });
    (0, globals_1.test)('Abbreviated time string with seconds and space before AM/PM.', () => {
        const validTime = new Time_1.Time('3:40:01 AM');
        (0, globals_1.expect)(validTime.isValid).toBe(true);
        (0, globals_1.expect)(validTime.hours).toBe(3);
        (0, globals_1.expect)(validTime.minutes).toBe(40);
        (0, globals_1.expect)(validTime.seconds).toBe(1);
        (0, globals_1.expect)(validTime.milliseconds).toBe(0);
        (0, globals_1.expect)(validTime.milliSecondsSinceMidnight).toBe(validTime.hours * Time_1.Time.MILLISECONDS_IN_HOUR + validTime.minutes * Time_1.Time.MILLISECONDS_IN_MINUTE + validTime.seconds * Time_1.Time.MILLISECONDS_IN_SECOND);
    });
    (0, globals_1.test)('Abbreviated time string with seconds and space before AM/PM.', () => {
        const validTime = new Time_1.Time('12:37:01.099 PM');
        (0, globals_1.expect)(validTime.isValid).toBe(true);
        (0, globals_1.expect)(validTime.hours).toBe(12);
        (0, globals_1.expect)(validTime.minutes).toBe(37);
        (0, globals_1.expect)(validTime.seconds).toBe(1);
        (0, globals_1.expect)(validTime.milliseconds).toBe(99);
        (0, globals_1.expect)(validTime.milliSecondsSinceMidnight).toBe(12 * Time_1.Time.MILLISECONDS_IN_HOUR + 37 * Time_1.Time.MILLISECONDS_IN_MINUTE + 1 * Time_1.Time.MILLISECONDS_IN_SECOND + 99);
    });
    // Add more test cases as needed.
});
