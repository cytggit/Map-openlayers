defineSuite([
        'Core/Spherical',
        'Core/Cartesian3',
        'Core/Math'
    ], function(
        Spherical,
        Cartesian3,
        CesiumMath) {
    'use strict';

    //Mock object to make sure methods take non-sphericals.
    function NotSpherical(clock, cone, magnitude) {
        this.clock = clock;
        this.cone = cone;
        this.magnitude = magnitude;
    }

    NotSpherical.areEqual = function(left, right) {
        return left.clock === right.clock && left.cone === right.cone && left.magnitude === right.magnitude;
    };

    it('Default constructing sets properties to their expected values.', function() {
        var v = new Spherical();
        expect(v.clock).toEqual(0);
        expect(v.cone).toEqual(0);
        expect(v.magnitude).toEqual(1.0);
    });

    it('Construtor parameters are assigned to the appropriate properties', function() {
        var v = new Spherical(1, 2, 3);
        expect(v.clock).toEqual(1);
        expect(v.cone).toEqual(2);
        expect(v.magnitude).toEqual(3);
    });

    var fortyFiveDegrees = Math.PI / 4.0;
    var sixtyDegrees = Math.PI / 3.0;
    var cartesian = new Cartesian3(1.0, Math.sqrt(3.0), -2.0);
    var spherical = new Spherical(sixtyDegrees, fortyFiveDegrees + Math.PI / 2.0, Math.sqrt(8.0));

    it('Can convert Cartesian3 to a new spherical instance', function() {
        expect(spherical).toEqualEpsilon(Spherical.fromCartesian3(cartesian), CesiumMath.EPSILON15);
    });

    it('Can convert Cartesian3 to an existing spherical instance', function() {
        var existing = new Spherical();
        expect(spherical).toEqualEpsilon(Spherical.fromCartesian3(cartesian, existing), CesiumMath.EPSILON15);
        expect(spherical).toEqualEpsilon(existing, CesiumMath.EPSILON15);
    });

    it('Cloning with no result parameter returns a new instance.', function() {
        var v = new Spherical(1, 2, 3);
        var w = v.clone();
        expect(v === w).toEqual(false);
        expect(v).toEqual(w);
    });

    it('Cloning with result modifies existing instance and returns it.', function() {
        var v = new Spherical(1, 2, 3);
        var w = new NotSpherical();
        expect(NotSpherical.areEqual(v, w)).toEqual(false);
        var q = v.clone(w);
        expect(v === w).toEqual(false);
        expect(q === w).toEqual(true);
        expect(NotSpherical.areEqual(v, w)).toEqual(true);
    });

    it('Normalizing with no result parameter creates new instance and sets magntitude to 1.0', function() {
        var v = new Spherical(0, 2, 3);
        var w = Spherical.normalize(v);
        expect(w).not.toEqual(v);
        expect(w.clock).toEqual(0);
        expect(w.cone).toEqual(2);
        expect(w.magnitude).toEqual(1);
    });

    it('Normalizing with result parameter modifies instance and sets magntitude to 1.0', function() {
        var v = new Spherical(0, 2, 3);
        var w = new NotSpherical();
        var q = Spherical.normalize(v, w);
        expect(w).not.toEqual(v);
        expect(w === q).toEqual(true);
        expect(w.clock).toEqual(0);
        expect(w.cone).toEqual(2);
        expect(w.magnitude).toEqual(1);
    });

    it('Normalizing with this as result parameter modifies instance and sets magntitude to 1.0', function() {
        var v = new Spherical(0, 2, 3);
        var q = Spherical.normalize(v, v);
        expect(v === q).toEqual(true);
        expect(v.clock).toEqual(0);
        expect(v.cone).toEqual(2);
        expect(v.magnitude).toEqual(1);
    });

    it('equalsEpsilon returns true for expected values.', function() {
        expect(new Spherical(1, 2, 1)).toEqualEpsilon(new NotSpherical(1, 2, 1), 0);
        expect(new Spherical(1, 2, 1)).toEqualEpsilon(new NotSpherical(1, 2, 2), 1);
    });

    it('equalsEpsilon returns false for expected values.', function() {
        expect(new Spherical(1, 2, 1)).not.toEqualEpsilon(new NotSpherical(1, 2, 3), 1);
    });

    it('toString returns the expected format.', function() {
        var v = new Spherical(1, 2, 3);
        expect(v.toString()).toEqual('(1, 2, 3)');
    });
});
