defineSuite([
        'DataSources/RectangleGeometryUpdater',
        'Core/Cartesian3',
        'Core/Color',
        'Core/ColorGeometryInstanceAttribute',
        'Core/DistanceDisplayCondition',
        'Core/DistanceDisplayConditionGeometryInstanceAttribute',
        'Core/JulianDate',
        'Core/Rectangle',
        'Core/ShowGeometryInstanceAttribute',
        'Core/TimeInterval',
        'Core/TimeIntervalCollection',
        'DataSources/CheckerboardMaterialProperty',
        'DataSources/ColorMaterialProperty',
        'DataSources/ConstantProperty',
        'DataSources/Entity',
        'DataSources/GridMaterialProperty',
        'DataSources/RectangleGraphics',
        'DataSources/SampledProperty',
        'DataSources/TimeIntervalCollectionProperty',
        'Scene/GroundPrimitive',
        'Scene/PrimitiveCollection',
        'Scene/ShadowMode',
        'Specs/createDynamicGeometryBoundingSphereSpecs',
        'Specs/createDynamicProperty',
        'Specs/createScene'
    ], function(
        RectangleGeometryUpdater,
        Cartesian3,
        Color,
        ColorGeometryInstanceAttribute,
        DistanceDisplayCondition,
        DistanceDisplayConditionGeometryInstanceAttribute,
        JulianDate,
        Rectangle,
        ShowGeometryInstanceAttribute,
        TimeInterval,
        TimeIntervalCollection,
        CheckerboardMaterialProperty,
        ColorMaterialProperty,
        ConstantProperty,
        Entity,
        GridMaterialProperty,
        RectangleGraphics,
        SampledProperty,
        TimeIntervalCollectionProperty,
        GroundPrimitive,
        PrimitiveCollection,
        ShadowMode,
        createDynamicGeometryBoundingSphereSpecs,
        createDynamicProperty,
        createScene) {
    'use strict';

    var time;
    var time2;
    var time3;
    var scene;
    var groundPrimitiveSupported;

    beforeAll(function() {
        scene = createScene();
        time = new JulianDate(0, 0);
        time2 = new JulianDate(10, 0);
        time3 = new JulianDate(20, 0);
        groundPrimitiveSupported = GroundPrimitive.isSupported(scene);
    });

    afterAll(function() {
        scene.destroyForSpecs();
    });

    function createBasicRectangle() {
        var rectangle = new RectangleGraphics();
        var entity = new Entity();
        entity.rectangle = rectangle;
        entity.rectangle.coordinates = new ConstantProperty(new Rectangle(0, 0, 1, 1));
        entity.rectangle.height = new ConstantProperty(0);
        return entity;
    }

    function createBasicRectangleWithoutHeight() {
        var rectangle = new RectangleGraphics();
        var entity = new Entity();
        entity.rectangle = rectangle;
        entity.rectangle.coordinates = new ConstantProperty(new Rectangle(0, 0, 1, 1));
        return entity;
    }

    it('Constructor sets expected defaults', function() {
        var entity = new Entity();
        var updater = new RectangleGeometryUpdater(entity, scene);

        expect(updater.isDestroyed()).toBe(false);
        expect(updater.entity).toBe(entity);
        expect(updater.isClosed).toBe(false);
        expect(updater.fillEnabled).toBe(false);
        expect(updater.fillMaterialProperty).toBe(undefined);
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.hasConstantFill).toBe(true);
        expect(updater.hasConstantOutline).toBe(true);
        expect(updater.outlineColorProperty).toBe(undefined);
        expect(updater.outlineWidth).toBe(1.0);
        expect(updater.shadowsProperty).toBe(undefined);
        expect(updater.distanceDisplayCondition).toBe(undefined);
        expect(updater.isDynamic).toBe(false);
        expect(updater.isOutlineVisible(time)).toBe(false);
        expect(updater.isFilled(time)).toBe(false);
        updater.destroy();
        expect(updater.isDestroyed()).toBe(true);
    });

    it('No geometry available when rectangle is undefined ', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle = undefined;

        expect(updater.fillEnabled).toBe(false);
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.isDynamic).toBe(false);
    });

    it('No geometry available when not filled or outline.', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.fill = new ConstantProperty(false);
        entity.rectangle.outline = new ConstantProperty(false);

        expect(updater.fillEnabled).toBe(false);
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.isDynamic).toBe(false);
    });

    it('Values correct when using default graphics', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);

        expect(updater.isClosed).toBe(false);
        expect(updater.fillEnabled).toBe(true);
        expect(updater.fillMaterialProperty).toEqual(new ColorMaterialProperty(Color.WHITE));
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.hasConstantFill).toBe(true);
        expect(updater.hasConstantOutline).toBe(true);
        expect(updater.outlineColorProperty).toBe(undefined);
        expect(updater.outlineWidth).toBe(1.0);
        expect(updater.shadowsProperty).toEqual(new ConstantProperty(ShadowMode.DISABLED));
        expect(updater.distanceDisplayConditionProperty).toEqual(new ConstantProperty(new DistanceDisplayCondition()));
        expect(updater.isDynamic).toBe(false);
    });

    it('Rectangle material is correctly exposed.', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.material = new GridMaterialProperty(Color.BLUE);
        expect(updater.fillMaterialProperty).toBe(entity.rectangle.material);
    });

    it('Properly detects closed geometry.', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.extrudedHeight = new ConstantProperty(1000);
        expect(updater.isClosed).toBe(false);
        entity.rectangle.closeBottom = new ConstantProperty(true);
        expect(updater.isClosed).toBe(false);
        entity.rectangle.closeTop = new ConstantProperty(true);
        expect(updater.isClosed).toBe(true);
    });

    it('A time-varying outlineWidth causes geometry to be dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.outlineWidth = new SampledProperty(Number);
        entity.rectangle.outlineWidth.addSample(time, 1);
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying coordinates causes geometry to be dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.coordinates = new SampledProperty(Rectangle);
        entity.rectangle.coordinates.addSample(JulianDate.now(), new Rectangle());
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying height causes geometry to be dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.height = new SampledProperty(Number);
        entity.rectangle.height.addSample(time, 1);
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying extrudedHeight causes geometry to be dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.extrudedHeight = new SampledProperty(Number);
        entity.rectangle.extrudedHeight.addSample(time, 1);
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying granularity causes geometry to be dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.granularity = new SampledProperty(Number);
        entity.rectangle.granularity.addSample(time, 1);
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying stRotation causes geometry to be dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.stRotation = new SampledProperty(Number);
        entity.rectangle.stRotation.addSample(time, 1);
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying closeTop causes geometry to be dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.closeTop = new TimeIntervalCollectionProperty();
        entity.rectangle.closeTop.intervals.addInterval(new TimeInterval({
            start : time,
            stop : time2,
            data : false
        }));
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying closeBottom causes geometry to be dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        entity.rectangle.closeBottom = new TimeIntervalCollectionProperty();
        entity.rectangle.closeBottom.intervals.addInterval(new TimeInterval({
            start : time,
            stop : time2,
            data : false
        }));
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying color causes ground geometry to be dynamic', function() {
        var entity = createBasicRectangleWithoutHeight();
        var updater = new RectangleGeometryUpdater(entity, scene);
        var color = new SampledProperty(Color);
        color.addSample(time, Color.WHITE);
        entity.rectangle.material = new ColorMaterialProperty(color);
        expect(updater.isDynamic).toBe(groundPrimitiveSupported);
    });

    function validateGeometryInstance(options) {
        var entity = createBasicRectangle();

        var rectangle = entity.rectangle;
        rectangle.show = new ConstantProperty(options.show);
        rectangle.fill = new ConstantProperty(options.fill);
        rectangle.material = options.material;
        rectangle.outline = new ConstantProperty(options.outline);
        rectangle.outlineColor = new ConstantProperty(options.outlineColor);
        rectangle.rotation = new ConstantProperty(options.rotation);
        rectangle.stRotation = new ConstantProperty(options.stRotation);
        rectangle.height = new ConstantProperty(options.height);
        rectangle.extrudedHeight = new ConstantProperty(options.extrudedHeight);
        rectangle.granularity = new ConstantProperty(options.granularity);
        rectangle.closeTop = new ConstantProperty(options.closeTop);
        rectangle.closeBottom = new ConstantProperty(options.closeBottom);
        rectangle.distanceDisplayCondition = options.distanceDisplayCondition;

        var updater = new RectangleGeometryUpdater(entity, scene);

        var instance;
        var geometry;
        var attributes;
        if (options.fill) {
            instance = updater.createFillGeometryInstance(time);
            geometry = instance.geometry;
            expect(geometry._rotation).toEqual(options.rotation);
            expect(geometry._stRotation).toEqual(options.stRotation);
            expect(geometry._surfaceHeight).toEqual(options.height);
            expect(geometry._granularity).toEqual(options.granularity);
            expect(geometry._extrudedHeight).toEqual(options.extrudedHeight);
            expect(geometry._closeTop).toEqual(options.closeTop);
            expect(geometry._closeBottom).toEqual(options.closeBottom);

            attributes = instance.attributes;
            if (options.material instanceof ColorMaterialProperty) {
                expect(attributes.color.value).toEqual(ColorGeometryInstanceAttribute.toValue(options.material.color.getValue(time)));
            } else {
                expect(attributes.color).toBeUndefined();
            }
            expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(options.fill));
            if (options.distanceDisplayCondition) {
                expect(attributes.distanceDisplayCondition.value).toEqual(DistanceDisplayConditionGeometryInstanceAttribute.toValue(options.distanceDisplayCondition));
            }
        }

        if (options.outline) {
            instance = updater.createOutlineGeometryInstance(time);
            geometry = instance.geometry;
            expect(geometry._surfaceHeight).toEqual(options.height);
            expect(geometry._granularity).toEqual(options.granularity);
            expect(geometry._extrudedHeight).toEqual(options.extrudedHeight);

            attributes = instance.attributes;
            expect(attributes.color.value).toEqual(ColorGeometryInstanceAttribute.toValue(options.outlineColor));
            expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(options.fill));
            if (options.distanceDisplayCondition) {
                expect(attributes.distanceDisplayCondition.value).toEqual(DistanceDisplayConditionGeometryInstanceAttribute.toValue(options.distanceDisplayCondition));
            }
        }
    }

    it('Creates expected per-color geometry', function() {
        validateGeometryInstance({
            show : true,
            material : new ColorMaterialProperty(Color.RED),
            height : 431,
            extrudedHeight : 123,
            granularity : 0.97,
            rotation : 1,
            stRotation : 12,
            fill : true,
            outline : true,
            outlineColor : Color.BLUE,
            closeTop : false,
            closeBottom : true
        });
    });

    it('Creates expected per-material geometry', function() {
        validateGeometryInstance({
            show : true,
            material : new GridMaterialProperty(),
            height : 431,
            extrudedHeight : 123,
            granularity : 0.97,
            rotation : 1,
            stRotation : 12,
            fill : true,
            outline : true,
            outlineColor : Color.BLUE,
            closeTop : false,
            closeBottom : true
        });
    });

    it('Creates expected distance display condition geometry', function() {
        validateGeometryInstance({
            show : true,
            material : new ColorMaterialProperty(Color.RED),
            height : 431,
            extrudedHeight : 123,
            granularity : 0.97,
            rotation : 1,
            stRotation : 12,
            fill : true,
            outline : true,
            outlineColor : Color.BLUE,
            closeTop : false,
            closeBottom : true,
            distanceDisplayCondition : new DistanceDisplayCondition(10.0, 100.0)
        });
    });

    it('Correctly exposes outlineWidth', function() {
        var entity = createBasicRectangle();
        entity.rectangle.outlineWidth = new ConstantProperty(8);
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(updater.outlineWidth).toBe(8);
    });

    it('Attributes have expected values at creation time', function() {
        var fill = new TimeIntervalCollectionProperty();
        fill.intervals.addInterval(new TimeInterval({
            start : time,
            stop : time2,
            data : false
        }));
        fill.intervals.addInterval(new TimeInterval({
            start : time2,
            stop : time3,
            isStartIncluded : false,
            data : false
        }));

        var colorMaterial = new ColorMaterialProperty();
        colorMaterial.color = new SampledProperty(Color);
        colorMaterial.color.addSample(time, Color.YELLOW);
        colorMaterial.color.addSample(time2, Color.BLUE);
        colorMaterial.color.addSample(time3, Color.RED);

        var outline = new TimeIntervalCollectionProperty();
        outline.intervals.addInterval(new TimeInterval({
            start : time,
            stop : time2,
            data : false
        }));
        outline.intervals.addInterval(new TimeInterval({
            start : time2,
            stop : time3,
            isStartIncluded : false,
            data : false
        }));

        var outlineColor = new SampledProperty(Color);
        outlineColor.addSample(time, Color.BLUE);
        outlineColor.addSample(time2, Color.RED);
        outlineColor.addSample(time3, Color.YELLOW);

        var entity = createBasicRectangle();
        entity.rectangle.fill = fill;
        entity.rectangle.material = colorMaterial;
        entity.rectangle.outline = outline;
        entity.rectangle.outlineColor = outlineColor;

        var updater = new RectangleGeometryUpdater(entity, scene);

        var instance = updater.createFillGeometryInstance(time2);
        var attributes = instance.attributes;
        expect(attributes.color.value).toEqual(ColorGeometryInstanceAttribute.toValue(colorMaterial.color.getValue(time2)));
        expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(fill.getValue(time2)));

        instance = updater.createOutlineGeometryInstance(time2);
        attributes = instance.attributes;
        expect(attributes.color.value).toEqual(ColorGeometryInstanceAttribute.toValue(outlineColor.getValue(time2)));
        expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(outline.getValue(time2)));
    });

    it('Checks that an entity without height and extrudedHeight and with a color material is on terrain', function() {
        var entity = createBasicRectangle();
        entity.rectangle.height = undefined;
        entity.rectangle.outline = new ConstantProperty(true);

        var updater = new RectangleGeometryUpdater(entity, scene);

        if (groundPrimitiveSupported) {
            expect(updater.onTerrain).toBe(true);
            expect(updater.outlineEnabled).toBe(false);
        } else {
            expect(updater.onTerrain).toBe(false);
            expect(updater.outlineEnabled).toBe(true);
        }
    });

    it('Checks that an entity with height isn\'t on terrain', function() {
        var entity = createBasicRectangle();
        entity.rectangle.height = new ConstantProperty(1);

        var updater = new RectangleGeometryUpdater(entity, scene);

        expect(updater.onTerrain).toBe(false);
    });

    it('Checks that an entity with extrudedHeight isn\'t on terrain', function() {
        var entity = createBasicRectangle();
        entity.rectangle.height = undefined;
        entity.rectangle.extrudedHeight = new ConstantProperty(1);

        var updater = new RectangleGeometryUpdater(entity, scene);

        expect(updater.onTerrain).toBe(false);
    });

    it('Checks that an entity with a non-color material isn\'t on terrain', function() {
        var entity = createBasicRectangle();
        entity.rectangle.height = undefined;
        entity.rectangle.material = new GridMaterialProperty(Color.BLUE);

        var updater = new RectangleGeometryUpdater(entity, scene);

        expect(updater.onTerrain).toBe(false);
    });

    it('createFillGeometryInstance obeys Entity.show is false.', function() {
        var entity = createBasicRectangle();
        entity.show = false;
        entity.rectangle.fill = true;
        var updater = new RectangleGeometryUpdater(entity, scene);
        var instance = updater.createFillGeometryInstance(new JulianDate());
        var attributes = instance.attributes;
        expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(false));
    });

    it('createOutlineGeometryInstance obeys Entity.show is false.', function() {
        var entity = createBasicRectangle();
        entity.show = false;
        entity.rectangle.outline = true;
        var updater = new RectangleGeometryUpdater(entity, scene);
        var instance = updater.createFillGeometryInstance(new JulianDate());
        var attributes = instance.attributes;
        expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(false));
    });

    it('dynamic updater sets properties', function() {
        var rectangle = new RectangleGraphics();
        rectangle.coordinates = createDynamicProperty(new Rectangle(0, 0, 1, 1));
        rectangle.show = createDynamicProperty(true);
        rectangle.height = createDynamicProperty(3);
        rectangle.extrudedHeight = createDynamicProperty(2);
        rectangle.outline = createDynamicProperty(true);
        rectangle.fill = createDynamicProperty(true);
        rectangle.granularity = createDynamicProperty(2);
        rectangle.stRotation = createDynamicProperty(1);

        var entity = new Entity();
        entity.rectangle = rectangle;

        var updater = new RectangleGeometryUpdater(entity, scene);
        var primitives = new PrimitiveCollection();
        var groundPrimitives = new PrimitiveCollection();
        var dynamicUpdater = updater.createDynamicUpdater(primitives, groundPrimitives);
        expect(dynamicUpdater.isDestroyed()).toBe(false);
        expect(primitives.length).toBe(0);
        expect(groundPrimitives.length).toBe(0);

        dynamicUpdater.update(time);
        expect(primitives.length).toBe(2);
        expect(groundPrimitives.length).toBe(0);

        var options = dynamicUpdater._options;
        expect(options.id).toEqual(entity);
        expect(options.rectangle).toEqual(rectangle.coordinates.getValue());
        expect(options.height).toEqual(rectangle.height.getValue());
        expect(options.extrudedHeight).toEqual(rectangle.extrudedHeight.getValue());
        expect(options.granularity).toEqual(rectangle.granularity.getValue());
        expect(options.stRotation).toEqual(rectangle.stRotation.getValue());

        entity.show = false;
        dynamicUpdater.update(JulianDate.now());
        expect(primitives.length).toBe(0);
        expect(groundPrimitives.length).toBe(0);
        entity.show = true;

        //If a dynamic show returns false, the primitive should go away.
        rectangle.show.setValue(false);
        dynamicUpdater.update(time);
        expect(primitives.length).toBe(0);
        expect(groundPrimitives.length).toBe(0);

        rectangle.show.setValue(true);
        dynamicUpdater.update(time);
        expect(primitives.length).toBe(2);
        expect(groundPrimitives.length).toBe(0);

        //If a dynamic coordinates returns undefined, the primitive should go away.
        rectangle.coordinates.setValue(undefined);
        dynamicUpdater.update(time);
        expect(primitives.length).toBe(0);
        expect(groundPrimitives.length).toBe(0);

        dynamicUpdater.destroy();
        updater.destroy();
    });

    it('dynamic updater on terrain', function() {
        var rectangle = new RectangleGraphics();
        rectangle.coordinates = createDynamicProperty(new Rectangle(0, 0, 1, 1));
        rectangle.show = createDynamicProperty(true);
        rectangle.outline = createDynamicProperty(true);
        rectangle.fill = createDynamicProperty(true);
        rectangle.granularity = createDynamicProperty(2);
        rectangle.stRotation = createDynamicProperty(1);

        var entity = new Entity();
        entity.rectangle = rectangle;

        var updater = new RectangleGeometryUpdater(entity, scene);
        var primitives = new PrimitiveCollection();
        var groundPrimitives = new PrimitiveCollection();
        var dynamicUpdater = updater.createDynamicUpdater(primitives, groundPrimitives);
        expect(dynamicUpdater.isDestroyed()).toBe(false);
        expect(primitives.length).toBe(0);
        expect(groundPrimitives.length).toBe(0);

        dynamicUpdater.update(time);

        if (groundPrimitiveSupported) {
            expect(primitives.length).toBe(0);
            expect(groundPrimitives.length).toBe(1);
        } else {
            expect(primitives.length).toBe(2);
            expect(groundPrimitives.length).toBe(0);
        }

        dynamicUpdater.destroy();
        updater.destroy();
    });

    it('geometryChanged event is raised when expected', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        var listener = jasmine.createSpy('listener');
        updater.geometryChanged.addEventListener(listener);

        entity.rectangle.height = new ConstantProperty(82);
        expect(listener.calls.count()).toEqual(1);

        entity.availability = new TimeIntervalCollection();
        expect(listener.calls.count()).toEqual(2);

        entity.rectangle.coordinates = undefined;
        expect(listener.calls.count()).toEqual(3);

        //Since there's no valid geometry, changing another property should not raise the event.
        entity.rectangle.height = undefined;

        //Modifying an unrelated property should not have any effect.
        entity.viewFrom = new ConstantProperty(Cartesian3.UNIT_X);
        expect(listener.calls.count()).toEqual(3);
    });

    it('createFillGeometryInstance throws if object is not filled', function() {
        var entity = new Entity();
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(function() {
            return updater.createFillGeometryInstance(time);
        }).toThrowDeveloperError();
    });

    it('createFillGeometryInstance throws if no time provided', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(function() {
            return updater.createFillGeometryInstance(undefined);
        }).toThrowDeveloperError();
    });

    it('createOutlineGeometryInstance throws if object is not outlined', function() {
        var entity = new Entity();
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(function() {
            return updater.createOutlineGeometryInstance(time);
        }).toThrowDeveloperError();
    });

    it('createOutlineGeometryInstance throws if no time provided', function() {
        var entity = createBasicRectangle();
        entity.rectangle.outline = new ConstantProperty(true);
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(function() {
            return updater.createOutlineGeometryInstance(undefined);
        }).toThrowDeveloperError();
    });

    it('createDynamicUpdater throws if not dynamic', function() {
        var entity = createBasicRectangle();
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(function() {
            return updater.createDynamicUpdater(new PrimitiveCollection());
        }).toThrowDeveloperError();
    });

    it('createDynamicUpdater throws if primitives undefined', function() {
        var entity = createBasicRectangle();
        entity.rectangle.height = new SampledProperty(Number);
        entity.rectangle.height.addSample(time, 4);
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(updater.isDynamic).toBe(true);
        expect(function() {
            return updater.createDynamicUpdater(undefined);
        }).toThrowDeveloperError();
    });

    it('dynamicUpdater.update throws if no time specified', function() {
        var entity = createBasicRectangle();
        entity.rectangle.height = new SampledProperty(Number);
        entity.rectangle.height.addSample(time, 4);
        var updater = new RectangleGeometryUpdater(entity, scene);
        var dynamicUpdater = updater.createDynamicUpdater(new PrimitiveCollection());
        expect(function() {
            dynamicUpdater.update(undefined);
        }).toThrowDeveloperError();
    });

    it('Constructor throws if no Entity supplied', function() {
        expect(function() {
            return new RectangleGeometryUpdater(undefined, scene);
        }).toThrowDeveloperError();
    });

    it('Constructor throws if no scene supplied', function() {
        var entity = createBasicRectangle();
        expect(function() {
            return new RectangleGeometryUpdater(entity, undefined);
        }).toThrowDeveloperError();
    });

    it('fill is true sets onTerrain to true', function() {
        var entity = createBasicRectangleWithoutHeight();
        entity.rectangle.fill = true;
        var updater = new RectangleGeometryUpdater(entity, scene);
        if (groundPrimitiveSupported) {
            expect(updater.onTerrain).toBe(true);
        } else {
            expect(updater.onTerrain).toBe(false);
        }
    });

    it('fill is false sets onTerrain to false', function() {
        var entity = createBasicRectangleWithoutHeight();
        entity.rectangle.fill = false;
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(updater.onTerrain).toBe(false);
    });

    it('a defined height sets onTerrain to false', function() {
        var entity = createBasicRectangleWithoutHeight();
        entity.rectangle.fill = true;
        entity.rectangle.height = 0;
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(updater.onTerrain).toBe(false);
    });

    it('a defined extrudedHeight sets onTerrain to false', function() {
        var entity = createBasicRectangleWithoutHeight();
        entity.rectangle.fill = true;
        entity.rectangle.extrudedHeight = 12;
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(updater.onTerrain).toBe(false);
    });

    it('color material sets onTerrain to true', function() {
        var entity = createBasicRectangleWithoutHeight();
        entity.rectangle.fill = true;
        entity.rectangle.material = new ColorMaterialProperty(Color.WHITE);
        var updater = new RectangleGeometryUpdater(entity, scene);
        if (groundPrimitiveSupported) {
            expect(updater.onTerrain).toBe(true);
        } else {
            expect(updater.onTerrain).toBe(false);
        }
    });

    it('non-color material sets onTerrain to false', function() {
        var entity = createBasicRectangleWithoutHeight();
        entity.rectangle.fill = true;
        entity.rectangle.material = new CheckerboardMaterialProperty();
        var updater = new RectangleGeometryUpdater(entity, scene);
        expect(updater.onTerrain).toBe(false);
    });

    var entity = createBasicRectangle();
    entity.rectangle.extrudedHeight = createDynamicProperty(2);
    createDynamicGeometryBoundingSphereSpecs(RectangleGeometryUpdater, entity, entity.rectangle, function() {
        return scene;
    });
}, 'WebGL');
