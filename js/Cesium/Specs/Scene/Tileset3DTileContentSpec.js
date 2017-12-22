defineSuite([
        'Scene/Tileset3DTileContent',
        'Core/Cartesian3',
        'Core/HeadingPitchRange',
        'Scene/Cesium3DTileContentState',
        'Specs/Cesium3DTilesTester',
        'Specs/createScene'
    ], function(
        Tileset3DTileContent,
        Cartesian3,
        HeadingPitchRange,
        Cesium3DTileContentState,
        Cesium3DTilesTester,
        createScene) {
    'use strict';

    var scene;
    var centerLongitude = -1.31968;
    var centerLatitude = 0.698874;

    var tilesetOfTilesetsUrl = './Data/Cesium3DTiles/Tilesets/TilesetOfTilesets/';

    beforeAll(function() {
        scene = createScene();

        // Point the camera at the center and far enough way to only load the root tile
        var center = Cartesian3.fromRadians(centerLongitude, centerLatitude);
        scene.camera.lookAt(center, new HeadingPitchRange(0.0, -1.57, 100.0));
    });

    afterAll(function() {
        scene.destroyForSpecs();
    });

    afterEach(function() {
        scene.primitives.removeAll();
    });

    it('resolves readyPromise', function() {
        return Cesium3DTilesTester.resolvesReadyPromise(scene, tilesetOfTilesetsUrl);
    });

    it('destroys', function() {
        return Cesium3DTilesTester.tileDestroys(scene, tilesetOfTilesetsUrl);
    });

    it('gets properties', function() {
        return Cesium3DTilesTester.loadTileset(scene, tilesetOfTilesetsUrl).then(function(tileset) {
            var tile = tileset._root;
            var content = tile.content;
            expect(content.featuresLength).toBe(0);
            expect(content.pointsLength).toBe(0);
            expect(content.trianglesLength).toBe(0);
            expect(content.geometryByteLength).toBe(0);
            expect(content.texturesByteLength).toBe(0);
            expect(content.batchTableByteLength).toBe(0);
            expect(content.innerContents).toBeUndefined();
            expect(content.readyPromise).toBeDefined();
            expect(content.tileset).toBe(tileset);
            expect(content.tile).toBe(tile);
            expect(content.url).toBeDefined();
            expect(content.batchTable).toBeUndefined();
            expect(content.hasProperty(0, 'name')).toBe(false);
            expect(content.getFeature(0)).toBeUndefined();
        });
    });

}, 'WebGL');
