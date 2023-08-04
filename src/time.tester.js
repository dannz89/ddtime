"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Time_1 = require("./Time");
const time = new Time_1.Time('12:15:23.1 AM');
console.log(time.isValid);
console.log(time.validationMessages);
console.log(time.hours, time.minutes, time.seconds, time.milliseconds);
