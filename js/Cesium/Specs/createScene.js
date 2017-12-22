define([
        'Core/Cartesian2',
        'Core/clone',
        'Core/defaultValue',
        'Core/defined',
        'Scene/Scene',
        'Specs/createCanvas',
        'Specs/getWebGLStub'
    ], function(
        Cartesian2,
        clone,
        defaultValue,
        defined,
        Scene,
        createCanvas,
        getWebGLStub) {
    'use strict';

    function createScene(options) {
        options = defaultValue(options, {});

        // save the canvas so we don't try to clone an HTMLCanvasElement
        var canvas = defined(options.canvas) ? options.canvas : createCanvas();
        options.canvas = undefined;

        options = clone(options, true);

        options.canvas = canvas;
        options.contextOptions = defaultValue(options.contextOptions, {});

        var contextOptions = options.contextOptions;
        contextOptions.webgl = defaultValue(contextOptions.webgl, {});
        contextOptions.webgl.antialias = defaultValue(contextOptions.webgl.antialias, false);
        contextOptions.webgl.stencil = defaultValue(contextOptions.webgl.stencil, true);
        if (!!window.webglStub) {
            contextOptions.getWebGLStub = getWebGLStub;
        }

        var scene = new Scene(options);

        if (!!window.webglValidation) {
            var context = scene.context;
            context.validateShaderProgram = true;
            context.validateFramebuffer = true;
            context.logShaderCompilation = true;
            context.throwOnWebGLError = true;
        }

        // Add functions for test
        scene.destroyForSpecs = function() {
            var canvas = this.canvas;
            this.destroy();
            document.body.removeChild(canvas);
        };

        scene.renderForSpecs = function(time) {
            this.initializeFrame();
            this.render(time);
        };

        scene.pickForSpecs = function() {
            this.pick(new Cartesian2(0, 0));
        };

        scene.rethrowRenderErrors = defaultValue(options.rethrowRenderErrors, true);

        return scene;
    }

    return createScene;
});
