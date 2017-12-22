define([
        '../ThirdParty/Uri',
        '../ThirdParty/when',
        './BoundingSphere',
        './Cartesian3',
        './Credit',
        './defaultValue',
        './defined',
        './defineProperties',
        './DeveloperError',
        './Event',
        './GeographicTilingScheme',
        './HeightmapTerrainData',
        './IndexDatatype',
        './joinUrls',
        './loadArrayBuffer',
        './loadJson',
        './Math',
        './OrientedBoundingBox',
        './QuantizedMeshTerrainData',
        './Request',
        './RequestType',
        './TerrainProvider',
        './TileAvailability',
        './TileProviderError'
    ], function(
        Uri,
        when,
        BoundingSphere,
        Cartesian3,
        Credit,
        defaultValue,
        defined,
        defineProperties,
        DeveloperError,
        Event,
        GeographicTilingScheme,
        HeightmapTerrainData,
        IndexDatatype,
        joinUrls,
        loadArrayBuffer,
        loadJson,
        CesiumMath,
        OrientedBoundingBox,
        QuantizedMeshTerrainData,
        Request,
        RequestType,
        TerrainProvider,
        TileAvailability,
        TileProviderError) {
    'use strict';

    /**
     * A {@link TerrainProvider} that accesses terrain data in a Cesium terrain format.
     * The format is described on the
     * {@link https://github.com/AnalyticalGraphicsInc/cesium/wiki/Cesium-Terrain-Server|Cesium wiki}.
     *
     * @alias CesiumTerrainProvider
     * @constructor
     *
     * @param {Object} options Object with the following properties:
     * @param {String} options.url The URL of the Cesium terrain server.
     * @param {Proxy} [options.proxy] A proxy to use for requests. This object is expected to have a getURL function which returns the proxied URL, if needed.
     * @param {Boolean} [options.requestVertexNormals=false] Flag that indicates if the client should request additional lighting information from the server, in the form of per vertex normals if available.
     * @param {Boolean} [options.requestWaterMask=false] Flag that indicates if the client should request per tile water masks from the server,  if available.
     * @param {Ellipsoid} [options.ellipsoid] The ellipsoid.  If not specified, the WGS84 ellipsoid is used.
     * @param {Credit|String} [options.credit] A credit for the data source, which is displayed on the canvas.
     *
     *
     * @example
     * // Construct a terrain provider that uses per vertex normals for lighting
     * // to add shading detail to an imagery provider.
     * var terrainProvider = new Cesium.CesiumTerrainProvider({
     *     url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
     *     requestVertexNormals : true
     * });
     *
     * // Terrain geometry near the surface of the globe is difficult to view when using NaturalEarthII imagery,
     * // unless the TerrainProvider provides additional lighting information to shade the terrain (as shown above).
     * var imageryProvider = Cesium.createTileMapServiceImageryProvider({
     *        url : 'http://localhost:8080/Source/Assets/Textures/NaturalEarthII',
     *        fileExtension : 'jpg'
     *    });
     *
     * var viewer = new Cesium.Viewer('cesiumContainer', {
     *     imageryProvider : imageryProvider,
     *     baseLayerPicker : false,
     *     terrainProvider : terrainProvider
     * });
     *
     * // The globe must enable lighting to make use of the terrain's vertex normals
     * viewer.scene.globe.enableLighting = true;
     *
     * @see TerrainProvider
     */
    function CesiumTerrainProvider(options) {
        //>>includeStart('debug', pragmas.debug)
        if (!defined(options) || !defined(options.url)) {
            throw new DeveloperError('options.url is required.');
        }
        //>>includeEnd('debug');

        this._url = options.url;
        this._proxy = options.proxy;

        this._tilingScheme = new GeographicTilingScheme({
            numberOfLevelZeroTilesX : 2,
            numberOfLevelZeroTilesY : 1,
            ellipsoid : options.ellipsoid
        });

        this._heightmapWidth = 65;
        this._levelZeroMaximumGeometricError = TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(this._tilingScheme.ellipsoid, this._heightmapWidth, this._tilingScheme.getNumberOfXTilesAtLevel(0));

        this._heightmapStructure = undefined;
        this._hasWaterMask = false;

        /**
         * Boolean flag that indicates if the Terrain Server can provide vertex normals.
         * @type {Boolean}
         * @default false
         * @private
         */
        this._hasVertexNormals = false;
        /**
         * Boolean flag that indicates if the client should request vertex normals from the server.
         * @type {Boolean}
         * @default false
         * @private
         */
        this._requestVertexNormals = defaultValue(options.requestVertexNormals, false);
        this._littleEndianExtensionSize = true;
        /**
         * Boolean flag that indicates if the client should request tile watermasks from the server.
         * @type {Boolean}
         * @default false
         * @private
         */
        this._requestWaterMask = defaultValue(options.requestWaterMask, false);

        this._errorEvent = new Event();
        this._availability = undefined;

        var credit = options.credit;
        if (typeof credit === 'string') {
            credit = new Credit(credit);
        }
        this._credit = credit;

        this._ready = false;
        this._readyPromise = when.defer();

        var metadataUrl = joinUrls(this._url, 'layer.json');
        if (defined(this._proxy)) {
            metadataUrl = this._proxy.getURL(metadataUrl);
        }

        var that = this;
        var metadataError;

        function metadataSuccess(data) {
            var message;

            if (!data.format) {
                message = 'The tile format is not specified in the layer.json file.';
                metadataError = TileProviderError.handleError(metadataError, that, that._errorEvent, message, undefined, undefined, undefined, requestMetadata);
                return;
            }

            if (!data.tiles || data.tiles.length === 0) {
                message = 'The layer.json file does not specify any tile URL templates.';
                metadataError = TileProviderError.handleError(metadataError, that, that._errorEvent, message, undefined, undefined, undefined, requestMetadata);
                return;
            }

            if (data.format === 'heightmap-1.0') {
                that._heightmapStructure = {
                        heightScale : 1.0 / 5.0,
                        heightOffset : -1000.0,
                        elementsPerHeight : 1,
                        stride : 1,
                        elementMultiplier : 256.0,
                        isBigEndian : false,
                        lowestEncodedHeight : 0,
                        highestEncodedHeight : 256 * 256 - 1
                    };
                that._hasWaterMask = true;
                that._requestWaterMask = true;
            } else if (data.format.indexOf('quantized-mesh-1.') !== 0) {
                message = 'The tile format "' + data.format + '" is invalid or not supported.';
                metadataError = TileProviderError.handleError(metadataError, that, that._errorEvent, message, undefined, undefined, undefined, requestMetadata);
                return;
            }

            that._tileUrlTemplates = data.tiles;
            for (var i = 0; i < that._tileUrlTemplates.length; ++i) {
                var template = new Uri(that._tileUrlTemplates[i]);
                var baseUri = new Uri(that._url);
                if (template.authority && !baseUri.authority) {
                    baseUri.authority = template.authority;
                    baseUri.scheme = template.scheme;
                }
                that._tileUrlTemplates[i] = joinUrls(baseUri, template).toString().replace('{version}', data.version);
            }

            var availableTiles = data.available;

            if (defined(availableTiles)) {
                that._availability = new TileAvailability(that._tilingScheme, availableTiles.length);

                for (var level = 0; level < availableTiles.length; ++level) {
                    var rangesAtLevel = availableTiles[level];
                    var yTiles = that._tilingScheme.getNumberOfYTilesAtLevel(level);

                    for (var rangeIndex = 0; rangeIndex < rangesAtLevel.length; ++rangeIndex) {
                        var range = rangesAtLevel[rangeIndex];
                        that._availability.addAvailableTileRange(level, range.startX, yTiles - range.endY - 1, range.endX, yTiles - range.startY - 1);
                    }
                }
            }

            if (!defined(that._credit) && defined(data.attribution) && data.attribution !== null) {
                that._credit = new Credit(data.attribution);
            }

            // The vertex normals defined in the 'octvertexnormals' extension is identical to the original
            // contents of the original 'vertexnormals' extension.  'vertexnormals' extension is now
            // deprecated, as the extensionLength for this extension was incorrectly using big endian.
            // We maintain backwards compatibility with the legacy 'vertexnormal' implementation
            // by setting the _littleEndianExtensionSize to false. Always prefer 'octvertexnormals'
            // over 'vertexnormals' if both extensions are supported by the server.
            if (defined(data.extensions) && data.extensions.indexOf('octvertexnormals') !== -1) {
                that._hasVertexNormals = true;
            } else if (defined(data.extensions) && data.extensions.indexOf('vertexnormals') !== -1) {
                that._hasVertexNormals = true;
                that._littleEndianExtensionSize = false;
            }
            if (defined(data.extensions) && data.extensions.indexOf('watermask') !== -1) {
                that._hasWaterMask = true;
            }

            that._ready = true;
            that._readyPromise.resolve(true);
        }

        function metadataFailure(data) {
            // If the metadata is not found, assume this is a pre-metadata heightmap tileset.
            if (defined(data) && data.statusCode === 404) {
                metadataSuccess({
                    tilejson: '2.1.0',
                    format : 'heightmap-1.0',
                    version : '1.0.0',
                    scheme : 'tms',
                    tiles : [
                        '{z}/{x}/{y}.terrain?v={version}'
                    ]
                });
                return;
            }
            var message = 'An error occurred while accessing ' + metadataUrl + '.';
            metadataError = TileProviderError.handleError(metadataError, that, that._errorEvent, message, undefined, undefined, undefined, requestMetadata);
        }

        function requestMetadata() {
            var metadata = loadJson(metadataUrl);
            when(metadata, metadataSuccess, metadataFailure);
        }

        requestMetadata();
    }

    /**
     * When using the Quantized-Mesh format, a tile may be returned that includes additional extensions, such as PerVertexNormals, watermask, etc.
     * This enumeration defines the unique identifiers for each type of extension data that has been appended to the standard mesh data.
     *
     * @exports QuantizedMeshExtensionIds
     * @see CesiumTerrainProvider
     * @private
     */
    var QuantizedMeshExtensionIds = {
        /**
         * Oct-Encoded Per-Vertex Normals are included as an extension to the tile mesh
         *
         * @type {Number}
         * @constant
         * @default 1
         */
        OCT_VERTEX_NORMALS: 1,
        /**
         * A watermask is included as an extension to the tile mesh
         *
         * @type {Number}
         * @constant
         * @default 2
         */
        WATER_MASK: 2
    };

    function getRequestHeader(extensionsList) {
        if (!defined(extensionsList) || extensionsList.length === 0) {
            return {
                Accept : 'application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01'
            };
        }
        var extensions = extensionsList.join('-');
        return {
            Accept : 'application/vnd.quantized-mesh;extensions=' + extensions + ',application/octet-stream;q=0.9,*/*;q=0.01'
        };
    }

    function createHeightmapTerrainData(provider, buffer, level, x, y, tmsY) {
        var heightBuffer = new Uint16Array(buffer, 0, provider._heightmapWidth * provider._heightmapWidth);
        return new HeightmapTerrainData({
            buffer : heightBuffer,
            childTileMask : new Uint8Array(buffer, heightBuffer.byteLength, 1)[0],
            waterMask : new Uint8Array(buffer, heightBuffer.byteLength + 1, buffer.byteLength - heightBuffer.byteLength - 1),
            width : provider._heightmapWidth,
            height : provider._heightmapWidth,
            structure : provider._heightmapStructure
        });
    }

    function createQuantizedMeshTerrainData(provider, buffer, level, x, y, tmsY) {
        var pos = 0;
        var cartesian3Elements = 3;
        var boundingSphereElements = cartesian3Elements + 1;
        var cartesian3Length = Float64Array.BYTES_PER_ELEMENT * cartesian3Elements;
        var boundingSphereLength = Float64Array.BYTES_PER_ELEMENT * boundingSphereElements;
        var encodedVertexElements = 3;
        var encodedVertexLength = Uint16Array.BYTES_PER_ELEMENT * encodedVertexElements;
        var triangleElements = 3;
        var bytesPerIndex = Uint16Array.BYTES_PER_ELEMENT;
        var triangleLength = bytesPerIndex * triangleElements;

        var view = new DataView(buffer);
        var center = new Cartesian3(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
        pos += cartesian3Length;

        var minimumHeight = view.getFloat32(pos, true);
        pos += Float32Array.BYTES_PER_ELEMENT;
        var maximumHeight = view.getFloat32(pos, true);
        pos += Float32Array.BYTES_PER_ELEMENT;

        var boundingSphere = new BoundingSphere(
                new Cartesian3(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true)),
                view.getFloat64(pos + cartesian3Length, true));
        pos += boundingSphereLength;

        var horizonOcclusionPoint = new Cartesian3(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
        pos += cartesian3Length;

        var vertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var encodedVertexBuffer = new Uint16Array(buffer, pos, vertexCount * 3);
        pos += vertexCount * encodedVertexLength;

        if (vertexCount > 64 * 1024) {
            // More than 64k vertices, so indices are 32-bit.
            bytesPerIndex = Uint32Array.BYTES_PER_ELEMENT;
            triangleLength = bytesPerIndex * triangleElements;
        }

        // Decode the vertex buffer.
        var uBuffer = encodedVertexBuffer.subarray(0, vertexCount);
        var vBuffer = encodedVertexBuffer.subarray(vertexCount, 2 * vertexCount);
        var heightBuffer = encodedVertexBuffer.subarray(vertexCount * 2, 3 * vertexCount);

        var i;
        var u = 0;
        var v = 0;
        var height = 0;

        function zigZagDecode(value) {
            return (value >> 1) ^ (-(value & 1));
        }

        for (i = 0; i < vertexCount; ++i) {
            u += zigZagDecode(uBuffer[i]);
            v += zigZagDecode(vBuffer[i]);
            height += zigZagDecode(heightBuffer[i]);

            uBuffer[i] = u;
            vBuffer[i] = v;
            heightBuffer[i] = height;
        }

        // skip over any additional padding that was added for 2/4 byte alignment
        if (pos % bytesPerIndex !== 0) {
            pos += (bytesPerIndex - (pos % bytesPerIndex));
        }

        var triangleCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var indices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, triangleCount * triangleElements);
        pos += triangleCount * triangleLength;

        // High water mark decoding based on decompressIndices_ in webgl-loader's loader.js.
        // https://code.google.com/p/webgl-loader/source/browse/trunk/samples/loader.js?r=99#55
        // Copyright 2012 Google Inc., Apache 2.0 license.
        var highest = 0;
        for (i = 0; i < indices.length; ++i) {
            var code = indices[i];
            indices[i] = highest - code;
            if (code === 0) {
                ++highest;
            }
        }

        var westVertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var westIndices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, westVertexCount);
        pos += westVertexCount * bytesPerIndex;

        var southVertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var southIndices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, southVertexCount);
        pos += southVertexCount * bytesPerIndex;

        var eastVertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var eastIndices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, eastVertexCount);
        pos += eastVertexCount * bytesPerIndex;

        var northVertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var northIndices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, northVertexCount);
        pos += northVertexCount * bytesPerIndex;

        var encodedNormalBuffer;
        var waterMaskBuffer;
        while (pos < view.byteLength) {
            var extensionId = view.getUint8(pos, true);
            pos += Uint8Array.BYTES_PER_ELEMENT;
            var extensionLength = view.getUint32(pos, provider._littleEndianExtensionSize);
            pos += Uint32Array.BYTES_PER_ELEMENT;

            if (extensionId === QuantizedMeshExtensionIds.OCT_VERTEX_NORMALS && provider._requestVertexNormals) {
                encodedNormalBuffer = new Uint8Array(buffer, pos, vertexCount * 2);
            } else if (extensionId === QuantizedMeshExtensionIds.WATER_MASK && provider._requestWaterMask) {
                waterMaskBuffer = new Uint8Array(buffer, pos, extensionLength);
            }
            pos += extensionLength;
        }

        var skirtHeight = provider.getLevelMaximumGeometricError(level) * 5.0;

        var rectangle = provider._tilingScheme.tileXYToRectangle(x, y, level);
        var orientedBoundingBox;
        if (rectangle.width < CesiumMath.PI_OVER_TWO + CesiumMath.EPSILON5) {
            // Here, rectangle.width < pi/2, and rectangle.height < pi
            // (though it would still work with rectangle.width up to pi)

            // The skirt is not included in the OBB computation. If this ever
            // causes any rendering artifacts (cracks), they are expected to be
            // minor and in the corners of the screen. It's possible that this
            // might need to be changed - just change to `minimumHeight - skirtHeight`
            // A similar change might also be needed in `upsampleQuantizedTerrainMesh.js`.
            orientedBoundingBox = OrientedBoundingBox.fromRectangle(rectangle, minimumHeight, maximumHeight, provider._tilingScheme.ellipsoid);
        }

        return new QuantizedMeshTerrainData({
            center : center,
            minimumHeight : minimumHeight,
            maximumHeight : maximumHeight,
            boundingSphere : boundingSphere,
            orientedBoundingBox : orientedBoundingBox,
            horizonOcclusionPoint : horizonOcclusionPoint,
            quantizedVertices : encodedVertexBuffer,
            encodedNormals : encodedNormalBuffer,
            indices : indices,
            westIndices : westIndices,
            southIndices : southIndices,
            eastIndices : eastIndices,
            northIndices : northIndices,
            westSkirtHeight : skirtHeight,
            southSkirtHeight : skirtHeight,
            eastSkirtHeight : skirtHeight,
            northSkirtHeight : skirtHeight,
            childTileMask: provider.availability.computeChildMaskForTile(level, x, y),
            waterMask: waterMaskBuffer
        });
    }

    /**
     * Requests the geometry for a given tile.  This function should not be called before
     * {@link CesiumTerrainProvider#ready} returns true.  The result must include terrain data and
     * may optionally include a water mask and an indication of which child tiles are available.
     *
     * @param {Number} x The X coordinate of the tile for which to request geometry.
     * @param {Number} y The Y coordinate of the tile for which to request geometry.
     * @param {Number} level The level of the tile for which to request geometry.
     * @param {Request} [request] The request object. Intended for internal use only.
     *
     * @returns {Promise.<TerrainData>|undefined} A promise for the requested geometry.  If this method
     *          returns undefined instead of a promise, it is an indication that too many requests are already
     *          pending and the request will be retried later.
     *
     * @exception {DeveloperError} This function must not be called before {@link CesiumTerrainProvider#ready}
     *            returns true.
     */
    CesiumTerrainProvider.prototype.requestTileGeometry = function(x, y, level, request) {
        //>>includeStart('debug', pragmas.debug)
        if (!this._ready) {
            throw new DeveloperError('requestTileGeometry must not be called before the terrain provider is ready.');
        }
        //>>includeEnd('debug');

        var urlTemplates = this._tileUrlTemplates;
        if (urlTemplates.length === 0) {
            return undefined;
        }

        var yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level);

        var tmsY = (yTiles - y - 1);

        var url = urlTemplates[(x + tmsY + level) % urlTemplates.length].replace('{z}', level).replace('{x}', x).replace('{y}', tmsY);

        var proxy = this._proxy;
        if (defined(proxy)) {
            url = proxy.getURL(url);
        }

        var extensionList = [];
        if (this._requestVertexNormals && this._hasVertexNormals) {
            extensionList.push(this._littleEndianExtensionSize ? 'octvertexnormals' : 'vertexnormals');
        }
        if (this._requestWaterMask && this._hasWaterMask) {
            extensionList.push('watermask');
        }

        var promise = loadArrayBuffer(url, getRequestHeader(extensionList), request);

        if (!defined(promise)) {
            return undefined;
        }

        var that = this;
        return when(promise, function(buffer) {
            if (defined(that._heightmapStructure)) {
                return createHeightmapTerrainData(that, buffer, level, x, y, tmsY);
            }
            return createQuantizedMeshTerrainData(that, buffer, level, x, y, tmsY);
        });
    };

    defineProperties(CesiumTerrainProvider.prototype, {
        /**
         * Gets an event that is raised when the terrain provider encounters an asynchronous error.  By subscribing
         * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
         * are passed an instance of {@link TileProviderError}.
         * @memberof CesiumTerrainProvider.prototype
         * @type {Event}
         */
        errorEvent : {
            get : function() {
                return this._errorEvent;
            }
        },

        /**
         * Gets the credit to display when this terrain provider is active.  Typically this is used to credit
         * the source of the terrain.  This function should not be called before {@link CesiumTerrainProvider#ready} returns true.
         * @memberof CesiumTerrainProvider.prototype
         * @type {Credit}
         */
        credit : {
            get : function() {
                //>>includeStart('debug', pragmas.debug)
                if (!this._ready) {
                    throw new DeveloperError('credit must not be called before the terrain provider is ready.');
                }
                //>>includeEnd('debug');

                return this._credit;
            }
        },

        /**
         * Gets the tiling scheme used by this provider.  This function should
         * not be called before {@link CesiumTerrainProvider#ready} returns true.
         * @memberof CesiumTerrainProvider.prototype
         * @type {GeographicTilingScheme}
         */
        tilingScheme : {
            get : function() {
                //>>includeStart('debug', pragmas.debug)
                if (!this._ready) {
                    throw new DeveloperError('tilingScheme must not be called before the terrain provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tilingScheme;
            }
        },

        /**
         * Gets a value indicating whether or not the provider is ready for use.
         * @memberof CesiumTerrainProvider.prototype
         * @type {Boolean}
         */
        ready : {
            get : function() {
                return this._ready;
            }
        },

        /**
         * Gets a promise that resolves to true when the provider is ready for use.
         * @memberof CesiumTerrainProvider.prototype
         * @type {Promise.<Boolean>}
         * @readonly
         */
        readyPromise : {
            get : function() {
                return this._readyPromise.promise;
            }
        },

        /**
         * Gets a value indicating whether or not the provider includes a water mask.  The water mask
         * indicates which areas of the globe are water rather than land, so they can be rendered
         * as a reflective surface with animated waves.  This function should not be
         * called before {@link CesiumTerrainProvider#ready} returns true.
         * @memberof CesiumTerrainProvider.prototype
         * @type {Boolean}
         * @exception {DeveloperError} This property must not be called before {@link CesiumTerrainProvider#ready}
         */
        hasWaterMask : {
            get : function() {
                //>>includeStart('debug', pragmas.debug)
                if (!this._ready) {
                    throw new DeveloperError('hasWaterMask must not be called before the terrain provider is ready.');
                }
                //>>includeEnd('debug');

                return this._hasWaterMask && this._requestWaterMask;
            }
        },

        /**
         * Gets a value indicating whether or not the requested tiles include vertex normals.
         * This function should not be called before {@link CesiumTerrainProvider#ready} returns true.
         * @memberof CesiumTerrainProvider.prototype
         * @type {Boolean}
         * @exception {DeveloperError} This property must not be called before {@link CesiumTerrainProvider#ready}
         */
        hasVertexNormals : {
            get : function() {
                //>>includeStart('debug', pragmas.debug)
                if (!this._ready) {
                    throw new DeveloperError('hasVertexNormals must not be called before the terrain provider is ready.');
                }
                //>>includeEnd('debug');

                // returns true if we can request vertex normals from the server
                return this._hasVertexNormals && this._requestVertexNormals;
            }
        },

        /**
         * Boolean flag that indicates if the client should request vertex normals from the server.
         * Vertex normals data is appended to the standard tile mesh data only if the client requests the vertex normals and
         * if the server provides vertex normals.
         * @memberof CesiumTerrainProvider.prototype
         * @type {Boolean}
         */
        requestVertexNormals : {
            get : function() {
                return this._requestVertexNormals;
            }
        },

        /**
         * Boolean flag that indicates if the client should request a watermask from the server.
         * Watermask data is appended to the standard tile mesh data only if the client requests the watermask and
         * if the server provides a watermask.
         * @memberof CesiumTerrainProvider.prototype
         * @type {Boolean}
         */
        requestWaterMask : {
            get : function() {
                return this._requestWaterMask;
            }
        },

        /**
         * Gets an object that can be used to determine availability of terrain from this provider, such as
         * at points and in rectangles.  This function should not be called before
         * {@link CesiumTerrainProvider#ready} returns true.  This property may be undefined if availability
         * information is not available.
         * @memberof CesiumTerrainProvider.prototype
         * @type {TileAvailability}
         */
        availability : {
            get : function() {
                //>>includeStart('debug', pragmas.debug)
                if (!this._ready) {
                    throw new DeveloperError('availability must not be called before the terrain provider is ready.');
                }
                //>>includeEnd('debug');
                return this._availability;
            }
        }
    });

    /**
     * Gets the maximum geometric error allowed in a tile at a given level.
     *
     * @param {Number} level The tile level for which to get the maximum geometric error.
     * @returns {Number} The maximum geometric error.
     */
    CesiumTerrainProvider.prototype.getLevelMaximumGeometricError = function(level) {
        return this._levelZeroMaximumGeometricError / (1 << level);
    };

    /**
     * Determines whether data for a tile is available to be loaded.
     *
     * @param {Number} x The X coordinate of the tile for which to request geometry.
     * @param {Number} y The Y coordinate of the tile for which to request geometry.
     * @param {Number} level The level of the tile for which to request geometry.
     * @returns {Boolean} Undefined if not supported, otherwise true or false.
     */
    CesiumTerrainProvider.prototype.getTileDataAvailable = function(x, y, level) {
        if (!defined(this.availability)) {
            return undefined;
        }
        return this.availability.isTileAvailable(level, x, y);
    };

    return CesiumTerrainProvider;
});
