defineSuite([
        'Scene/SceneTransforms',
        'Core/Cartesian2',
        'Core/Cartesian3',
        'Core/Ellipsoid',
        'Core/Math',
        'Core/OrthographicFrustum',
        'Core/Rectangle',
        'Scene/Camera',
        'Scene/SceneMode',
        'Specs/createScene'
    ], function(
        SceneTransforms,
        Cartesian2,
        Cartesian3,
        Ellipsoid,
        CesiumMath,
        OrthographicFrustum,
        Rectangle,
        Camera,
        SceneMode,
        createScene) {
    'use strict';

    var scene;
    var defaultCamera;

    beforeAll(function() {
        scene = createScene();
        defaultCamera = Camera.clone(scene.camera);
    });

    afterAll(function() {
        scene.destroyForSpecs();
    });

    beforeEach(function() {
        scene.mode = SceneMode.SCENE3D;
        scene.camera.position = defaultCamera.position.clone();
        scene.camera.direction = defaultCamera.direction.clone();
        scene.camera.up = defaultCamera.up.clone();
        scene.camera.right = defaultCamera.right.clone();
        scene.camera._transform = defaultCamera.transform.clone();
        scene.camera.frustum = defaultCamera.frustum.clone();
    });

    it('throws an exception without scene', function() {
        var position = Cartesian3.fromDegrees(0.0, 0.0);
        expect(function() {
            SceneTransforms.wgs84ToWindowCoordinates(undefined, position);
        }).toThrowDeveloperError();
    });

    it('throws an exception without position', function() {
        expect(function() {
            SceneTransforms.wgs84ToWindowCoordinates(scene);
        }).toThrowDeveloperError();
    });

    it('returns correct window position in 3D', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var positionCartographic = ellipsoid.cartesianToCartographic(scene.camera.position);
        positionCartographic.height = 0.0;
        var position = ellipsoid.cartographicToCartesian(positionCartographic);

        // Update scene state
        scene.renderForSpecs();

        var windowCoordinates = SceneTransforms.wgs84ToWindowCoordinates(scene, position);
        expect(windowCoordinates.x).toEqualEpsilon(0.5, CesiumMath.EPSILON2);
        expect(windowCoordinates.y).toEqualEpsilon(0.5, CesiumMath.EPSILON2);
    });

    it('returns correct drawing buffer position in 3D', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var positionCartographic = ellipsoid.cartesianToCartographic(scene.camera.position);
        positionCartographic.height = 0.0;
        var position = ellipsoid.cartographicToCartesian(positionCartographic);

        // Update scene state
        scene.renderForSpecs();

        var drawingBufferCoordinates = SceneTransforms.wgs84ToDrawingBufferCoordinates(scene, position);
        expect(drawingBufferCoordinates.x).toEqualEpsilon(0.5, CesiumMath.EPSILON2);
        expect(drawingBufferCoordinates.y).toEqualEpsilon(0.5, CesiumMath.EPSILON2);
    });

    it('returns undefined for window position behind camera in 3D', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var positionCartographic = ellipsoid.cartesianToCartographic(scene.camera.position);
        positionCartographic.height *= 1.1;
        var position = ellipsoid.cartographicToCartesian(positionCartographic);

        // Update scene state
        scene.renderForSpecs();

        var windowCoordinates = SceneTransforms.wgs84ToWindowCoordinates(scene, position);
        expect(windowCoordinates).not.toBeDefined();
    });

    it('returns undefined for drawing buffer position behind camera in 3D', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var positionCartographic = ellipsoid.cartesianToCartographic(scene.camera.position);
        positionCartographic.height *= 1.1;
        var position = ellipsoid.cartographicToCartesian(positionCartographic);

        // Update scene state
        scene.renderForSpecs();

        var drawingBufferCoordinates = SceneTransforms.wgs84ToDrawingBufferCoordinates(scene, position);
        expect(drawingBufferCoordinates).not.toBeDefined();
    });

    it('returns correct window position in ColumbusView', function() {
        // Update scene state
        scene.morphToColumbusView(0);
        scene.renderForSpecs();

        var actualWindowCoordinates = new Cartesian2(0.5, 0.5);
        var position = scene.camera.pickEllipsoid(actualWindowCoordinates);

        var windowCoordinates = SceneTransforms.wgs84ToWindowCoordinates(scene, position);
        expect(windowCoordinates).toEqualEpsilon(actualWindowCoordinates, CesiumMath.EPSILON2);
    });

    it('returns correct drawing buffer position in ColumbusView', function() {
        // Update scene state
        scene.morphToColumbusView(0);
        scene.renderForSpecs();

        var actualDrawingBufferCoordinates = new Cartesian2(0.5, 0.5);
        var position = scene.camera.pickEllipsoid(actualDrawingBufferCoordinates);

        var drawingBufferCoordinates = SceneTransforms.wgs84ToDrawingBufferCoordinates(scene, position);
        expect(drawingBufferCoordinates).toEqualEpsilon(actualDrawingBufferCoordinates, CesiumMath.EPSILON2);
    });

    it('returns undefined for window position behind camera in ColumbusView', function() {
        // Update scene state
        scene.morphToColumbusView(0);
        scene.renderForSpecs();

        var position = new Cartesian3();
        Cartesian3.normalize(scene.camera.position, position);
        Cartesian3.add(position, scene.camera.direction, position);
        Cartesian3.multiplyByScalar(scene.camera.direction, -1, scene.camera.direction);

        var windowCoordinates = SceneTransforms.wgs84ToWindowCoordinates(scene, position);
        expect(windowCoordinates).not.toBeDefined();
    });

    it('returns undefined for drawing buffer position behind camera in ColumbusView', function() {
        // Update scene state
        scene.morphToColumbusView(0);
        scene.renderForSpecs();

        var position = new Cartesian3();
        Cartesian3.normalize(scene.camera.position, position);
        Cartesian3.add(position, scene.camera.direction, position);
        Cartesian3.multiplyByScalar(scene.camera.direction, -1, scene.camera.direction);

        var drawingBufferCoordinates = SceneTransforms.wgs84ToDrawingBufferCoordinates(scene, position);
        expect(drawingBufferCoordinates).not.toBeDefined();
    });

    it('returns correct window position in 2D', function() {
        scene.camera.setView({
            destination : Rectangle.fromDegrees(-0.000001, -0.000001, 0.000001, 0.000001)
        });

        // Update scene state
        scene.morphTo2D(0);
        scene.renderForSpecs();

        var position = Cartesian3.fromDegrees(0,0);
        var windowCoordinates = SceneTransforms.wgs84ToWindowCoordinates(scene, position);

        expect(windowCoordinates.x).toBeGreaterThan(0.0);
        expect(windowCoordinates.y).toBeGreaterThan(0.0);

        expect(windowCoordinates.x).toBeLessThan(1.0);
        expect(windowCoordinates.y).toBeLessThan(1.0);
    });

    it('returns correct window position in 3D with orthographic frustum', function() {
        var frustum = new OrthographicFrustum();
        frustum.aspectRatio = 1.0;
        frustum.width = 20.0;
        scene.camera.frustum = frustum;

        // Update scene state
        scene.renderForSpecs();

        scene.camera.setView({
            destination : Rectangle.fromDegrees(-0.000001, -0.000001, 0.000001, 0.000001)
        });

        var position = Cartesian3.fromDegrees(0,0);
        var windowCoordinates = SceneTransforms.wgs84ToWindowCoordinates(scene, position);

        expect(windowCoordinates.x).toBeGreaterThan(0.0);
        expect(windowCoordinates.y).toBeGreaterThan(0.0);

        expect(windowCoordinates.x).toBeLessThan(1.0);
        expect(windowCoordinates.y).toBeLessThan(1.0);
    });

    it('returns correct drawing buffer position in 2D', function() {
        scene.camera.setView({
            destination : Rectangle.fromDegrees(-0.000001, -0.000001, 0.000001, 0.000001)
        });

        // Update scene state
        scene.morphTo2D(0);
        scene.renderForSpecs();

        var position = Cartesian3.fromDegrees(0,0);
        var drawingBufferCoordinates = SceneTransforms.wgs84ToDrawingBufferCoordinates(scene, position);

        expect(drawingBufferCoordinates.x).toBeGreaterThan(0.0);
        expect(drawingBufferCoordinates.y).toBeGreaterThan(0.0);

        expect(drawingBufferCoordinates.x).toBeLessThan(1.0);
        expect(drawingBufferCoordinates.y).toBeLessThan(1.0);
    });

    it('should not error when zoomed out and in 2D', function(done) {
        var scene = createScene();
        scene.camera.setView({
            destination : Cartesian3.fromDegrees(75, 15, 30000000.0)
        });

        // Update scene state
        scene.morphTo2D(0);
        scene.renderForSpecs();

        var position = Cartesian3.fromDegrees(-80, 25);
        var windowCoordinates = SceneTransforms.wgs84ToWindowCoordinates(scene, position);
        expect(windowCoordinates).toBeDefined();
        scene.destroyForSpecs();
    });
}, 'WebGL');
