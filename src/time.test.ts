import {describe, expect, test} from '@jest/globals';
import { Time } from './Time';

describe('Time class', () => {
  test('Time object creation', () => {
    const time = new Time(10, 30);
    expect(time.hours).toBe(10);
    expect(time.minutes).toBe(30);
    expect(time.seconds).toBe(0);
    expect(time.milliseconds).toBe(0);
    expect(time.isValid).toBe(true);
  });

  test('Adding time', () => {
    const time = new Time(10, 30);
    time.addTime(1, 15);
    expect(time.hours).toBe(11);
    expect(time.minutes).toBe(45);
  });

  test('Adding time - whacky', () =>{
    const time = new Time(7,59,47,999);
    expect(time.hours).toBe(7);
    expect(time.minutes).toBe(59);
    expect(time.seconds).toBe(47);
    expect(time.milliseconds).toBe(999);
    time.addTime(2,0,0,-Time.MILLISECONDS_IN_DAY);
    expect(time.hours).toBe(9);
    expect(time.minutes).toBe(59);
    expect(time.seconds).toBe(47);
    expect(time.milliseconds).toBe(999);
    time.addTime(-2,1,1,0);
    expect(time.hours).toBe(8);
    expect(time.minutes).toBe(0);
    expect(time.seconds).toBe(48);
    expect(time.milliseconds).toBe(999);
  })

  test('Invalid time', () => {
    const invalidTime = new Time(25, 30);
    expect(invalidTime.isValid).toBe(false);
    expect(invalidTime.validationMessages).toContain('Invalid numeric hours value');
  });

  test('Invalid time string', () => {
    const invalidTime = new Time('23:14:00.999 PM');
    expect(invalidTime.isValid).toBe(false);
    expect(invalidTime.validationMessages).toContain('Invalid time string. Valid time formats are: hh:mi[:ss[.ms]][ ][AM|am|Am|aM|PM|pm|Pm|pM].');
  });

  test('Abbreviated time string, only hours and minutes.', () => {
    const validTime = new Time('2:40PM');
    expect(validTime.isValid).toBe(true);
    expect(validTime.hours).toBe(14);
    expect(validTime.minutes).toBe(40);
    expect(validTime.seconds).toBe(0);
    expect(validTime.milliseconds).toBe(0);
    expect(validTime.milliSecondsSinceMidnight).toBe(validTime.hours*Time.MILLISECONDS_IN_HOUR+validTime.minutes*Time.MILLISECONDS_IN_MINUTE);
  });

  test('Abbreviated time string with seconds and space before AM/PM.', () => {
    const validTime = new Time('3:40:01 AM');
    expect(validTime.isValid).toBe(true);
    expect(validTime.hours).toBe(3);
    expect(validTime.minutes).toBe(40);
    expect(validTime.seconds).toBe(1);
    expect(validTime.milliseconds).toBe(0);
    expect(validTime.milliSecondsSinceMidnight).toBe(validTime.hours*Time.MILLISECONDS_IN_HOUR+validTime.minutes*Time.MILLISECONDS_IN_MINUTE+validTime.seconds*Time.MILLISECONDS_IN_SECOND);
  });

  test('Abbreviated time string with seconds and space before AM/PM.', () => {
    const validTime = new Time('12:37:01.099 PM');
    expect(validTime.isValid).toBe(true);
    expect(validTime.hours).toBe(12);
    expect(validTime.minutes).toBe(37);
    expect(validTime.seconds).toBe(1);
    expect(validTime.milliseconds).toBe(99);
    expect(validTime.milliSecondsSinceMidnight).toBe(12*Time.MILLISECONDS_IN_HOUR+37*Time.MILLISECONDS_IN_MINUTE+1*Time.MILLISECONDS_IN_SECOND+99);
  });

  // Add more test cases as needed.
});
