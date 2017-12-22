defineSuite([
        'Widgets/CesiumWidget/CesiumWidget',
        'Core/Clock',
        'Core/defaultValue',
        'Core/EllipsoidTerrainProvider',
        'Core/ScreenSpaceEventHandler',
        'Core/WebMercatorProjection',
        'Scene/Camera',
        'Scene/ImageryLayerCollection',
        'Scene/Scene',
        'Scene/SceneMode',
        'Scene/SkyBox',
        'Scene/TileCoordinatesImageryProvider',
        'Specs/DomEventSimulator',
        'Specs/getWebGLStub',
        'Specs/pollToPromise'
    ], function(
        CesiumWidget,
        Clock,
        defaultValue,
        EllipsoidTerrainProvider,
        ScreenSpaceEventHandler,
        WebMercatorProjection,
        Camera,
        ImageryLayerCollection,
        Scene,
        SceneMode,
        SkyBox,
        TileCoordinatesImageryProvider,
        DomEventSimulator,
        getWebGLStub,
        pollToPromise) {
    'use strict';

    var container;
    var widget;
    beforeEach(function() {
        container = document.createElement('div');
        container.id = 'container';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.overflow = 'hidden';
        container.style.position = 'relative';
        document.body.appendChild(container);
    });

    afterEach(function() {
        if (widget && !widget.isDestroyed()) {
            widget = widget.destroy();
        }
        document.body.removeChild(container);
    });

    function createCesiumWidget(container, options) {
        options = defaultValue(options, {});
        options.contextOptions = defaultValue(options.contextOptions, {});
        options.contextOptions.webgl = defaultValue(options.contextOptions.webgl, {});
        if (!!window.webglStub) {
            options.contextOptions.getWebGLStub = getWebGLStub;
        }

        return new CesiumWidget(container, options);
    }

    it('can create, render, and destroy', function() {
        widget = createCesiumWidget(container);
        expect(widget.isDestroyed()).toEqual(false);
        expect(widget.container).toBeInstanceOf(HTMLElement);
        expect(widget.canvas).toBeInstanceOf(HTMLElement);
        expect(widget.creditContainer).toBeInstanceOf(HTMLElement);
        expect(widget.scene).toBeInstanceOf(Scene);
        expect(widget.imageryLayers).toBeInstanceOf(ImageryLayerCollection);
        expect(widget.terrainProvider).toBeInstanceOf(EllipsoidTerrainProvider);
        expect(widget.camera).toBeInstanceOf(Camera);
        expect(widget.clock).toBeInstanceOf(Clock);
        expect(widget.screenSpaceEventHandler).toBeInstanceOf(ScreenSpaceEventHandler);
        widget.render();
        widget.destroy();
        expect(widget.isDestroyed()).toEqual(true);
    });

    it('can pass id string for container', function() {
        widget = createCesiumWidget('container');
    });

    it('sets expected options clock', function() {
        var options = {
            clock : new Clock()
        };
        widget = createCesiumWidget(container, options);
        expect(widget.clock).toBe(options.clock);
    });

    it('can set scene mode 2D', function() {
        widget = createCesiumWidget(container, {
            sceneMode : SceneMode.SCENE2D
        });
        widget.scene.completeMorph();
        expect(widget.scene.mode).toBe(SceneMode.SCENE2D);
    });

    it('can set map projection', function() {
        var mapProjection = new WebMercatorProjection();

        widget = createCesiumWidget(container, {
            mapProjection : mapProjection
        });
        expect(widget.scene.mapProjection).toEqual(mapProjection);
    });

    it('can set scene mode Columbus', function() {
        widget = createCesiumWidget(container, {
            sceneMode : SceneMode.COLUMBUS_VIEW
        });
        widget.scene.completeMorph();
        expect(widget.scene.mode).toBe(SceneMode.COLUMBUS_VIEW);
    });

    it('can disable render loop', function() {
        widget = createCesiumWidget(container, {
            useDefaultRenderLoop : false
        });
        expect(widget.useDefaultRenderLoop).toBe(false);
    });

    it('can set target frame rate', function() {
        widget = createCesiumWidget(container, {
            targetFrameRate : 23
        });
        expect(widget.targetFrameRate).toBe(23);
    });

    it('sets expected options imageryProvider', function() {
        var options = {
            imageryProvider : new TileCoordinatesImageryProvider()
        };
        widget = createCesiumWidget(container, options);
        var imageryLayers = widget.scene.imageryLayers;
        expect(imageryLayers.length).toEqual(1);
        expect(imageryLayers.get(0).imageryProvider).toBe(options.imageryProvider);
    });

    it('does not create an ImageryProvider if option is false', function() {
        widget = createCesiumWidget(container, {
            imageryProvider : false
        });
        var imageryLayers = widget.scene.imageryLayers;
        expect(imageryLayers.length).toEqual(0);
    });

    it('sets expected options terrainProvider', function() {
        var options = {
            terrainProvider : new EllipsoidTerrainProvider()
        };
        widget = createCesiumWidget(container, options);
        expect(widget.terrainProvider).toBe(options.terrainProvider);

        var anotherProvider = new EllipsoidTerrainProvider();
        widget.terrainProvider = anotherProvider;
        expect(widget.terrainProvider).toBe(anotherProvider);
    });

    it('does not create a globe if option is false', function() {
        widget = createCesiumWidget(container, {
            globe : false
        });
        expect(widget.scene.globe).not.toBeDefined();
    });

    it('does not create a skyBox if option is false', function() {
        widget = createCesiumWidget(container, {
            skyBox : false
        });
        expect(widget.scene.skyBox).not.toBeDefined();
    });

    it('does not create a skyAtmosphere if option is false', function() {
        widget = createCesiumWidget(container, {
            skyAtmosphere : false
        });
        expect(widget.scene.skyAtmosphere).not.toBeDefined();
    });

    it('sets expected options skyBox', function() {
        var options = {
            skyBox : new SkyBox({
                sources : {
                    positiveX : './Data/Images/Blue.png',
                    negativeX : './Data/Images/Green.png',
                    positiveY : './Data/Images/Blue.png',
                    negativeY : './Data/Images/Green.png',
                    positiveZ : './Data/Images/Blue.png',
                    negativeZ : './Data/Images/Green.png'
                }
            })
        };
        widget = createCesiumWidget(container, options);
        expect(widget.scene.skyBox).toBe(options.skyBox);
    });

    it('can set contextOptions', function() {
        var webglOptions = {
            alpha : true,
            depth : true, //TODO Change to false when https://bugzilla.mozilla.org/show_bug.cgi?id=745912 is fixed.
            stencil : true,
            antialias : false,
            premultipliedAlpha : true, // Workaround IE 11.0.8, which does not honor false.
            preserveDrawingBuffer : true
        };
        var contextOptions = {
            allowTextureFilterAnisotropic : false,
            webgl : webglOptions
        };

        widget = createCesiumWidget(container, {
            contextOptions : contextOptions
        });

        var context = widget.scene.context;
        var contextAttributes = context._gl.getContextAttributes();

        expect(context.options.allowTextureFilterAnisotropic).toEqual(false);
        expect(contextAttributes.alpha).toEqual(webglOptions.alpha);
        expect(contextAttributes.depth).toEqual(webglOptions.depth);
        expect(contextAttributes.stencil).toEqual(webglOptions.stencil);
        expect(contextAttributes.antialias).toEqual(webglOptions.antialias);
        expect(contextAttributes.premultipliedAlpha).toEqual(webglOptions.premultipliedAlpha);
        expect(contextAttributes.preserveDrawingBuffer).toEqual(webglOptions.preserveDrawingBuffer);
    });

    it('can disable Order Independent Translucency', function() {
        widget = createCesiumWidget(container, {
            orderIndependentTranslucency : false
        });
        expect(widget.scene.orderIndependentTranslucency).toBe(false);
    });

    it('throws if no container provided', function() {
        expect(function() {
            return createCesiumWidget(undefined);
        }).toThrowDeveloperError();
    });

    it('throws if targetFrameRate less than 0', function() {
        widget = createCesiumWidget(container);
        expect(function() {
            widget.targetFrameRate = -1;
        }).toThrowDeveloperError();
    });

    it('can set resolutionScale', function() {
        widget = createCesiumWidget(container);
        widget.resolutionScale = 0.5;
        expect(widget.resolutionScale).toBe(0.5);
    });

    it('throws if resolutionScale is less than 0', function() {
        widget = createCesiumWidget(container);
        expect(function() {
            widget.resolutionScale = -1;
        }).toThrowDeveloperError();
    });

    it('throws if no container id does not exist', function() {
        expect(function() {
            return createCesiumWidget('doesnotexist');
        }).toThrowDeveloperError();
    });

    it('stops the render loop when render throws', function() {
        widget = createCesiumWidget(container);
        expect(widget.useDefaultRenderLoop).toEqual(true);

        var error = 'foo';
        widget.scene.primitives.update = function() {
            throw error;
        };

        return pollToPromise(function() {
            return !widget.useDefaultRenderLoop;
        }, 'render loop to be disabled.');
    });

    it('shows the error panel when render throws', function() {
        widget = createCesiumWidget(container);

        var error = 'foo';
        widget.scene.primitives.update = function() {
            throw error;
        };

        return pollToPromise(function() {
            return !widget.useDefaultRenderLoop;
        }).then(function() {
            expect(widget._element.querySelector('.cesium-widget-errorPanel')).not.toBeNull();

            var messages = widget._element.querySelectorAll('.cesium-widget-errorPanel-message');

            var found = false;
            for (var i = 0; i < messages.length; ++i) {
                if (messages[i].textContent === error) {
                    found = true;
                }
            }

            expect(found).toBe(true);

            // click the OK button to dismiss the panel
            DomEventSimulator.fireClick(widget._element.querySelector('.cesium-button'));

            expect(widget._element.querySelector('.cesium-widget-errorPanel')).toBeNull();
        });
    });

    it('does not show the error panel if disabled', function() {
        widget = createCesiumWidget(container, {
            showRenderLoopErrors : false
        });

        var error = 'foo';
        widget.scene.primitives.update = function() {
            throw error;
        };

        return pollToPromise(function() {
            return !widget.useDefaultRenderLoop;
        }).then(function() {
            expect(widget._element.querySelector('.cesium-widget-errorPanel')).toBeNull();
        });
    });
}, 'WebGL');
