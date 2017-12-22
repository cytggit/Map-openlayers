defineSuite([
        'Core/OrthographicFrustum',
        'Core/Cartesian2',
        'Core/Cartesian3',
        'Core/Cartesian4',
        'Core/Math',
        'Core/Matrix4',
        'Specs/createPackableSpecs'
    ], function(
        OrthographicFrustum,
        Cartesian2,
        Cartesian3,
        Cartesian4,
        CesiumMath,
        Matrix4,
        createPackableSpecs) {
    'use strict';

    var frustum, planes;

    beforeEach(function() {
        frustum = new OrthographicFrustum();
        frustum.near = 1.0;
        frustum.far = 3.0;
        frustum.width = 2.0;
        frustum.aspectRatio = 1.0;
        planes = frustum.computeCullingVolume(new Cartesian3(), Cartesian3.negate(Cartesian3.UNIT_Z, new Cartesian3()), Cartesian3.UNIT_Y).planes;
    });

    it('constructs', function() {
        var options = {
            width : 1.0,
            aspectRatio : 2.0,
            near : 3.0,
            far : 4.0,
            xOffset : 5.0,
            yOffset : 6.0
        };
        var f = new OrthographicFrustum(options);
        expect(f.width).toEqual(options.width);
        expect(f.aspectRatio).toEqual(options.aspectRatio);
        expect(f.near).toEqual(options.near);
        expect(f.far).toEqual(options.far);
    });

    it('default constructs', function() {
        var f = new OrthographicFrustum();
        expect(f.width).toBeUndefined();
        expect(f.aspectRatio).toBeUndefined();
        expect(f.near).toEqual(1.0);
        expect(f.far).toEqual(500000000.0);
    });

    it('undefined width causes an exception', function() {
        frustum.width = undefined;
        expect(function() {
            return frustum.projectionMatrix;
        }).toThrowDeveloperError();
    });

    it('undefined aspectRatio throws an exception', function() {
        frustum.aspectRatio = undefined;
        expect(function() {
            return frustum.projectionMatrix;
        }).toThrowDeveloperError();
    });

    it('out of range near plane throws an exception', function() {
        frustum.near = -1.0;
        expect(function() {
            return frustum.projectionMatrix;
        }).toThrowDeveloperError();

        frustum.far = 3.0;
        expect(function() {
            return frustum.projectionMatrix;
        }).toThrowDeveloperError();
    });

    it('negative far plane throws an exception', function() {
        frustum.far = -1.0;
        expect(function() {
            return frustum.projectionMatrix;
        }).toThrowDeveloperError();
    });

    it('computeCullingVolume with no position throws an exception', function() {
        expect(function() {
            return frustum.computeCullingVolume();
        }).toThrowDeveloperError();
    });

    it('computeCullingVolume with no direction throws an exception', function() {
        expect(function() {
            return frustum.computeCullingVolume(new Cartesian3());
        }).toThrowDeveloperError();
    });

    it('computeCullingVolume with no up throws an exception', function() {
        expect(function() {
            return frustum.computeCullingVolume(new Cartesian3(), new Cartesian3());
        }).toThrowDeveloperError();
    });

    it('get frustum left plane', function() {
        var leftPlane = planes[0];
        var expectedResult = new Cartesian4(1.0, 0.0, 0.0, 1.0);
        expect(leftPlane).toEqualEpsilon(expectedResult, CesiumMath.EPSILON4);
    });

    it('get frustum right plane', function() {
        var rightPlane = planes[1];
        var expectedResult = new Cartesian4(-1.0, 0.0, 0.0, 1.0);
        expect(rightPlane).toEqualEpsilon(expectedResult, CesiumMath.EPSILON4);
    });

    it('get frustum bottom plane', function() {
        var bottomPlane = planes[2];
        var expectedResult = new Cartesian4(0.0, 1.0, 0.0, 1.0);
        expect(bottomPlane).toEqualEpsilon(expectedResult, CesiumMath.EPSILON4);
    });

    it('get frustum top plane', function() {
        var topPlane = planes[3];
        var expectedResult = new Cartesian4(0.0, -1.0, 0.0, 1.0);
        expect(topPlane).toEqual(expectedResult, CesiumMath.EPSILON4);
    });

    it('get frustum near plane', function() {
        var nearPlane = planes[4];
        var expectedResult = new Cartesian4(0.0, 0.0, -1.0, -1.0);
        expect(nearPlane).toEqualEpsilon(expectedResult, CesiumMath.EPSILON4);
    });

    it('get frustum far plane', function() {
        var farPlane = planes[5];
        var expectedResult = new Cartesian4(0.0, 0.0, 1.0, 3.0);
        expect(farPlane).toEqualEpsilon(expectedResult, CesiumMath.EPSILON4);
    });

    it('get orthographic projection matrix', function() {
        var projectionMatrix = frustum.projectionMatrix;
        frustum = frustum._offCenterFrustum;
        var expected = Matrix4.computeOrthographicOffCenter(frustum.left, frustum.right, frustum.bottom, frustum.top, frustum.near, frustum.far, new Matrix4());
        expect(projectionMatrix).toEqualEpsilon(expected, CesiumMath.EPSILON6);
    });

    it('get pixel dimensions throws without canvas height', function() {
        expect(function() {
            return frustum.getPixelDimensions(1.0, undefined, 0.0, new Cartesian2());
        }).toThrowDeveloperError();
    });

    it('get pixel dimensions throws without canvas width', function() {
        expect(function() {
            return frustum.getPixelDimensions(undefined, 1.0, 0.0, new Cartesian2());
        }).toThrowDeveloperError();
    });

    it('get pixel dimensions throws with canvas width less than or equal to zero', function() {
        expect(function() {
            return frustum.getPixelDimensions(0.0, 1.0, 0.0, new Cartesian2());
        }).toThrowDeveloperError();
    });

    it('get pixel dimensions throws with canvas height less than or equal to zero', function() {
        expect(function() {
            return frustum.getPixelDimensions(1.0, 0.0, 0.0, new Cartesian2());
        }).toThrowDeveloperError();
    });

    it('get pixel dimensions', function() {
        var pixelSize = frustum.getPixelDimensions(1.0, 1.0, 0.0, new Cartesian2());
        expect(pixelSize.x).toEqual(2.0);
        expect(pixelSize.y).toEqual(2.0);
    });

    it('throws with undefined frustum parameters', function() {
        var frustum = new OrthographicFrustum();
        expect(function() {
            return frustum.projectionMatrix;
        }).toThrowDeveloperError();
    });

    it('clone', function() {
        var frustum2 = frustum.clone();
        expect(frustum).toEqual(frustum2);
    });

    it('clone with result parameter', function() {
        var result = new OrthographicFrustum();
        var frustum2 = frustum.clone(result);
        expect(frustum2).toBe(result);
        expect(frustum).toEqual(frustum2);
    });

    createPackableSpecs(OrthographicFrustum, new OrthographicFrustum({
        width : 1.0,
        aspectRatio : 2.0,
        near : 3.0,
        far : 4.0
    }), [1.0, 2.0, 3.0, 4.0]);
});
