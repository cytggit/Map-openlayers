define([
        '../Core/freezeObject',
        '../Core/WebGLConstants'
    ], function(
        freezeObject,
        WebGLConstants) {
    'use strict';

    /**
     * @private
     */
    var TextureMagnificationFilter = {
        NEAREST : WebGLConstants.NEAREST,
        LINEAR : WebGLConstants.LINEAR,

        validate : function(textureMagnificationFilter) {
            return ((textureMagnificationFilter === TextureMagnificationFilter.NEAREST) ||
                    (textureMagnificationFilter === TextureMagnificationFilter.LINEAR));
        }
    };

    return freezeObject(TextureMagnificationFilter);
});
