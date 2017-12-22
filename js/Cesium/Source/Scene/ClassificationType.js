define([
        '../Core/freezeObject'
    ], function(
        freezeObject) {
    'use strict';

    /**
     * Whether a classification affects terrain, 3D Tiles or both.
     *
     * @exports ClassificationOption
     */
    var ClassificationType = {
        /**
         * Only terrain will be classified.
         *
         * @type {Number}
         * @constant
         */
        TERRAIN : 0,
        /**
         * Only 3D Tiles will be classified.
         *
         * @type {Number}
         * @constant
         */
        CESIUM_3D_TILE : 1,
        /**
         * Both terrain and 3D Tiles will be classified.
         *
         * @type {Number}
         * @constant
         */
        BOTH : 2
    };

    return freezeObject(ClassificationType);
});
