define([
        '../Core/AssociativeArray',
        '../Core/Cartesian2',
        '../Core/Cartesian3',
        '../Core/Color',
        '../Core/defaultValue',
        '../Core/defined',
        '../Core/destroyObject',
        '../Core/DeveloperError',
        '../Core/DistanceDisplayCondition',
        '../Core/NearFarScalar',
        '../Scene/HeightReference',
        '../Scene/HorizontalOrigin',
        '../Scene/LabelStyle',
        '../Scene/VerticalOrigin',
        './BoundingSphereState',
        './Property'
    ], function(
        AssociativeArray,
        Cartesian2,
        Cartesian3,
        Color,
        defaultValue,
        defined,
        destroyObject,
        DeveloperError,
        DistanceDisplayCondition,
        NearFarScalar,
        HeightReference,
        HorizontalOrigin,
        LabelStyle,
        VerticalOrigin,
        BoundingSphereState,
        Property) {
    'use strict';

    var defaultScale = 1.0;
    var defaultFont = '30px sans-serif';
    var defaultStyle = LabelStyle.FILL;
    var defaultFillColor = Color.WHITE;
    var defaultOutlineColor = Color.BLACK;
    var defaultOutlineWidth = 1.0;
    var defaultShowBackground = false;
    var defaultBackgroundColor = new Color(0.165, 0.165, 0.165, 0.8);
    var defaultBackgroundPadding = new Cartesian2(7, 5);
    var defaultPixelOffset = Cartesian2.ZERO;
    var defaultEyeOffset = Cartesian3.ZERO;
    var defaultHeightReference = HeightReference.NONE;
    var defaultHorizontalOrigin = HorizontalOrigin.CENTER;
    var defaultVerticalOrigin = VerticalOrigin.CENTER;
    var defaultDisableDepthTestDistance = 0.0;

    var position = new Cartesian3();
    var fillColor = new Color();
    var outlineColor = new Color();
    var backgroundColor = new Color();
    var backgroundPadding = new Cartesian2();
    var eyeOffset = new Cartesian3();
    var pixelOffset = new Cartesian2();
    var translucencyByDistance = new NearFarScalar();
    var pixelOffsetScaleByDistance = new NearFarScalar();
    var scaleByDistance = new NearFarScalar();
    var distanceDisplayCondition = new DistanceDisplayCondition();

    function EntityData(entity) {
        this.entity = entity;
        this.label = undefined;
        this.index = undefined;
    }

    /**
     * A {@link Visualizer} which maps the {@link LabelGraphics} instance
     * in {@link Entity#label} to a {@link Label}.
     * @alias LabelVisualizer
     * @constructor
     *
     * @param {EntityCluster} entityCluster The entity cluster to manage the collection of billboards and optionally cluster with other entities.
     * @param {EntityCollection} entityCollection The entityCollection to visualize.
     */
    function LabelVisualizer(entityCluster, entityCollection) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(entityCluster)) {
            throw new DeveloperError('entityCluster is required.');
        }
        if (!defined(entityCollection)) {
            throw new DeveloperError('entityCollection is required.');
        }
        //>>includeEnd('debug');

        entityCollection.collectionChanged.addEventListener(LabelVisualizer.prototype._onCollectionChanged, this);

        this._cluster = entityCluster;
        this._entityCollection = entityCollection;
        this._items = new AssociativeArray();

        this._onCollectionChanged(entityCollection, entityCollection.values, [], []);
    }

    /**
     * Updates the primitives created by this visualizer to match their
     * Entity counterpart at the given time.
     *
     * @param {JulianDate} time The time to update to.
     * @returns {Boolean} This function always returns true.
     */
    LabelVisualizer.prototype.update = function(time) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(time)) {
            throw new DeveloperError('time is required.');
        }
        //>>includeEnd('debug');

        var items = this._items.values;
        var cluster = this._cluster;

        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            var entity = item.entity;
            var labelGraphics = entity._label;
            var text;
            var label = item.label;
            var show = entity.isShowing && entity.isAvailable(time) && Property.getValueOrDefault(labelGraphics._show, time, true);

            if (show) {
                position = Property.getValueOrUndefined(entity._position, time, position);
                text = Property.getValueOrUndefined(labelGraphics._text, time);
                show = defined(position) && defined(text);
            }

            if (!show) {
                //don't bother creating or updating anything else
                returnPrimitive(item, entity, cluster);
                continue;
            }

            if (!Property.isConstant(entity._position)) {
                cluster._clusterDirty = true;
            }

            if (!defined(label)) {
                label = cluster.getLabel(entity);
                label.id = entity;
                item.label = label;
            }

            label.show = true;
            label.position = position;
            label.text = text;
            label.scale = Property.getValueOrDefault(labelGraphics._scale, time, defaultScale);
            label.font = Property.getValueOrDefault(labelGraphics._font, time, defaultFont);
            label.style = Property.getValueOrDefault(labelGraphics._style, time, defaultStyle);
            label.fillColor = Property.getValueOrDefault(labelGraphics._fillColor, time, defaultFillColor, fillColor);
            label.outlineColor = Property.getValueOrDefault(labelGraphics._outlineColor, time, defaultOutlineColor, outlineColor);
            label.outlineWidth = Property.getValueOrDefault(labelGraphics._outlineWidth, time, defaultOutlineWidth);
            label.showBackground = Property.getValueOrDefault(labelGraphics._showBackground, time, defaultShowBackground);
            label.backgroundColor = Property.getValueOrDefault(labelGraphics._backgroundColor, time, defaultBackgroundColor, backgroundColor);
            label.backgroundPadding = Property.getValueOrDefault(labelGraphics._backgroundPadding, time, defaultBackgroundPadding, backgroundPadding);
            label.pixelOffset = Property.getValueOrDefault(labelGraphics._pixelOffset, time, defaultPixelOffset, pixelOffset);
            label.eyeOffset = Property.getValueOrDefault(labelGraphics._eyeOffset, time, defaultEyeOffset, eyeOffset);
            label.heightReference = Property.getValueOrDefault(labelGraphics._heightReference, time, defaultHeightReference);
            label.horizontalOrigin = Property.getValueOrDefault(labelGraphics._horizontalOrigin, time, defaultHorizontalOrigin);
            label.verticalOrigin = Property.getValueOrDefault(labelGraphics._verticalOrigin, time, defaultVerticalOrigin);
            label.translucencyByDistance = Property.getValueOrUndefined(labelGraphics._translucencyByDistance, time, translucencyByDistance);
            label.pixelOffsetScaleByDistance = Property.getValueOrUndefined(labelGraphics._pixelOffsetScaleByDistance, time, pixelOffsetScaleByDistance);
            label.scaleByDistance = Property.getValueOrUndefined(labelGraphics._scaleByDistance, time, scaleByDistance);
            label.distanceDisplayCondition = Property.getValueOrUndefined(labelGraphics._distanceDisplayCondition, time, distanceDisplayCondition);
            label.disableDepthTestDistance = Property.getValueOrDefault(labelGraphics._disableDepthTestDistance, time, defaultDisableDepthTestDistance);
        }
        return true;
    };

    /**
     * Computes a bounding sphere which encloses the visualization produced for the specified entity.
     * The bounding sphere is in the fixed frame of the scene's globe.
     *
     * @param {Entity} entity The entity whose bounding sphere to compute.
     * @param {BoundingSphere} result The bounding sphere onto which to store the result.
     * @returns {BoundingSphereState} BoundingSphereState.DONE if the result contains the bounding sphere,
     *                       BoundingSphereState.PENDING if the result is still being computed, or
     *                       BoundingSphereState.FAILED if the entity has no visualization in the current scene.
     * @private
     */
    LabelVisualizer.prototype.getBoundingSphere = function(entity, result) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(entity)) {
            throw new DeveloperError('entity is required.');
        }
        if (!defined(result)) {
            throw new DeveloperError('result is required.');
        }
        //>>includeEnd('debug');

        var item = this._items.get(entity.id);
        if (!defined(item) || !defined(item.label)) {
            return BoundingSphereState.FAILED;
        }

        var label = item.label;
        result.center = Cartesian3.clone(defaultValue(label._clampedPosition, label.position), result.center);
        result.radius = 0;
        return BoundingSphereState.DONE;
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     *
     * @returns {Boolean} True if this object was destroyed; otherwise, false.
     */
    LabelVisualizer.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Removes and destroys all primitives created by this instance.
     */
    LabelVisualizer.prototype.destroy = function() {
        this._entityCollection.collectionChanged.removeEventListener(LabelVisualizer.prototype._onCollectionChanged, this);
        var entities = this._entityCollection.values;
        for (var i = 0; i < entities.length; i++) {
            this._cluster.removeLabel(entities[i]);
        }
        return destroyObject(this);
    };

    LabelVisualizer.prototype._onCollectionChanged = function(entityCollection, added, removed, changed) {
        var i;
        var entity;
        var items = this._items;
        var cluster = this._cluster;

        for (i = added.length - 1; i > -1; i--) {
            entity = added[i];
            if (defined(entity._label) && defined(entity._position)) {
                items.set(entity.id, new EntityData(entity));
            }
        }

        for (i = changed.length - 1; i > -1; i--) {
            entity = changed[i];
            if (defined(entity._label) && defined(entity._position)) {
                if (!items.contains(entity.id)) {
                    items.set(entity.id, new EntityData(entity));
                }
            } else {
                returnPrimitive(items.get(entity.id), entity, cluster);
                items.remove(entity.id);
            }
        }

        for (i = removed.length - 1; i > -1; i--) {
            entity = removed[i];
            returnPrimitive(items.get(entity.id), entity, cluster);
            items.remove(entity.id);
        }
    };

    function returnPrimitive(item, entity, cluster) {
        if (defined(item)) {
            item.label = undefined;
            cluster.removeLabel(entity);
        }
    }

    return LabelVisualizer;
});
