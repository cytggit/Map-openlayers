define([
        '../Core/AssociativeArray',
        '../Core/Color',
        '../Core/ColorGeometryInstanceAttribute',
        '../Core/defined',
        '../Core/DistanceDisplayCondition',
        '../Core/DistanceDisplayConditionGeometryInstanceAttribute',
        '../Core/ShowGeometryInstanceAttribute',
        '../Scene/Primitive',
        './BoundingSphereState',
        './ColorMaterialProperty',
        './MaterialProperty',
        './Property'
    ], function(
        AssociativeArray,
        Color,
        ColorGeometryInstanceAttribute,
        defined,
        DistanceDisplayCondition,
        DistanceDisplayConditionGeometryInstanceAttribute,
        ShowGeometryInstanceAttribute,
        Primitive,
        BoundingSphereState,
        ColorMaterialProperty,
        MaterialProperty,
        Property) {
    'use strict';

    var colorScratch = new Color();
    var distanceDisplayConditionScratch = new DistanceDisplayCondition();

    function Batch(primitives, translucent, appearanceType, depthFailAppearanceType, depthFailMaterialProperty, closed, shadows) {
        this.translucent = translucent;
        this.appearanceType = appearanceType;
        this.depthFailAppearanceType = depthFailAppearanceType;
        this.depthFailMaterialProperty = depthFailMaterialProperty;
        this.depthFailMaterial = undefined;
        this.closed = closed;
        this.shadows = shadows;
        this.primitives = primitives;
        this.createPrimitive = false;
        this.waitingOnCreate = false;
        this.primitive = undefined;
        this.oldPrimitive = undefined;
        this.geometry = new AssociativeArray();
        this.updaters = new AssociativeArray();
        this.updatersWithAttributes = new AssociativeArray();
        this.attributes = new AssociativeArray();
        this.subscriptions = new AssociativeArray();
        this.showsUpdated = new AssociativeArray();
        this.itemsToRemove = [];
        this.invalidated = false;

        var removeMaterialSubscription;
        if (defined(depthFailMaterialProperty)) {
            removeMaterialSubscription = depthFailMaterialProperty.definitionChanged.addEventListener(Batch.prototype.onMaterialChanged, this);
        }
        this.removeMaterialSubscription = removeMaterialSubscription;
    }

    Batch.prototype.onMaterialChanged = function() {
        this.invalidated = true;
    };

    Batch.prototype.isMaterial = function(updater) {
        var material = this.depthFailMaterialProperty;
        var updaterMaterial = updater.depthFailMaterialProperty;
        if (updaterMaterial === material) {
            return true;
        }
        if (defined(material)) {
            return material.equals(updaterMaterial);
        }
        return false;
    };

    Batch.prototype.add = function(updater, instance) {
        var id = updater.entity.id;
        this.createPrimitive = true;
        this.geometry.set(id, instance);
        this.updaters.set(id, updater);
        if (!updater.hasConstantFill || !updater.fillMaterialProperty.isConstant || !Property.isConstant(updater.distanceDisplayConditionProperty)) {
            this.updatersWithAttributes.set(id, updater);
        } else {
            var that = this;
            this.subscriptions.set(id, updater.entity.definitionChanged.addEventListener(function(entity, propertyName, newValue, oldValue) {
                if (propertyName === 'isShowing') {
                    that.showsUpdated.set(entity.id, updater);
                }
            }));
        }
    };

    Batch.prototype.remove = function(updater) {
        var id = updater.entity.id;
        this.createPrimitive = this.geometry.remove(id) || this.createPrimitive;
        if (this.updaters.remove(id)) {
            this.updatersWithAttributes.remove(id);
            var unsubscribe = this.subscriptions.get(id);
            if (defined(unsubscribe)) {
                unsubscribe();
                this.subscriptions.remove(id);
            }
        }
    };

    Batch.prototype.update = function(time) {
        var isUpdated = true;
        var removedCount = 0;
        var primitive = this.primitive;
        var primitives = this.primitives;
        var attributes;
        var i;

        if (this.createPrimitive) {
            var geometries = this.geometry.values;
            var geometriesLength = geometries.length;
            if (geometriesLength > 0) {
                if (defined(primitive)) {
                    if (!defined(this.oldPrimitive)) {
                        this.oldPrimitive = primitive;
                    } else {
                        primitives.remove(primitive);
                    }
                }

                for (i = 0; i < geometriesLength; i++) {
                    var geometryItem = geometries[i];
                    var originalAttributes = geometryItem.attributes;
                    attributes = this.attributes.get(geometryItem.id.id);

                    if (defined(attributes)) {
                        if (defined(originalAttributes.show)) {
                            originalAttributes.show.value = attributes.show;
                        }
                        if (defined(originalAttributes.color)) {
                            originalAttributes.color.value = attributes.color;
                        }
                        if (defined(originalAttributes.depthFailColor)) {
                            originalAttributes.depthFailColor.value = attributes.depthFailColor;
                        }
                    }
                }

                var depthFailAppearance;
                if (defined(this.depthFailAppearanceType)) {
                    if (defined(this.depthFailMaterialProperty)) {
                        this.depthFailMaterial = MaterialProperty.getValue(time, this.depthFailMaterialProperty, this.depthFailMaterial);
                    }
                    depthFailAppearance = new this.depthFailAppearanceType({
                        material : this.depthFailMaterial,
                        translucent : this.translucent,
                        closed : this.closed
                    });
                }

                primitive = new Primitive({
                    asynchronous : true,
                    geometryInstances : geometries,
                    appearance : new this.appearanceType({
                        translucent : this.translucent,
                        closed : this.closed
                    }),
                    depthFailAppearance : depthFailAppearance,
                    shadows : this.shadows
                });
                primitives.add(primitive);
                isUpdated = false;
            } else {
                if (defined(primitive)) {
                    primitives.remove(primitive);
                    primitive = undefined;
                }
                var oldPrimitive = this.oldPrimitive;
                if (defined(oldPrimitive)) {
                    primitives.remove(oldPrimitive);
                    this.oldPrimitive = undefined;
                }
            }

            this.attributes.removeAll();
            this.primitive = primitive;
            this.createPrimitive = false;
            this.waitingOnCreate = true;
        } else if (defined(primitive) && primitive.ready) {
            if (defined(this.oldPrimitive)) {
                primitives.remove(this.oldPrimitive);
                this.oldPrimitive = undefined;
            }

            if (defined(this.depthFailAppearanceType) && !(this.depthFailMaterialProperty instanceof ColorMaterialProperty)) {
                this.depthFailMaterial = MaterialProperty.getValue(time, this.depthFailMaterialProperty, this.depthFailMaterial);
                this.primitive.depthFailAppearance.material = this.depthFailMaterial;
            }

            var updatersWithAttributes = this.updatersWithAttributes.values;
            var length = updatersWithAttributes.length;
            var waitingOnCreate = this.waitingOnCreate;
            for (i = 0; i < length; i++) {
                var updater = updatersWithAttributes[i];
                var instance = this.geometry.get(updater.entity.id);

                attributes = this.attributes.get(instance.id.id);
                if (!defined(attributes)) {
                    attributes = primitive.getGeometryInstanceAttributes(instance.id);
                    this.attributes.set(instance.id.id, attributes);
                }

                if (!updater.fillMaterialProperty.isConstant || waitingOnCreate) {
                    var colorProperty = updater.fillMaterialProperty.color;
                    colorProperty.getValue(time, colorScratch);
                    if (!Color.equals(attributes._lastColor, colorScratch)) {
                        attributes._lastColor = Color.clone(colorScratch, attributes._lastColor);
                        attributes.color = ColorGeometryInstanceAttribute.toValue(colorScratch, attributes.color);
                        if ((this.translucent && attributes.color[3] === 255) || (!this.translucent && attributes.color[3] !== 255)) {
                            this.itemsToRemove[removedCount++] = updater;
                        }
                    }
                }

                if (defined(this.depthFailAppearanceType) && this.depthFailAppearanceType instanceof ColorMaterialProperty && (!updater.depthFailMaterialProperty.isConstant || waitingOnCreate)) {
                    var depthFailColorProperty = updater.depthFailMaterialProperty.color;
                    depthFailColorProperty.getValue(time, colorScratch);
                    if (!Color.equals(attributes._lastDepthFailColor, colorScratch)) {
                        attributes._lastDepthFailColor = Color.clone(colorScratch, attributes._lastDepthFailColor);
                        attributes.depthFailColor = ColorGeometryInstanceAttribute.toValue(colorScratch, attributes.depthFailColor);
                    }
                }

                var show = updater.entity.isShowing && (updater.hasConstantFill || updater.isFilled(time));
                var currentShow = attributes.show[0] === 1;
                if (show !== currentShow) {
                    attributes.show = ShowGeometryInstanceAttribute.toValue(show, attributes.show);
                }

                var distanceDisplayConditionProperty = updater.distanceDisplayConditionProperty;
                if (!Property.isConstant(distanceDisplayConditionProperty)) {
                    var distanceDisplayCondition = distanceDisplayConditionProperty.getValue(time, distanceDisplayConditionScratch);
                    if (!DistanceDisplayCondition.equals(distanceDisplayCondition, attributes._lastDistanceDisplayCondition)) {
                        attributes._lastDistanceDisplayCondition = DistanceDisplayCondition.clone(distanceDisplayCondition, attributes._lastDistanceDisplayCondition);
                        attributes.distanceDisplayCondition = DistanceDisplayConditionGeometryInstanceAttribute.toValue(distanceDisplayCondition, attributes.distanceDisplayCondition);
                    }
                }
            }

            this.updateShows(primitive);
            this.waitingOnCreate = false;
        } else if (defined(primitive) && !primitive.ready) {
            isUpdated = false;
        }
        this.itemsToRemove.length = removedCount;
        return isUpdated;
    };

    Batch.prototype.updateShows = function(primitive) {
        var showsUpdated = this.showsUpdated.values;
        var length = showsUpdated.length;
        for (var i = 0; i < length; i++) {
            var updater = showsUpdated[i];
            var instance = this.geometry.get(updater.entity.id);

            var attributes = this.attributes.get(instance.id.id);
            if (!defined(attributes)) {
                attributes = primitive.getGeometryInstanceAttributes(instance.id);
                this.attributes.set(instance.id.id, attributes);
            }

            var show = updater.entity.isShowing;
            var currentShow = attributes.show[0] === 1;
            if (show !== currentShow) {
                attributes.show = ShowGeometryInstanceAttribute.toValue(show, attributes.show);
            }
        }
        this.showsUpdated.removeAll();
    };

    Batch.prototype.contains = function(entity) {
        return this.updaters.contains(entity.id);
    };

    Batch.prototype.getBoundingSphere = function(entity, result) {
        var primitive = this.primitive;
        if (!primitive.ready) {
            return BoundingSphereState.PENDING;
        }
        var attributes = primitive.getGeometryInstanceAttributes(entity);
        if (!defined(attributes) || !defined(attributes.boundingSphere) ||//
            (defined(attributes.show) && attributes.show[0] === 0)) {
            return BoundingSphereState.FAILED;
        }
        attributes.boundingSphere.clone(result);
        return BoundingSphereState.DONE;
    };

    Batch.prototype.removeAllPrimitives = function() {
        var primitives = this.primitives;

        var primitive = this.primitive;
        if (defined(primitive)) {
            primitives.remove(primitive);
            this.primitive = undefined;
            this.geometry.removeAll();
            this.updaters.removeAll();
        }

        var oldPrimitive = this.oldPrimitive;
        if (defined(oldPrimitive)) {
            primitives.remove(oldPrimitive);
            this.oldPrimitive = undefined;
        }
    };

    Batch.prototype.destroy = function() {
        var primitive = this.primitive;
        var primitives = this.primitives;
        if (defined(primitive)) {
            primitives.remove(primitive);
        }
        var oldPrimitive = this.oldPrimitive;
        if (defined(oldPrimitive)) {
            primitives.remove(oldPrimitive);
        }
        if(defined(this.removeMaterialSubscription)) {
            this.removeMaterialSubscription();
        }
    };

    /**
     * @private
     */
    function StaticGeometryColorBatch(primitives, appearanceType, depthFailAppearanceType, closed, shadows) {
        this._solidItems = [];
        this._translucentItems = [];
        this._primitives = primitives;
        this._appearanceType = appearanceType;
        this._depthFailAppearanceType = depthFailAppearanceType;
        this._closed = closed;
        this._shadows = shadows;
    }

    StaticGeometryColorBatch.prototype.add = function(time, updater) {
        var items;
        var translucent;
        var instance = updater.createFillGeometryInstance(time);
        if (instance.attributes.color.value[3] === 255) {
            items = this._solidItems;
            translucent = false;
        } else {
            items = this._translucentItems;
            translucent = true;
        }

        var length = items.length;
        for (var i = 0; i < length; i++) {
            var item = items[i];
            if (item.isMaterial(updater)) {
                item.add(updater, instance);
                return;
            }
        }
        var batch = new Batch(this._primitives, translucent, this._appearanceType, this._depthFailAppearanceType, updater.depthFailMaterialProperty, this._closed, this._shadows);
        batch.add(updater, instance);
        items.push(batch);
    };

    function removeItem(items, updater) {
        var length = items.length;
        for (var i = length - 1; i >= 0; i--) {
            var item = items[i];
            if (item.remove(updater)) {
                if (item.updaters.length === 0) {
                    items.splice(i, 1);
                    item.destroy();
                    return true;
                }
            }
        }
        return false;
    }

    StaticGeometryColorBatch.prototype.remove = function(updater) {
        if (!removeItem(this._solidItems, updater)) {
            removeItem(this._translucentItems, updater);
        }
    };

    function moveItems(batch, items, time) {
        var itemsMoved = false;
        var length = items.length;
        for (var i = 0; i < length; ++i) {
            var item = items[i];
            var itemsToRemove = item.itemsToRemove;
            var itemsToMoveLength = itemsToRemove.length;
            if (itemsToMoveLength > 0) {
                for (i = 0; i < itemsToMoveLength; i++) {
                    var updater = itemsToRemove[i];
                    item.remove(updater);
                    batch.add(time, updater);
                    itemsMoved = true;
                }
            }
        }
        return itemsMoved;
    }

    function updateItems(batch, items, time, isUpdated) {
        var length = items.length;
        var i;
        for (i = length - 1; i >= 0; i--) {
            var item = items[i];
            if (item.invalidated) {
                items.splice(i, 1);
                var updaters = item.updaters.values;
                var updatersLength = updaters.length;
                for (var h = 0; h < updatersLength; h++) {
                    batch.add(time, updaters[h]);
                }
                item.destroy();
            }
        }

        length = items.length;
        for (i = 0; i < length; ++i) {
            isUpdated = items[i].update(time) && isUpdated;
        }
        return isUpdated;
    }

    StaticGeometryColorBatch.prototype.update = function(time) {
        //Perform initial update
        var isUpdated = updateItems(this, this._solidItems, time, true);
        isUpdated = updateItems(this, this._translucentItems, time, isUpdated) && isUpdated;

        //If any items swapped between solid/translucent, we need to
        //move them between batches
        var solidsMoved = moveItems(this, this._solidItems, time);
        var translucentsMoved = moveItems(this, this._translucentItems, time);

        //If we moved anything around, we need to re-build the primitive
        if (solidsMoved || translucentsMoved) {
            isUpdated = updateItems(this, this._solidItems, time, isUpdated) && isUpdated;
            isUpdated = updateItems(this, this._translucentItems, time, isUpdated)&& isUpdated;
        }

        return isUpdated;
    };

    function getBoundingSphere(items, entity, result) {
        var length = items.length;
        for (var i = 0; i < length; i++) {
            var item = items[i];
            if(item.contains(entity)){
                return item.getBoundingSphere(entity, result);
            }
        }
        return BoundingSphereState.FAILED;
    }

    StaticGeometryColorBatch.prototype.getBoundingSphere = function(entity, result) {
        var boundingSphere = getBoundingSphere(this._solidItems, entity, result);
        if (boundingSphere === BoundingSphereState.FAILED) {
            return getBoundingSphere(this._translucentItems, entity, result);
        }
        return boundingSphere;
    };

    function removeAllPrimitives(items) {
        var length = items.length;
        for (var i = 0; i < length; i++) {
            items[i].destroy();
        }
        items.length = 0;
    }

    StaticGeometryColorBatch.prototype.removeAllPrimitives = function() {
        removeAllPrimitives(this._solidItems);
        removeAllPrimitives(this._translucentItems);
    };

    return StaticGeometryColorBatch;
});
