# ddtime - Dan's Dodgy Time class.
Typescript time-only handling without Date.

This module is a vanilla Typescript module intended to provide convenient handling of time-only values. It exports one class:

Time

The Time class stores, hours, minutes, seconds and milliseconds. Per the documentation, its constructor will accept a mandatory number|string parameter and is 
overloaded to accept optional minutes, seconds and milliseconds values. All being successfully validated, a Time instance will result witih various methods to
access its hours, minutes, seconds and milliseconds components as well as add (or subtract) hours, minutes, seconds and milliseconds per JSDoc.
