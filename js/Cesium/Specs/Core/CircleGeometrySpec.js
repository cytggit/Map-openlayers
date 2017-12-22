defineSuite([
        'Core/CircleGeometry',
        'Core/Cartesian3',
        'Core/Ellipsoid',
        'Core/Math',
        'Core/Rectangle',
        'Core/VertexFormat',
        'Specs/createPackableSpecs'
    ], function(
        CircleGeometry,
        Cartesian3,
        Ellipsoid,
        CesiumMath,
        Rectangle,
        VertexFormat,
        createPackableSpecs) {
    'use strict';

    it('throws without a center', function() {
        expect(function() {
            return new CircleGeometry({
                radius : 1.0
            });
        }).toThrowDeveloperError();
    });

    it('throws without a radius', function() {
        expect(function() {
            return new CircleGeometry({
                center : Cartesian3.fromDegrees(0,0)
            });
        }).toThrowDeveloperError();
    });

    it('throws with a negative granularity', function() {
        expect(function() {
            return new CircleGeometry({
                center : Cartesian3.fromDegrees(0,0),
                radius : 1.0,
                granularity : -1.0
            });
        }).toThrowDeveloperError();
    });

    it('computes positions', function() {
        var m = CircleGeometry.createGeometry(new CircleGeometry({
            vertexFormat : VertexFormat.POSITION_ONLY,
            ellipsoid : Ellipsoid.WGS84,
            center : Cartesian3.fromDegrees(0,0),
            granularity : 0.1,
            radius : 1.0
        }));

        var numVertices = 16; //rows of 1 + 4 + 6 + 4 + 1
        var numTriangles = 22; //rows of 3 + 8 + 8 + 3
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numTriangles * 3);
        expect(m.boundingSphere.radius).toEqual(1);
    });

    it('compute all vertex attributes', function() {
        var m = CircleGeometry.createGeometry(new CircleGeometry({
            vertexFormat : VertexFormat.ALL,
            ellipsoid : Ellipsoid.WGS84,
            center : Cartesian3.fromDegrees(0,0),
            granularity : 0.1,
            radius : 1.0
        }));

        var numVertices = 16;
        var numTriangles = 22;
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.attributes.st.values.length).toEqual(numVertices * 2);
        expect(m.attributes.normal.values.length).toEqual(numVertices * 3);
        expect(m.attributes.tangent.values.length).toEqual(numVertices * 3);
        expect(m.attributes.bitangent.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numTriangles * 3);
    });

    it('computes positions extruded', function() {
        var m = CircleGeometry.createGeometry(new CircleGeometry({
            vertexFormat : VertexFormat.POSITION_ONLY,
            ellipsoid : Ellipsoid.WGS84,
            center : Cartesian3.fromDegrees(0,0),
            granularity : 0.1,
            radius : 1.0,
            extrudedHeight: 10000
        }));

        var numVertices = 48; // 16 top circle + 16 bottom circle + 8 top edge + 8 bottom edge
        var numTriangles = 60; // 22 to fill each circle + 16 for edge wall
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numTriangles * 3);
    });

    it('compute all vertex attributes extruded', function() {
        var m = CircleGeometry.createGeometry(new CircleGeometry({
            vertexFormat : VertexFormat.ALL,
            ellipsoid : Ellipsoid.WGS84,
            center : Cartesian3.fromDegrees(0,0),
            granularity : 0.1,
            radius : 1.0,
            extrudedHeight: 10000
        }));

        var numVertices = 48;
        var numTriangles = 60;
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.attributes.st.values.length).toEqual(numVertices * 2);
        expect(m.attributes.normal.values.length).toEqual(numVertices * 3);
        expect(m.attributes.tangent.values.length).toEqual(numVertices * 3);
        expect(m.attributes.bitangent.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numTriangles * 3);
    });

    it('compute texture coordinates with rotation', function() {
        var m = CircleGeometry.createGeometry(new CircleGeometry({
            vertexFormat : VertexFormat.POSITION_AND_ST,
            ellipsoid : Ellipsoid.WGS84,
            center : Cartesian3.fromDegrees(0,0),
            granularity : 0.1,
            radius : 1.0,
            stRotation : CesiumMath.PI_OVER_TWO
        }));

        var positions = m.attributes.position.values;
        var st = m.attributes.st.values;
        var length = st.length;

        expect(positions.length).toEqual(3 * 16);
        expect(length).toEqual(2 * 16);
        expect(m.indices.length).toEqual(3 * 22);

        expect(st[length - 2]).toEqualEpsilon(0.5, CesiumMath.EPSILON2);
        expect(st[length - 1]).toEqualEpsilon(0.0, CesiumMath.EPSILON2);
    });

    it('undefined is returned if radius is equal to or less than zero', function () {
        var circle0 = new CircleGeometry({
            center : Cartesian3.fromDegrees(-75.59777, 40.03883),
            radius : 0.0
        });
        var circle1 = new CircleGeometry({
            center : Cartesian3.fromDegrees(-75.59777, 40.03883),
            radius : -10.0
        });

        var geometry0 = CircleGeometry.createGeometry(circle0);
        var geometry1 = CircleGeometry.createGeometry(circle1);

        expect(geometry0).toBeUndefined();
        expect(geometry1).toBeUndefined();
    });

    it('computing rectangle property', function() {
        var center = Cartesian3.fromDegrees(-75.59777, 40.03883);
        var ellipse = new CircleGeometry({
            center : center,
            radius : 1000.0
        });

        var r = ellipse.rectangle;
        expect(r.north).toEqual(0.6989665987920752);
        expect(r.south).toEqual(0.6986522252554146);
        expect(r.east).toEqual(-1.3192254919769824);
        expect(r.west).toEqual(-1.319634495353805);
    });

    var center = Cartesian3.fromDegrees(0,0);
    var ellipsoid = Ellipsoid.WGS84;
    var rectangle = new Rectangle(-1.5678559428873852e-7, -1.578422502906833e-7, 1.5678559428873852e-7, 1.578422502906833e-7);
    var packableInstance = new CircleGeometry({
        vertexFormat : VertexFormat.POSITION_AND_ST,
        ellipsoid : ellipsoid,
        center : center,
        granularity : 0.1,
        radius : 1.0,
        stRotation : CesiumMath.PI_OVER_TWO
    });
    var packedInstance = [center.x, center.y, center.z, ellipsoid.radii.x, ellipsoid.radii.y, ellipsoid.radii.z, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, rectangle.west, rectangle.south, rectangle.east, rectangle.north, 1.0, 1.0, 0.0, CesiumMath.PI_OVER_TWO, 0.0, 0.1, 0.0, 0.0, 0.0];
    createPackableSpecs(CircleGeometry, packableInstance, packedInstance);
});
