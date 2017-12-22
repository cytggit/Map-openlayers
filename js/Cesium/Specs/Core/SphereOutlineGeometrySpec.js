defineSuite([
        'Core/SphereOutlineGeometry',
        'Specs/createPackableSpecs'
    ], function(
        SphereOutlineGeometry,
        createPackableSpecs) {
    'use strict';

    it('constructor throws if stackPartitions less than 1', function() {
        expect(function() {
            return new SphereOutlineGeometry({
                stackPartitions: 0
            });
        }).toThrowDeveloperError();
    });

    it('constructor throws if slicePartitions less than 0', function() {
        expect(function() {
            return new SphereOutlineGeometry({
                slicePartitions: -1
            });
        }).toThrowDeveloperError();
    });

    it('constructor throws if subdivisions less than 0', function() {
        expect(function() {
            return new SphereOutlineGeometry({
                subdivisions: -2
            });
        }).toThrowDeveloperError();
    });

    it('computes positions', function() {
        var m = SphereOutlineGeometry.createGeometry(new SphereOutlineGeometry({
            stackPartitions : 2,
            slicePartitions: 2,
            subdivisions: 2
        }));

        expect(m.attributes.position.values.length).toEqual(6 * 3);
        expect(m.indices.length).toEqual(6 * 2);
        expect(m.boundingSphere.radius).toEqual(1);
    });

    it('undefined is returned if radius is equals to zero', function() {
        var sphereOutline = new SphereOutlineGeometry({
            radius : 0.0
        });

        var geometry = SphereOutlineGeometry.createGeometry(sphereOutline);

        expect(geometry).toBeUndefined();
    });

    var sphere = new SphereOutlineGeometry({
        radius : 1,
        stackPartitions : 3,
        slicePartitions: 3,
        subdivisions: 2
    });
    var packedInstance = [1.0, 1.0, 1.0, 3.0, 3.0, 2.0];
    createPackableSpecs(SphereOutlineGeometry, sphere, packedInstance);
});
