defineSuite([
        'Core/TimeInterval',
        'Core/JulianDate'
    ], function(
        TimeInterval,
        JulianDate) {
    'use strict';

    function returnTrue() {
        return true;
    }

    it('Constructor sets expected defaults.', function() {
        var interval = new TimeInterval();
        expect(interval.start).toEqual(new JulianDate());
        expect(interval.stop).toEqual(new JulianDate());
        expect(interval.isStartIncluded).toBe(true);
        expect(interval.isStopIncluded).toBe(true);
        expect(interval.data).toBeUndefined();
    });

    it('Constructor assigns all options.', function() {
        var start = JulianDate.now();
        var stop = JulianDate.addDays(start, 1, new JulianDate());
        var isStartIncluded = false;
        var isStopIncluded = false;
        var data = {};

        var interval = new TimeInterval({
            start : start,
            stop : stop,
            isStartIncluded : isStartIncluded,
            isStopIncluded : isStopIncluded,
            data : data
        });

        expect(interval.start).toEqual(start);
        expect(interval.stop).toEqual(stop);
        expect(interval.isStartIncluded).toEqual(isStartIncluded);
        expect(interval.isStopIncluded).toEqual(isStopIncluded);
        expect(interval.data).toEqual(data);
    });

    it('fromIso8601 assigns expected defaults.', function() {
        var start = JulianDate.fromIso8601('2013');
        var stop = JulianDate.fromIso8601('2014');

        var interval = TimeInterval.fromIso8601({
            iso8601 : '2013/2014'
        });

        expect(interval.start).toEqual(start);
        expect(interval.stop).toEqual(stop);
        expect(interval.isStartIncluded).toBe(true);
        expect(interval.isStopIncluded).toBe(true);
        expect(interval.data).toBeUndefined();
    });

    it('fromIso8601 assigns all options.', function() {
        var start = JulianDate.fromIso8601('2013');
        var stop = JulianDate.fromIso8601('2014');
        var isStartIncluded = false;
        var isStopIncluded = false;
        var data = {};

        var interval = TimeInterval.fromIso8601({
            iso8601 : '2013/2014',
            isStartIncluded : isStartIncluded,
            isStopIncluded : isStopIncluded,
            data : data
        });

        expect(interval.start).toEqual(start);
        expect(interval.stop).toEqual(stop);
        expect(interval.isStartIncluded).toEqual(isStartIncluded);
        expect(interval.isStopIncluded).toEqual(isStopIncluded);
        expect(interval.data).toEqual(data);
    });

    it('fromIso8601 works with result parameter.', function() {
        var start = JulianDate.fromIso8601('2013');
        var stop = JulianDate.fromIso8601('2014');
        var isStartIncluded = false;
        var isStopIncluded = false;
        var data = {};

        var expectedResult = new TimeInterval();
        var interval = TimeInterval.fromIso8601({
            iso8601 : '2013/2014',
            isStartIncluded : isStartIncluded,
            isStopIncluded : isStopIncluded,
            data : data
        }, expectedResult);

        expect(expectedResult).toBe(interval);
        expect(interval.start).toEqual(start);
        expect(interval.stop).toEqual(stop);
        expect(interval.isStartIncluded).toEqual(isStartIncluded);
        expect(interval.isStopIncluded).toEqual(isStopIncluded);
        expect(interval.data).toEqual(data);
    });

    it('toIso8601 works', function() {
        var isoDate1 = '0950-01-02T03:04:05Z';
        var isoDate2 = '0950-01-03T03:04:05Z';
        var interval = new TimeInterval({
            start : JulianDate.fromIso8601(isoDate1),
            stop : JulianDate.fromIso8601(isoDate2)
        });
        expect(TimeInterval.toIso8601(interval)).toEqual('0950-01-02T03:04:05Z/0950-01-03T03:04:05Z');
    });

    it('can round-trip with ISO8601', function() {
        var interval = new TimeInterval({
            start : JulianDate.now(),
            stop : JulianDate.now()
        });
        expect(TimeInterval.fromIso8601({
            iso8601 : TimeInterval.toIso8601(interval)
        })).toEqual(interval);
    });

    it('toIso8601 works with specified precision', function() {
        var isoDate1 = '0950-01-02T03:04:05.012345Z';
        var isoDate2 = '0950-01-03T03:04:05.012345Z';
        var interval = new TimeInterval({
            start : JulianDate.fromIso8601(isoDate1),
            stop : JulianDate.fromIso8601(isoDate2)
        });
        expect(TimeInterval.toIso8601(interval, 0)).toEqual('0950-01-02T03:04:05Z/0950-01-03T03:04:05Z');
        expect(TimeInterval.toIso8601(interval, 7)).toEqual('0950-01-02T03:04:05.0123450Z/0950-01-03T03:04:05.0123450Z');
    });

    it('isEmpty is false for a non-empty interval', function() {
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(2)
        });
        expect(interval.isEmpty).toEqual(false);
    });

    it('isEmpty is false for an instantaneous interval closed on both ends', function() {
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(1)
        });
        expect(interval.isEmpty).toEqual(false);
    });

    it('isEmpty is true for an instantaneous interval open on both ends', function() {
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(1),
            isStartIncluded : false,
            isStopIncluded : false
        });
        expect(interval.isEmpty).toEqual(true);
    });

    it('isEmpty is true for an instantaneous interval open on start', function() {
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(1),
            isStartIncluded : false,
            isStopIncluded : true
        });
        expect(interval.isEmpty).toEqual(true);
    });

    it('isEmpty is true for an instantaneous interval open on stop', function() {
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(1),
            isStartIncluded : true,
            isStopIncluded : false
        });
        expect(interval.isEmpty).toEqual(true);
    });

    it('isEmpty is true for an interval with stop before start', function() {
        var interval = new TimeInterval({
            start : new JulianDate(5),
            stop : new JulianDate(4)
        });
        expect(interval.isEmpty).toEqual(true);
    });

    it('isEmpty is true for an instantaneous interval only closed on stop end', function() {
        var interval = new TimeInterval({
            start : new JulianDate(5),
            stop : new JulianDate(5),
            isStartIncluded : false,
            isStopIncluded : true
        });
        expect(interval.isEmpty).toEqual(true);
    });

    it('isEmpty is true for an instantaneous interval only closed on start end', function() {
        var interval = new TimeInterval({
            start : new JulianDate(5),
            stop : new JulianDate(5),
            isStartIncluded : true,
            isStopIncluded : false
        });
        expect(interval.isEmpty).toEqual(true);
    });

    it('contains works for a non-empty interval.', function() {
        var interval = new TimeInterval({
            start : new JulianDate(2451545),
            stop : new JulianDate(2451546)
        });
        expect(TimeInterval.contains(interval, new JulianDate(2451545.5))).toEqual(true);
        expect(TimeInterval.contains(interval, new JulianDate(2451546.5))).toEqual(false);
    });

    it('contains works for an empty interval.', function() {
        expect(TimeInterval.contains(TimeInterval.EMPTY, new JulianDate())).toEqual(false);
    });

    it('contains returns true at start and stop times of a closed interval', function() {
        var interval = new TimeInterval({
            start : new JulianDate(2451545),
            stop : new JulianDate(2451546),
            isStartIncluded : true,
            isStopIncluded : true
        });
        expect(TimeInterval.contains(interval, new JulianDate(2451545))).toEqual(true);
        expect(TimeInterval.contains(interval, new JulianDate(2451546))).toEqual(true);
    });

    it('contains returns false at start and stop times of an open interval', function() {
        var interval = new TimeInterval({
            start : new JulianDate(2451545),
            stop : new JulianDate(2451546),
            isStartIncluded : false,
            isStopIncluded : false
        });
        expect(TimeInterval.contains(interval, new JulianDate(2451545))).toEqual(false);
        expect(TimeInterval.contains(interval, new JulianDate(2451546))).toEqual(false);
    });

    it('equals and equalsEpsilon work', function() {
        var left = new TimeInterval();
        var right = new TimeInterval();

        expect(left.equals(right)).toEqual(true);
        expect(left.equalsEpsilon(right, 0)).toEqual(true);

        right = new TimeInterval();
        right.start = new JulianDate(-1);
        expect(left.equals(right)).toEqual(false);
        expect(left.equalsEpsilon(right, 0)).toEqual(false);

        right = new TimeInterval();
        right.stop = new JulianDate(1);
        expect(left.equals(right)).toEqual(false);
        expect(left.equalsEpsilon(right, 0)).toEqual(false);

        right = new TimeInterval();
        right.isStartIncluded = false;
        expect(left.equals(right)).toEqual(false);
        expect(left.equalsEpsilon(right, 0)).toEqual(false);

        right = new TimeInterval();
        right.isStopIncluded = false;
        expect(left.equals(right)).toEqual(false);
        expect(left.equalsEpsilon(right, 0)).toEqual(false);

        left = new TimeInterval();
        right = new TimeInterval();
        right.data = {};
        expect(left.equals(right)).toEqual(false);
        expect(left.equalsEpsilon(right, 0)).toEqual(false);

        expect(left.equals(right, returnTrue)).toEqual(true);
        expect(left.equalsEpsilon(right, 0, returnTrue)).toEqual(true);

        expect(TimeInterval.equals(undefined, undefined)).toEqual(true);
        expect(TimeInterval.equalsEpsilon(undefined, undefined, 0)).toEqual(true);

        expect(TimeInterval.equals(left, undefined)).toEqual(false);
        expect(TimeInterval.equalsEpsilon(left, undefined, 0)).toEqual(false);

        expect(TimeInterval.equals(undefined, right)).toEqual(false);
        expect(TimeInterval.equalsEpsilon(undefined, right, 0)).toEqual(false);
    });

    it('equalsEpsilon works within threshold', function() {
        var left = new TimeInterval({
            start : new JulianDate(0),
            stop : new JulianDate(1)
        });
        var right = new TimeInterval({
            start : new JulianDate(0),
            stop : new JulianDate(1, 1)
        });
        expect(left.equalsEpsilon(right, 1)).toEqual(true);
        expect(left.equalsEpsilon(right, 0.99)).toEqual(false);
    });

    it('clone returns an identical interval', function() {
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(2.5),
            isStartIncluded : true,
            isStopIncluded : false,
            data : 12
        });
        expect(interval.clone()).toEqual(interval);
    });

    it('clone works with a result parameter', function() {
        var result = new TimeInterval();
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(2.5),
            isStartIncluded : true,
            isStopIncluded : false,
            data : 12
        });
        var returnedResult = interval.clone(result);
        expect(returnedResult).toBe(result);
        expect(returnedResult).toEqual(interval);
    });

    it('clone returns undefined when parameter is undefined', function() {
        expect(TimeInterval.clone(undefined)).toBeUndefined();
    });

    it('formats as ISO8601 with toString', function() {
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(2.5)
        });
        expect(interval.toString()).toEqual(TimeInterval.toIso8601(interval));
    });

    it('intersect properly intersects with an exhaustive set of cases', function() {
        var testParameters = [
               new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2.5), isStartIncluded: true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(1.5), stop:new JulianDate(2), isStartIncluded:true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(1.5), stop:new JulianDate(2), isStartIncluded: true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2.5), isStartIncluded:true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(3), stop:new JulianDate(4), isStartIncluded:true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(0), stop:new JulianDate(0), isStartIncluded:false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2.5), isStartIncluded:true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(2), stop:new JulianDate(3), isStartIncluded:true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(2), stop:new JulianDate(2.5), isStartIncluded: true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded: true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded:false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded: false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded: true, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded: false, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded: false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded: true, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded: true, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(2), isStartIncluded: true, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(3), isStartIncluded: false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(2), stop:new JulianDate(4), isStartIncluded: false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(2), stop:new JulianDate(3), isStartIncluded: false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop:new JulianDate(3), isStartIncluded: false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(2), stop:new JulianDate(4), isStartIncluded: true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(2), stop:new JulianDate(3), isStartIncluded: true, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop: new JulianDate(1), isStartIncluded: false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop: new JulianDate(2), isStartIncluded: true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(0), stop: new JulianDate(0), isStartIncluded: false, isStopIncluded: false}),
                new TimeInterval({start:new JulianDate(1), stop: new JulianDate(3), isStartIncluded: true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(2), stop: new JulianDate(3), isStartIncluded:true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(2), stop: new JulianDate(3), isStartIncluded:true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(3), stop: new JulianDate(2), isStartIncluded: true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(3), stop: new JulianDate(3), isStartIncluded:true, isStopIncluded: true}),
                new TimeInterval({start:new JulianDate(0), stop: new JulianDate(0), isStartIncluded: false, isStopIncluded: false})];

        for (var i = 0; i < testParameters.length - 2; i = i + 3) {
            var first = testParameters[i];
            var second = testParameters[i + 1];
            var expectedResult = testParameters[i + 2];
            var intersect1 = TimeInterval.intersect(first, second, new TimeInterval());
            var intersect2 = TimeInterval.intersect(second, first, new TimeInterval());
            expect(intersect1).toEqual(intersect2);
            expect(intersect2).toEqual(intersect1);
            expect(expectedResult).toEqual(intersect1);
        }
    });

    it('intersect with undefined results in an empty interval.', function() {
        var interval = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(2)
        });
        expect(TimeInterval.intersect(interval, undefined, new TimeInterval())).toEqual(TimeInterval.EMPTY);
    });

    it('intersect with a merge callback properly merges data.', function() {
        var oneToThree = new TimeInterval({
            start : new JulianDate(1),
            stop : new JulianDate(3),
            data : 2
        });
        var twoToFour = new TimeInterval({
            start : new JulianDate(2),
            stop : new JulianDate(4),
            data : 3
        });
        var twoToThree = TimeInterval.intersect(oneToThree, twoToFour, new TimeInterval(), function(left, right) {
            return left + right;
        });
        expect(twoToThree.start).toEqual(twoToFour.start);
        expect(twoToThree.stop).toEqual(oneToThree.stop);
        expect(twoToThree.isStartIncluded).toEqual(true);
        expect(twoToThree.isStopIncluded).toEqual(true);
        expect(twoToThree.data).toEqual(5);
    });

    it('fromIso8601 throws without options object.', function() {
        expect(function() {
            TimeInterval.fromIso8601(undefined);
        }).toThrowDeveloperError();
    });

    it('fromIso8601 throws without iso8601.', function() {
        expect(function() {
            TimeInterval.fromIso8601({});
        }).toThrowDeveloperError();
    });

    it('equalsEpsilon throws without epsilon.', function() {
        var left = new TimeInterval();
        var right = new TimeInterval();
        expect(function() {
            TimeInterval.equalsEpsilon(left, right, undefined);
        }).toThrowDeveloperError();
    });

    it('intersect throws without left.', function() {
        var right = new TimeInterval();
        var result = new TimeInterval();
        expect(function() {
            TimeInterval.intersect(undefined, right, result);
        }).toThrowDeveloperError();
    });

    it('intersect throws without result.', function() {
        var left = new TimeInterval();
        var right = new TimeInterval();
        expect(function() {
            TimeInterval.intersect(left, right, undefined);
        }).toThrowDeveloperError();
    });

    it('contains throws without interval.', function() {
        var date = new JulianDate();
        expect(function() {
            TimeInterval.contains(undefined, date);
        }).toThrowDeveloperError();
    });

    it('contains throws without date.', function() {
        var timeInterval = new TimeInterval();
        expect(function() {
            TimeInterval.contains(timeInterval, undefined);
        }).toThrowDeveloperError();
    });
});
