defineSuite([
        'Core/TileAvailability',
        'Core/Cartographic',
        'Core/GeographicTilingScheme',
        'Core/Rectangle',
        'Core/WebMercatorTilingScheme'
    ], function(
        TileAvailability,
        Cartographic,
        GeographicTilingScheme,
        Rectangle,
        WebMercatorTilingScheme) {
    'use strict';

    var webMercator = new WebMercatorTilingScheme();
    var geographic = new GeographicTilingScheme();

    describe('computeMaximumLevelAtPosition', function() {
        it('throws if given a position outside the tiling scheme', function() {
            var availability = new TileAvailability(webMercator, 15);
            expect(function() {
                availability.computeMaximumLevelAtPosition(Cartographic.fromDegrees(25.0, 88.0));
            }).toThrowDeveloperError();
        });

        it('returns 0 if there are no rectangles', function() {
            var availability = new TileAvailability(geographic, 15);
            expect(availability.computeMaximumLevelAtPosition(Cartographic.fromDegrees(25.0, 88.0))).toBe(0);
        });

        it('returns the higher level when on a boundary at level 0', function() {
            var availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(0, 0, 0, 0, 0);
            availability.addAvailableTileRange(1, 1, 0, 1, 0);
            expect(availability.computeMaximumLevelAtPosition(Cartographic.fromRadians(0.0, 0.0))).toBe(1);

            // Make sure it isn't dependent on the order we add the rectangles.
            availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(1, 1, 0, 1, 0);
            availability.addAvailableTileRange(0, 0, 0, 0, 0);
            expect(availability.computeMaximumLevelAtPosition(Cartographic.fromRadians(0.0, 0.0))).toBe(1);
        });

        it('returns the higher level when on a boundary at level 1', function() {
            var availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(0, 0, 0, 1, 0);
            availability.addAvailableTileRange(1, 1, 1, 1, 1);
            expect(availability.computeMaximumLevelAtPosition(Cartographic.fromRadians(-Math.PI / 2.0, 0.0))).toBe(1);
        });
    });

    describe('computeBestAvailableLevelOverRectangle', function() {
        it('returns 0 if there are no rectangles', function() {
            var availability = new TileAvailability(geographic, 15);
            expect(availability.computeBestAvailableLevelOverRectangle(Rectangle.fromDegrees(1.0, 2.0, 3.0, 4.0))).toBe(0);
        });

        it('reports the correct level when entirely inside a worldwide rectangle of that level', function() {
            var availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(5, 0, 0, geographic.getNumberOfXTilesAtLevel(5) - 1, geographic.getNumberOfYTilesAtLevel(5) - 1);
            availability.addAvailableTileRange(6, 7, 8, 9, 10);
            expect(availability.computeBestAvailableLevelOverRectangle(Rectangle.fromDegrees(1.0, 2.0, 3.0, 4.0))).toBe(5);
        });

        it('reports the correct level when entirely inside a smaller rectangle of that level', function() {
            var availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(5, 0, 0, geographic.getNumberOfXTilesAtLevel(5) - 1, geographic.getNumberOfYTilesAtLevel(5) - 1);
            availability.addAvailableTileRange(6, 7, 8, 9, 10);
            var rectangle = geographic.tileXYToRectangle(8, 9, 6);
            expect(availability.computeBestAvailableLevelOverRectangle(rectangle)).toBe(6);
        });

        it ('reports the correct level when partially overlapping a smaller rectangle', function() {
            var availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(5, 0, 0, geographic.getNumberOfXTilesAtLevel(5) - 1, geographic.getNumberOfYTilesAtLevel(5) - 1);
            availability.addAvailableTileRange(6, 7, 8, 7, 8);
            var rectangle = geographic.tileXYToRectangle(7, 8, 6);
            rectangle.west -= 0.01;
            rectangle.east += 0.01;
            rectangle.south -= 0.01;
            rectangle.north += 0.01;
            expect(availability.computeBestAvailableLevelOverRectangle(rectangle)).toBe(5);
        });

        it('works with a rectangle crossing 180 degrees longitude', function() {
            var availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(5, 0, 0, geographic.getNumberOfXTilesAtLevel(5) - 1, geographic.getNumberOfYTilesAtLevel(5) - 1);
            availability.addAvailableTileRange(6, 0, 0, 10, geographic.getNumberOfYTilesAtLevel(6) - 1);
            availability.addAvailableTileRange(6, geographic.getNumberOfXTilesAtLevel(6) - 11, 0, geographic.getNumberOfXTilesAtLevel(6) - 1, geographic.getNumberOfYTilesAtLevel(6) - 1);
            var rectangle = Rectangle.fromDegrees(179.0, 45.0, -179.0, 50.0);
            expect(availability.computeBestAvailableLevelOverRectangle(rectangle)).toBe(6);

            rectangle = Rectangle.fromDegrees(45.0, 45.0, -45.0, 50.0);
            expect(availability.computeBestAvailableLevelOverRectangle(rectangle)).toBe(5);
        });

        it('works when four rectangles combine to cover the area', function() {
            var availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(5, 0, 0, geographic.getNumberOfXTilesAtLevel(5) - 1, geographic.getNumberOfYTilesAtLevel(5) - 1);
            availability.addAvailableTileRange(6, 0, 2, 1, 3);
            availability.addAvailableTileRange(6, 2, 0, 3, 1);
            availability.addAvailableTileRange(6, 0, 0, 1, 1);
            availability.addAvailableTileRange(6, 2, 2, 3, 3);
            var rectangle = geographic.tileXYToRectangle(0, 0, 4);
            expect(availability.computeBestAvailableLevelOverRectangle(rectangle)).toBe(6);
        });
    });

    describe('addAvailableTileRange', function() {
        it('keeps availability ranges sorted by rectangle', function() {
            var availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(0, 0, 0, 1, 0);
            availability.addAvailableTileRange(1, 0, 0, 3, 1);
            expect(availability.computeMaximumLevelAtPosition(new Cartographic(-Math.PI / 2.0, 0.0))).toBe(1);

            // We should get the same result adding them in the opposite order.
            availability = new TileAvailability(geographic, 15);
            availability.addAvailableTileRange(1, 0, 0, 3, 1);
            availability.addAvailableTileRange(0, 0, 0, 1, 0);
            expect(availability.computeMaximumLevelAtPosition(new Cartographic(-Math.PI / 2.0, 0.0))).toBe(1);
        });
    });
});
