defineSuite([
        'Core/HeadingPitchRange'
    ], function(
        HeadingPitchRange) {
    'use strict';

    it('construct with default values', function() {
        var hpr = new HeadingPitchRange();
        expect(hpr.heading).toEqual(0.0);
        expect(hpr.pitch).toEqual(0.0);
        expect(hpr.range).toEqual(0.0);
    });

    it('construct with all values', function() {
        var hpr = new HeadingPitchRange(1.0, 2.0, 3.0);
        expect(hpr.heading).toEqual(1.0);
        expect(hpr.pitch).toEqual(2.0);
        expect(hpr.range).toEqual(3.0);
    });

    it('clone with a result parameter', function() {
        var hpr = new HeadingPitchRange(1.0, 2.0, 3.0);
        var result = new HeadingPitchRange();
        var returnedResult = HeadingPitchRange.clone(hpr, result);
        expect(hpr).not.toBe(result);
        expect(result).toBe(returnedResult);
        expect(hpr).toEqual(result);
    });

    it('clone works with a result parameter that is an input parameter', function() {
        var hpr = new HeadingPitchRange(1.0, 2.0, 3.0);
        var returnedResult = HeadingPitchRange.clone(hpr, hpr);
        expect(hpr).toBe(returnedResult);
    });

});
