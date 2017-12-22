defineSuite([
        'Core/GeometryPipeline',
        'Core/AttributeCompression',
        'Core/BoundingSphere',
        'Core/BoxGeometry',
        'Core/Cartesian2',
        'Core/Cartesian3',
        'Core/ComponentDatatype',
        'Core/Ellipsoid',
        'Core/EllipsoidGeometry',
        'Core/EncodedCartesian3',
        'Core/GeographicProjection',
        'Core/Geometry',
        'Core/GeometryAttribute',
        'Core/GeometryInstance',
        'Core/GeometryType',
        'Core/Math',
        'Core/Matrix4',
        'Core/PolygonGeometry',
        'Core/PrimitiveType',
        'Core/Tipsify',
        'Core/VertexFormat'
    ], function(
        GeometryPipeline,
        AttributeCompression,
        BoundingSphere,
        BoxGeometry,
        Cartesian2,
        Cartesian3,
        ComponentDatatype,
        Ellipsoid,
        EllipsoidGeometry,
        EncodedCartesian3,
        GeographicProjection,
        Geometry,
        GeometryAttribute,
        GeometryInstance,
        GeometryType,
        CesiumMath,
        Matrix4,
        PolygonGeometry,
        PrimitiveType,
        Tipsify,
        VertexFormat) {
    'use strict';

    it('converts triangles to wireframe in place', function() {
        var geometry = GeometryPipeline.toWireframe(new Geometry({
            attributes : {},
            indices : [0, 1, 2, 3, 4, 5],
            primitiveType : PrimitiveType.TRIANGLES
        }));

        expect(geometry.primitiveType).toEqual(PrimitiveType.LINES);

        var v = geometry.indices;
        expect(v.length).toEqual(12);

        expect(v[0]).toEqual(0);
        expect(v[1]).toEqual(1);
        expect(v[2]).toEqual(1);
        expect(v[3]).toEqual(2);
        expect(v[4]).toEqual(2);
        expect(v[5]).toEqual(0);

        expect(v[6]).toEqual(3);
        expect(v[7]).toEqual(4);
        expect(v[8]).toEqual(4);
        expect(v[9]).toEqual(5);
        expect(v[10]).toEqual(5);
        expect(v[11]).toEqual(3);
    });

    it('converts a triangle fan to wireframe in place', function() {
        var geometry = GeometryPipeline.toWireframe(new Geometry({
            attributes : {},
            indices : [0, 1, 2, 3],
            primitiveType : PrimitiveType.TRIANGLE_FAN
        }));

        expect(geometry.primitiveType).toEqual(PrimitiveType.LINES);

        var v = geometry.indices;
        expect(v.length).toEqual(12);

        expect(v[0]).toEqual(0);
        expect(v[1]).toEqual(1);
        expect(v[2]).toEqual(1);
        expect(v[3]).toEqual(2);
        expect(v[4]).toEqual(2);
        expect(v[5]).toEqual(0);

        expect(v[6]).toEqual(0);
        expect(v[7]).toEqual(2);
        expect(v[8]).toEqual(2);
        expect(v[9]).toEqual(3);
        expect(v[10]).toEqual(3);
        expect(v[11]).toEqual(0);
    });

    it('converts a triangle strip to wireframe in place', function() {
        var geometry = GeometryPipeline.toWireframe(new Geometry({
            attributes : {},
            indices : [0, 1, 2, 3],
            primitiveType : PrimitiveType.TRIANGLE_STRIP
        }));

        expect(geometry.primitiveType).toEqual(PrimitiveType.LINES);

        var v = geometry.indices;
        expect(v.length).toEqual(12);

        expect(v[0]).toEqual(0);
        expect(v[1]).toEqual(1);
        expect(v[2]).toEqual(1);
        expect(v[3]).toEqual(2);
        expect(v[4]).toEqual(2);
        expect(v[5]).toEqual(0);

        expect(v[6]).toEqual(2);
        expect(v[7]).toEqual(3);
        expect(v[8]).toEqual(3);
        expect(v[9]).toEqual(1);
        expect(v[10]).toEqual(1);
        expect(v[11]).toEqual(2);
    });

    it('toWireframe throws without a geometry', function() {
        expect(function() {
            GeometryPipeline.toWireframe(undefined);
        }).toThrowDeveloperError();
    });

    it('toWireframe throws when primitiveType is not a triangle type', function() {
        expect(function() {
            GeometryPipeline.toWireframe(new Geometry({
                attributes : {},
                indices : [],
                primitiveType : PrimitiveType.POINTS
            }));
        }).toThrowDeveloperError();
    });

    it('createLineSegmentsForVectors', function() {
        var geometry = new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0]
                }),
                normal : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]
                })
            },
            primitiveType : PrimitiveType.TRIANGLES,
            boundingSphere : new BoundingSphere(new Cartesian3(0.5, 0.5, 0.0), 1.0)
        });
        var lines = GeometryPipeline.createLineSegmentsForVectors(geometry, 'normal', 1.0);
        var linePositions = [0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0];

        expect(lines.attributes).toBeDefined();
        expect(lines.attributes.position).toBeDefined();
        expect(lines.attributes.position.values).toEqual(linePositions);
        expect(lines.primitiveType).toEqual(PrimitiveType.LINES);
        expect(lines.boundingSphere.center).toEqual(geometry.boundingSphere.center);
        expect(lines.boundingSphere.radius).toEqual(geometry.boundingSphere.radius + 1.0);
    });

    it('createLineSegmentsForVectors throws without geometry', function() {
        expect(function() {
            GeometryPipeline.createLineSegmentsForVectors();
        }).toThrowDeveloperError();
    });

    it('createLineSegmentsForVectors throws without geometry.attributes.position', function() {
        expect(function() {
            GeometryPipeline.createLineSegmentsForVectors();
        }).toThrowDeveloperError();
    });

    it('createLineSegmentsForVectors throws when geometry.attributes does not have an attributeName property', function() {
        var geometry = new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : [0.0, 1.0, 2.0, 3.0, 4.0, 5.0]
                })
            },
            primitiveType : PrimitiveType.TRIANGLES
        });

        expect(function() {
            GeometryPipeline.createLineSegmentsForVectors(geometry, 'bitangent');
        }).toThrowDeveloperError();
    });

    it('creates attribute indices', function() {
        var geometry = new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : []
                }),
                normal : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : []
                }),
                color : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.UNSIGNED_BYTE,
                    componentsPerAttribute : 4,
                    values : []
                })
            },
            primitiveType : PrimitiveType.TRIANGLES
        });

        var indices = GeometryPipeline.createAttributeLocations(geometry);

        var validIndices = [0, 1, 2];
        expect(validIndices).toContain(indices.position);
        expect(validIndices).toContain(indices.normal);
        expect(validIndices).toContain(indices.color);
        expect(indices.position).not.toEqual(indices.normal);
        expect(indices.position).not.toEqual(indices.color);
    });

    it('createAttributeLocations throws without a geometry', function() {
        expect(function() {
            GeometryPipeline.createAttributeLocations(undefined);
        }).toThrowDeveloperError();
    });

    it('reorderForPreVertexCache reorders all indices and attributes for the pre vertex cache', function() {
        var geometry = new Geometry({
            attributes : {
                weight : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 1,
                    values : [0.0, 1.0, 2.0, 3.0, 4.0, 5.0]
                }),
                positions : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0]
                })
            },
            indices : [5, 3, 2, 0, 1, 4, 4, 1, 3, 2, 5, 0],
            primitiveType : PrimitiveType.TRIANGLES
        });

        GeometryPipeline.reorderForPreVertexCache(geometry);

        expect(geometry.indices[0]).toEqual(0);
        expect(geometry.indices[1]).toEqual(1);
        expect(geometry.indices[2]).toEqual(2);
        expect(geometry.indices[3]).toEqual(3);
        expect(geometry.indices[4]).toEqual(4);
        expect(geometry.indices[5]).toEqual(5);
        expect(geometry.indices[6]).toEqual(5);
        expect(geometry.indices[7]).toEqual(4);
        expect(geometry.indices[8]).toEqual(1);
        expect(geometry.indices[9]).toEqual(2);
        expect(geometry.indices[10]).toEqual(0);
        expect(geometry.indices[11]).toEqual(3);

        expect(geometry.attributes.weight.values[0]).toEqual(5.0);
        expect(geometry.attributes.weight.values[1]).toEqual(3.0);
        expect(geometry.attributes.weight.values[2]).toEqual(2.0);
        expect(geometry.attributes.weight.values[3]).toEqual(0.0);
        expect(geometry.attributes.weight.values[4]).toEqual(1.0);
        expect(geometry.attributes.weight.values[5]).toEqual(4.0);

        expect(geometry.attributes.positions.values[0]).toEqual(15);
        expect(geometry.attributes.positions.values[1]).toEqual(16);
        expect(geometry.attributes.positions.values[2]).toEqual(17);
        expect(geometry.attributes.positions.values[3]).toEqual(9);
        expect(geometry.attributes.positions.values[4]).toEqual(10);
        expect(geometry.attributes.positions.values[5]).toEqual(11);
        expect(geometry.attributes.positions.values[6]).toEqual(6);
        expect(geometry.attributes.positions.values[7]).toEqual(7);
        expect(geometry.attributes.positions.values[8]).toEqual(8);
        expect(geometry.attributes.positions.values[9]).toEqual(0);
        expect(geometry.attributes.positions.values[10]).toEqual(1);
        expect(geometry.attributes.positions.values[11]).toEqual(2);
        expect(geometry.attributes.positions.values[12]).toEqual(3);
        expect(geometry.attributes.positions.values[13]).toEqual(4);
        expect(geometry.attributes.positions.values[14]).toEqual(5);
        expect(geometry.attributes.positions.values[15]).toEqual(12);
        expect(geometry.attributes.positions.values[16]).toEqual(13);
        expect(geometry.attributes.positions.values[17]).toEqual(14);
    });

    it('reoderForPreVertexCache removes unused vertices', function() {
        var geometry = new Geometry({
            attributes : {
                weight : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 1,
                    values : [0.0, 1.0, 2.0, 3.0, 4.0, 5.0]
                }),
                positions : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0]
                })
            },
            indices : [5, 3, 2, 4, 1, 3],
            primitiveType : PrimitiveType.TRIANGLES
        });

        GeometryPipeline.reorderForPreVertexCache(geometry);

        expect(geometry.indices.length).toEqual(6);
        expect(geometry.attributes.positions.values.length).toEqual((6 - 1) * 3);
        expect(geometry.attributes.weight.values.length).toEqual(6 - 1);
    });

    it('reorderForPreVertexCache throws without a geometry', function() {
        expect(function() {
            GeometryPipeline.reorderForPreVertexCache(undefined);
        }).toThrowDeveloperError();
    });

    it('reorderForPreVertexCache throws when attributes have a different number of attributes', function() {
        expect(function() {
            var geometry = new Geometry({
                attributes : {
                    attribute1 : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 1,
                        values : [0, 1, 2]
                    }),
                    attribute2 : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [0, 1, 2, 3, 4, 5]
                    })
                }
            });

            GeometryPipeline.reorderForPreVertexCache(geometry);
        }).toThrowDeveloperError();
    });

    it('reorderForPostVertexCache reorders indices for the post vertex cache', function() {
        var geometry = EllipsoidGeometry.createGeometry(new EllipsoidGeometry());
        var acmrBefore = Tipsify.calculateACMR({
            indices : geometry.indices,
            cacheSize : 24
        });
        expect(acmrBefore).toBeGreaterThan(1.0);
        geometry = GeometryPipeline.reorderForPostVertexCache(geometry);
        var acmrAfter = Tipsify.calculateACMR({
            indices : geometry.indices,
            cacheSize : 24
        });
        expect(acmrAfter).toBeLessThan(0.7);
    });

    it('reorderForPostVertexCache throws without a geometry', function() {
        expect(function() {
            GeometryPipeline.reorderForPostVertexCache(undefined);
        }).toThrowDeveloperError();
    });

    it('fitToUnsignedShortIndicestoThrowDeveloperErrorot change geometry', function() {
        var geometry = new Geometry({
            attributes : {
                time : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 1,
                    values : [10.0]
                }),
                heat : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 1,
                    values : [1.0]
                })
            },
            indices : [0, 0, 0],
            primitiveType : PrimitiveType.TRIANGLES
        });

        var geometries = GeometryPipeline.fitToUnsignedShortIndices(geometry);

        expect(geometries.length).toEqual(1);
        expect(geometries[0]).toBe(geometry);
    });

    it('fitToUnsignedShortIndices creates one geometry', function() {
        var sixtyFourK = CesiumMath.SIXTY_FOUR_KILOBYTES;
        var times = [];
        for ( var i = 0; i < sixtyFourK + 1; ++i) {
            times.push(i);
        }

        var geometry = new Geometry({
            attributes : {
                time : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 1,
                    values : times
                })
            },
            indices : [0, 0, 0, sixtyFourK, sixtyFourK, sixtyFourK, 0, sixtyFourK, 0],
            primitiveType : PrimitiveType.TRIANGLES
        });

        var geometries = GeometryPipeline.fitToUnsignedShortIndices(geometry);

        expect(geometries.length).toEqual(1);
        expect(geometries[0].attributes.time.componentDatatype).toEqual(ComponentDatatype.FLOAT);
        expect(geometries[0].attributes.time.componentsPerAttribute).toEqual(1);
        expect(geometries[0].attributes.time.values).toEqual([0, sixtyFourK]);

        expect(geometries[0].primitiveType).toEqual(PrimitiveType.TRIANGLES);
        expect(geometries[0].indices).toEqual([0, 0, 0, 1, 1, 1, 0, 1, 0]);
    });

    it('fitToUnsignedShortIndices creates two triangle geometries', function() {
        var sixtyFourK = CesiumMath.SIXTY_FOUR_KILOBYTES;

        var positions = [];
        for ( var i = 0; i < sixtyFourK + 1; ++i) {
            positions.push(i, i, i);
        }

        var indices = [];
        for ( var j = sixtyFourK; j > 1; j -= 3) {
            indices.push(j, j - 1, j - 2);
        }
        indices.push(0, 1, 2);

        var geometry = new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : positions
                })
            },
            indices : indices,
            primitiveType : PrimitiveType.TRIANGLES
        });

        var geometries = GeometryPipeline.fitToUnsignedShortIndices(geometry);

        expect(geometries.length).toEqual(2);

        expect(geometries[0].attributes.position.values.length).toEqual(positions.length - 6); // Two vertices are not copied (0, 1)
        expect(geometries[0].indices.length).toEqual(indices.length - 3); // One triangle is not copied (0, 1, 2)

        expect(geometries[1].attributes.position.values.length).toEqual(9);
        expect(geometries[1].indices.length).toEqual(3);
    });

    it('fitToUnsignedShortIndices creates two line geometries', function() {
        var sixtyFourK = CesiumMath.SIXTY_FOUR_KILOBYTES;

        var positions = [];
        for ( var i = 0; i < sixtyFourK + 2; ++i) {
            positions.push(i, i, i);
        }

        var indices = [];
        for ( var j = sixtyFourK; j > 1; j -= 2) {
            indices.push(j, j - 1);
        }
        indices.push(0, 1);

        var geometry = new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : positions
                })
            },
            indices : indices,
            primitiveType : PrimitiveType.LINES
        });

        var geometries = GeometryPipeline.fitToUnsignedShortIndices(geometry);

        expect(geometries.length).toEqual(2);

        expect(geometries[0].attributes.position.values.length).toEqual(positions.length - 12); // Four vertices are not copied
        expect(geometries[0].indices.length).toEqual(indices.length - 4); // Two lines are not copied

        expect(geometries[1].attributes.position.values.length).toEqual(9);
        expect(geometries[1].indices.length).toEqual(4);
    });

    it('fitToUnsignedShortIndices creates two point geometries', function() {
        var sixtyFourK = CesiumMath.SIXTY_FOUR_KILOBYTES;

        var positions = [];
        var indices = [];
        for ( var i = 0; i < sixtyFourK + 1; ++i) {
            positions.push(i, i, i);
            indices.push(i);
        }

        var geometry = new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : positions
                })
            },
            indices : indices,
            primitiveType : PrimitiveType.POINTS
        });

        var geometries = GeometryPipeline.fitToUnsignedShortIndices(geometry);

        expect(geometries.length).toEqual(2);

        expect(geometries[0].attributes.position.values.length).toEqual(positions.length - 6); // Two vertices are not copied
        expect(geometries[0].indices.length).toEqual(indices.length - 2); // Two points are not copied

        expect(geometries[1].attributes.position.values.length).toEqual(6);
        expect(geometries[1].indices.length).toEqual(2);
    });

    it('fitToUnsignedShortIndices throws without a geometry', function() {
        expect(function() {
            GeometryPipeline.fitToUnsignedShortIndices(undefined);
        }).toThrowDeveloperError();
    });

    it('fitToUnsignedShortIndices throws without triangles, lines, or points', function() {
        var geometry = new Geometry({
            attributes : {
                time : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 1,
                    values : [10.0, 11.0, 12.0]
                })
            },
            indices : [0, 1, 2],
            primitiveType : PrimitiveType.TRIANGLE_STRIP
        });

        expect(function() {
            return GeometryPipeline.fitToUnsignedShortIndices(geometry);
        }).toThrowDeveloperError();
    });

    it('fitToUnsignedShortIndices throws with different numbers of attributes', function() {
        var geometry = new Geometry({
            attributes : {
                time : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 1,
                    values : [10.0]
                }),
                heat : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 1,
                    values : [1.0, 2.0]
                })
            },
            indices : [0, 0, 0],
            primitiveType : PrimitiveType.TRIANGLES
        });

        expect(function() {
            return GeometryPipeline.fitToUnsignedShortIndices(geometry);
        }).toThrowDeveloperError();
    });

    it('projectTo2D', function() {
        var p1 = new Cartesian3(100000, 200000, 300000);
        var p2 = new Cartesian3(400000, 500000, 600000);

        var geometry = {};
        geometry.attributes = {};
        geometry.attributes.position = {
            componentDatatype : ComponentDatatype.DOUBLE,
            componentsPerAttribute : 3,
            values : [p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]
        };

        geometry = GeometryPipeline.projectTo2D(geometry, 'position', 'position3D', 'position2D');

        var ellipsoid = Ellipsoid.WGS84;
        var projection = new GeographicProjection();
        var projectedP1 = projection.project(ellipsoid.cartesianToCartographic(p1));
        var projectedP2 = projection.project(ellipsoid.cartesianToCartographic(p2));

        expect(geometry.attributes.position2D.values[0]).toEqual(projectedP1.x);
        expect(geometry.attributes.position2D.values[1]).toEqual(projectedP1.y);
        expect(geometry.attributes.position2D.values[2]).toEqual(projectedP1.z);
        expect(geometry.attributes.position2D.values[3]).toEqual(projectedP2.x);
        expect(geometry.attributes.position2D.values[4]).toEqual(projectedP2.y);
        expect(geometry.attributes.position2D.values[5]).toEqual(projectedP2.z);

        expect(geometry.attributes.position3D.values[0]).toEqual(p1.x);
        expect(geometry.attributes.position3D.values[1]).toEqual(p1.y);
        expect(geometry.attributes.position3D.values[2]).toEqual(p1.z);
        expect(geometry.attributes.position3D.values[3]).toEqual(p2.x);
        expect(geometry.attributes.position3D.values[4]).toEqual(p2.y);
        expect(geometry.attributes.position3D.values[5]).toEqual(p2.z);
    });

    it('projectTo2D throws without a geometry', function() {
        expect(function() {
            GeometryPipeline.projectTo2D(undefined);
        }).toThrowDeveloperError();
    });

    it('projectTo2D throws without attributeName', function() {
        expect(function() {
            GeometryPipeline.projectTo2D(new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }));
        }).toThrowDeveloperError();
    });

    it('projectTo2D throws without attributeName3D', function() {
        expect(function() {
            GeometryPipeline.projectTo2D(new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }), 'position');
        }).toThrowDeveloperError();
    });

    it('projectTo2D throws without attributeName2D', function() {
        expect(function() {
            GeometryPipeline.projectTo2D(new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }), 'position', 'position3D');
        }).toThrowDeveloperError();
    });

    it('projectTo2D throws without attribute', function() {
        expect(function() {
            GeometryPipeline.projectTo2D(new Geometry({
                attributes : {
                    normal : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }), 'position', 'position3D', 'position2D');
        }).toThrowDeveloperError();
    });

    it('projectTo2D throws without ComponentDatatype.DOUBLE', function() {
        expect(function() {
            var geometry = new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.UNSIGNED_SHORT,
                        componentsPerAttribute : 1,
                        values : [0.0]
                    })
                }
            });
            GeometryPipeline.projectTo2D(geometry, 'position', 'position3D', 'position2D');
        }).toThrowDeveloperError();
    });

    it('projectTo2D throws when trying to project a point close to the origin', function() {
        var geometry = {};
        geometry.attributes = {};
        geometry.attributes.position = {
            componentDatatype : ComponentDatatype.DOUBLE,
            componentsPerAttribute : 3,
            values : [100000.0, 200000.0, 300000.0, 0.0, 0.0, 0.0]
        };

        expect(function() {
            return GeometryPipeline.projectTo2D(geometry, 'position', 'position3D', 'position2D');
        }).toThrowDeveloperError();
    });

    it('encodeAttribute encodes positions', function() {
        var c = new Cartesian3(-10000000.0, 0.0, 10000000.0);
        var encoded = EncodedCartesian3.fromCartesian(c);

        var geometry = new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.DOUBLE,
                    componentsPerAttribute : 3,
                    values : [c.x, c.y, c.z]
                })
            },
            primitiveType : PrimitiveType.POINTS
        });
        geometry = GeometryPipeline.encodeAttribute(geometry, 'position', 'positionHigh', 'positionLow');

        expect(geometry.attributes.positionHigh).toBeDefined();
        expect(geometry.attributes.positionHigh.values[0]).toEqual(encoded.high.x);
        expect(geometry.attributes.positionHigh.values[1]).toEqual(encoded.high.y);
        expect(geometry.attributes.positionHigh.values[2]).toEqual(encoded.high.z);
        expect(geometry.attributes.positionLow).toBeDefined();
        expect(geometry.attributes.positionLow.values[0]).toEqual(encoded.low.x);
        expect(geometry.attributes.positionLow.values[1]).toEqual(encoded.low.y);
        expect(geometry.attributes.positionLow.values[2]).toEqual(encoded.low.z);
        expect(geometry.attributes.position).not.toBeDefined();
    });

    it('encodeAttribute throws without a geometry', function() {
        expect(function() {
            GeometryPipeline.encodeAttribute(undefined);
        }).toThrowDeveloperError();
    });

    it('encodeAttribute throws without attributeName', function() {
        expect(function() {
            GeometryPipeline.encodeAttribute(new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }));
        }).toThrowDeveloperError();
    });

    it('encodeAttribute throws without attributeHighName', function() {
        expect(function() {
            GeometryPipeline.encodeAttribute(new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }), 'position');
        }).toThrowDeveloperError();
    });

    it('encodeAttribute throws without attributeLowName', function() {
        expect(function() {
            GeometryPipeline.encodeAttribute(new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }), 'position', 'positionHigh');
        }).toThrowDeveloperError();
    });

    it('encodeAttribute throws without attribute', function() {
        expect(function() {
            GeometryPipeline.encodeAttribute(new Geometry({
                attributes : {
                    normal : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }), 'position', 'positionHigh', 'positionLow');
        }).toThrowDeveloperError();
    });

    it('encodeAttribute throws without ComponentDatatype.DOUBLE', function() {
        expect(function() {
            var geometry = new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.UNSIGNED_SHORT,
                        componentsPerAttribute : 1,
                        values : [0.0]
                    })
                }
            });
            GeometryPipeline.encodeAttribute(geometry, 'position', 'positionHigh', 'positionLow');
        }).toThrowDeveloperError();
    });

    it('transformToWorldCoordinates', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 0.0,
                            1.0, 0.0, 0.0,
                            0.0, 1.0, 0.0
                        ]
                    }),
                    normal : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 1.0,
                            0.0, 0.0, 1.0,
                            0.0, 0.0, 1.0
                        ]
                    })
                },
                indices : [0, 1, 2],
                primitiveType : PrimitiveType.TRIANGLES,
                boundingSphere : new BoundingSphere(new Cartesian3(0.5, 0.5, 0.0), 1.0)
            }),
            modelMatrix : new Matrix4(0.0, 0.0, 1.0, 0.0,
                                      1.0, 0.0, 0.0, 0.0,
                                      0.0, 1.0, 0.0, 0.0,
                                      0.0, 0.0, 0.0, 1.0)
        });

        var transformed = GeometryPipeline.transformToWorldCoordinates(instance);
        var transformedPositions = [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
        var transformedNormals = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0];

        expect(transformed.geometry.attributes.position.values).toEqual(transformedPositions);
        expect(transformed.geometry.attributes.normal.values).toEqual(transformedNormals);
        expect(transformed.geometry.boundingSphere).toEqual(new BoundingSphere(new Cartesian3(0.0, 0.5, 0.5), 1.0));
        expect(transformed.modelMatrix).toEqual(Matrix4.IDENTITY);
    });

    it('transformToWorldCoordinates with non-uniform scale', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 0.0,
                            1.0, 0.0, 0.0,
                            0.0, 1.0, 0.0
                        ]
                    }),
                    normal : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 1.0,
                            0.0, 0.0, 1.0,
                            0.0, 0.0, 1.0
                        ]
                    })
                },
                indices : [0, 1, 2],
                primitiveType : PrimitiveType.TRIANGLES,
                boundingSphere : new BoundingSphere(new Cartesian3(0.5, 0.5, 0.0), 1.0)
            }),
            modelMatrix : Matrix4.fromScale(new Cartesian3(1.0, 2.0, 4.0))
        });

        var transformed = GeometryPipeline.transformToWorldCoordinates(instance);
        var transformedPositions = [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 2.0, 0.0];
        var transformedNormals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];

        expect(transformed.geometry.attributes.position.values).toEqual(transformedPositions);
        expect(transformed.geometry.attributes.normal.values).toEqual(transformedNormals);
        expect(transformed.geometry.boundingSphere).toEqual(new BoundingSphere(new Cartesian3(0.5, 1.0, 0.0), 4.0));
        expect(transformed.modelMatrix).toEqual(Matrix4.IDENTITY);
    });

    it('transformToWorldCoordinates does nothing when already in world coordinates', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 0.0,
                            1.0, 0.0, 0.0,
                            0.0, 1.0, 0.0
                        ]
                    }),
                    normal : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 1.0,
                            0.0, 0.0, 1.0,
                            0.0, 0.0, 1.0
                        ]
                    })
                },
                indices : [0, 1, 2],
                primitiveType : PrimitiveType.TRIANGLES,
                boundingSphere : new BoundingSphere(new Cartesian3(0.5, 0.5, 0.0), 1.0)
            }),
            modelMatrix : Matrix4.IDENTITY
        });

        var transformed = GeometryPipeline.transformToWorldCoordinates(instance);
        var transformedPositions = [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0];
        var transformedNormals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];

        expect(transformed.geometry.attributes.position.values).toEqual(transformedPositions);
        expect(transformed.geometry.attributes.normal.values).toEqual(transformedNormals);
        expect(transformed.geometry.boundingSphere).toEqual(new BoundingSphere(new Cartesian3(0.5, 0.5, 0.0), 1.0));
        expect(transformed.modelMatrix).toEqual(Matrix4.IDENTITY);
    });

    it('transformToWorldCoordinates throws without an instance', function() {
        expect(function() {
            GeometryPipeline.transformToWorldCoordinates();
        }).toThrowDeveloperError();
    });

    it('combineInstances combines one geometry', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : new Float32Array([0.0, 0.0, 0.0])
                    })
                },
                primitiveType : PrimitiveType.POINTS
            })
        });

        var combined = GeometryPipeline.combineInstances([instance])[0];
        expect(combined).toEqual(instance.geometry);
    });

    it('combineInstances combines several geometries without indicess', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            })
        });
        var anotherInstance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [1.0, 1.0, 1.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            })
        });

        var combined = GeometryPipeline.combineInstances([instance, anotherInstance])[0];
        expect(combined).toEqual(new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : new Float32Array([
                        0.0, 0.0, 0.0,
                        1.0, 1.0, 1.0
                    ])
                })
            },
            primitiveType : PrimitiveType.POINTS
        }));
    });

    it('combineInstances combines several geometries with indicess', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 0.0,
                            1.0, 1.0, 1.0,
                            2.0, 2.0, 2.0
                        ]
                    }),
                    normal : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 0.0,
                            1.0, 1.0, 1.0,
                            2.0, 2.0, 2.0
                        ]
                    })
                },
                indices : [0, 1, 2],
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        var anotherInstance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            3.0, 3.0, 3.0,
                            4.0, 4.0, 4.0,
                            5.0, 5.0, 5.0
                        ]
                    })
                },
                indices : [0, 1, 2],
                primitiveType : PrimitiveType.TRIANGLES
            })
        });

        var combined = GeometryPipeline.combineInstances([instance, anotherInstance])[0];
        expect(combined).toEqual(new Geometry({
            attributes : {
                position : new GeometryAttribute({
                    componentDatatype : ComponentDatatype.FLOAT,
                    componentsPerAttribute : 3,
                    values : new Float32Array([
                        0.0, 0.0, 0.0,
                        1.0, 1.0, 1.0,
                        2.0, 2.0, 2.0,
                        3.0, 3.0, 3.0,
                        4.0, 4.0, 4.0,
                        5.0, 5.0, 5.0
                    ])
                })
            },
            indices : new Uint16Array([0, 1, 2, 3, 4, 5]),
            primitiveType : PrimitiveType.TRIANGLES
        }));
    });

    it('combineInstances with geometry that is and is not split by the IDL', function() {
        var instances = [
            GeometryPipeline.splitLongitude(new GeometryInstance({
                geometry : PolygonGeometry.createGeometry(PolygonGeometry.fromPositions({
                    positions : Cartesian3.fromDegreesArray([
                        179.0, 1.0,
                        179.0, -1.0,
                        -179.0, -1.0,
                        -179.0, 1.0
                    ]),
                    vertexFormat : VertexFormat.POSITION_ONLY,
                    granularity : 2.0 * CesiumMath.RADIANS_PER_DEGREE
                }))
            })),
            new GeometryInstance({
                geometry : PolygonGeometry.createGeometry(PolygonGeometry.fromPositions({
                    positions : Cartesian3.fromDegreesArray([
                        -1.0, 1.0,
                        -1.0, -1.0,
                        1.0, -1.0,
                        1.0, 1.0
                    ]),
                    vertexFormat : VertexFormat.POSITION_ONLY,
                    granularity : 2.0 * CesiumMath.RADIANS_PER_DEGREE
                }))
            })
        ];

        var combinedInstances = GeometryPipeline.combineInstances(instances);
        expect(combinedInstances.length).toEqual(3);
    });

    it('combineInstances combines bounding spheres', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            0.0, 0.0, 0.0,
                            1.0, 0.0, 0.0,
                            0.0, 1.0, 0.0
                        ]
                    })
                },
                indices : [0, 1, 2],
                primitiveType : PrimitiveType.TRIANGLES,
                boundingSphere : new BoundingSphere(new Cartesian3(0.5, 0.5, 0.0), 1.0)
            })
        });
        var anotherInstance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [
                            1.0, 0.0, 0.0,
                            2.0, 0.0, 0.0,
                            1.0, 1.0, 0.0
                        ]
                    })
                },
                indices : [0, 1, 2],
                primitiveType : PrimitiveType.TRIANGLES,
                boundingSphere : new BoundingSphere(new Cartesian3(1.5, 0.5, 0.0), 1.0)
            })
        });

        var combined = GeometryPipeline.combineInstances([instance, anotherInstance])[0];
        var expected = BoundingSphere.union(instance.geometry.boundingSphere, anotherInstance.geometry.boundingSphere);
        expect(combined.boundingSphere).toEqual(expected);
    });

    it('combineInstances throws without instances', function() {
        expect(function() {
            GeometryPipeline.combineInstances();
        }).toThrowDeveloperError();
    });

    it('combineInstances throws when instances.length is zero', function() {
        expect(function() {
            GeometryPipeline.combineInstances([]);
        }).toThrowDeveloperError();
    });

    it('combineInstances throws when instances.modelMatrix do not match', function() {
        var instance0 = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }),
            modelMatrix : Matrix4.fromScale(new Cartesian3(1.0, 1.0, 1.0))
        });

        var instance1 = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            }),
            modelMatrix : Matrix4.fromScale(new Cartesian3(2.0, 2.0, 2.0))
        });

        expect(function() {
            GeometryPipeline.combineInstances([instance0, instance1]);
        }).toThrowDeveloperError();
    });

    it('combineInstances throws when instance geometries do not all have or not have an indices', function() {
        var instance0 = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                indices : [0],
                primitiveType : PrimitiveType.POINTS
            })
        });

        var instance1 = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            })
        });

        expect(function() {
            GeometryPipeline.combineInstances([instance0, instance1]);
        }).toThrowDeveloperError();
    });

    it('combineInstances throws when instance geometries do not all have the same primitive type', function() {
        var instance0 = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.POINTS
            })
        });

        var instance1 = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : [0.0, 0.0, 0.0, 1.0, 0.0, 0.0]
                    })
                },
                primitiveType : PrimitiveType.LINES
            })
        });

        expect(function() {
            GeometryPipeline.combineInstances([instance0, instance1]);
        }).toThrowDeveloperError();
    });

    it('computeNormal throws when geometry is undefined', function() {
        expect(function() {
            GeometryPipeline.computeNormal();
        }).toThrowDeveloperError();
    });

    it('computeNormal throws when geometry.attributes.position is undefined', function() {
        var geometry = new Geometry({
            attributes: {},
            primitiveType : PrimitiveType.TRIANGLES
        });

        expect(function() {
            GeometryPipeline.computeNormal(geometry);
        }).toThrowDeveloperError();
    });

    it('computeNormal throws when geometry.indices is undefined', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            primitiveType : PrimitiveType.TRIANGLES
        });

        expect(function() {
            GeometryPipeline.computeNormal(geometry);
        }).toThrowDeveloperError();
    });

    it('computeNormal throws when geometry.indices.length is not a multiple of 3', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            primitiveType : PrimitiveType.TRIANGLES
        });

        expect(function() {
            GeometryPipeline.computeNormal(geometry);
        }).toThrowDeveloperError();
    });

    it('computeNormal throws when primitive type is not triangle', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2],
            primitiveType: PrimitiveType.TRIANGLE_STRIP
        });

        expect(function() {
            GeometryPipeline.computeNormal(geometry);
        }).toThrowDeveloperError();
    });


    it('computeNormal computes normal for one triangle', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2],
            primitiveType: PrimitiveType.TRIANGLES
        });

        geometry = GeometryPipeline.computeNormal(geometry);

        expect(geometry.attributes.normal.values.length).toEqual(3*3);
        expect(geometry.attributes.normal.values).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    });

    it('computeNormal computes normal for two triangles', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 1, 1, 1, 1, 2, 0, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2, 1, 3, 2],
            primitiveType: PrimitiveType.TRIANGLES
        });

        geometry = GeometryPipeline.computeNormal(geometry);

        var normals = geometry.attributes.normal.values;
        expect(normals.length).toEqual(4*3);

        var a = Cartesian3.normalize(new Cartesian3(-1, 0, 1), new Cartesian3());

        expect(Cartesian3.fromArray(normals, 0)).toEqualEpsilon(a, CesiumMath.EPSILON7);
        expect(Cartesian3.fromArray(normals, 3)).toEqualEpsilon(Cartesian3.UNIT_Z, CesiumMath.EPSILON7);
        expect(Cartesian3.fromArray(normals, 6)).toEqualEpsilon(Cartesian3.UNIT_Z, CesiumMath.EPSILON7);

        a = Cartesian3.normalize(new Cartesian3(1, 0, 1), new Cartesian3());
        expect(Cartesian3.fromArray(normals, 9)).toEqualEpsilon(a, CesiumMath.EPSILON7);
    });

    it('computeNormal computes normal for six triangles', function() {
        var geometry = new Geometry ({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2, 3, 0, 2, 4, 0, 3, 4, 5, 0, 5, 6, 0, 6, 1, 0],
            primitiveType: PrimitiveType.TRIANGLES
        });

        geometry = GeometryPipeline.computeNormal(geometry);

        var normals = geometry.attributes.normal.values;
        expect(normals.length).toEqual(7*3);

        var a = Cartesian3.normalize(new Cartesian3(-1, -1, -1), new Cartesian3());
        expect(Cartesian3.fromArray(normals, 0)).toEqualEpsilon(a, CesiumMath.EPSILON7);

        a = Cartesian3.normalize(new Cartesian3(0, -1, -1), new Cartesian3());
        expect(Cartesian3.fromArray(normals, 3)).toEqualEpsilon(a, CesiumMath.EPSILON7);

        expect(Cartesian3.fromArray(normals, 6)).toEqualEpsilon(Cartesian3.negate(Cartesian3.UNIT_Y, new Cartesian3()), CesiumMath.EPSILON7);

        a = Cartesian3.normalize(new Cartesian3(-1, -1, 0), new Cartesian3());
        expect(Cartesian3.fromArray(normals, 9)).toEqualEpsilon(a, CesiumMath.EPSILON7);

        expect(Cartesian3.fromArray(normals, 12)).toEqualEpsilon(Cartesian3.negate(Cartesian3.UNIT_X, new Cartesian3()), CesiumMath.EPSILON7);

        a = Cartesian3.normalize(new Cartesian3(-1, 0, -1), new Cartesian3());
        expect(Cartesian3.fromArray(normals, 15)).toEqualEpsilon(a, CesiumMath.EPSILON7);

        expect(Cartesian3.fromArray(normals, 18)).toEqualEpsilon(Cartesian3.negate(Cartesian3.UNIT_Z, new Cartesian3()), CesiumMath.EPSILON7);
    });

    it('computeNormal computes normal of (0,0,1) for a degenerate triangle', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 0],
            primitiveType: PrimitiveType.TRIANGLES
        });

        geometry = GeometryPipeline.computeNormal(geometry);

        expect(geometry.attributes.normal.values.length).toEqual(2*3);
        expect(geometry.attributes.normal.values).toEqual([0, 0, 1, 0, 0, 1]);
    });

    it('computeNormal takes first normal for two coplanar triangles with opposite winding orders', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 1, 1, 1, 1],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2, 2, 1, 0],
            primitiveType: PrimitiveType.TRIANGLES
        });

        geometry = GeometryPipeline.computeNormal(geometry);

        var normals = geometry.attributes.normal.values;
        expect(normals.length).toEqual(3*3);

        var a = Cartesian3.normalize(new Cartesian3(-1, 0, 1), new Cartesian3());

        expect(Cartesian3.fromArray(normals, 0)).toEqualEpsilon(a, CesiumMath.EPSILON7);
        expect(Cartesian3.fromArray(normals, 3)).toEqualEpsilon(a, CesiumMath.EPSILON7);
        expect(Cartesian3.fromArray(normals, 6)).toEqualEpsilon(a, CesiumMath.EPSILON7);
    });

    it('computeTangentAndBitangent throws when geometry is undefined', function() {
        expect(function() {
            GeometryPipeline.computeTangentAndBitangent();
        }).toThrowDeveloperError();
    });

    it('computeTangentAndBitangent throws when position is undefined', function() {
        var geometry = new Geometry({
            attributes: {
                normal: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                }),
                st: new GeometryAttribute({
                    values: [0, 0, 1, 1],
                    componentsPerAttribute: 2,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2],
            primitiveType: PrimitiveType.TRIANGLE_STRIP
        });

        expect(function() {
            GeometryPipeline.computeTangentAndBitangent(geometry);
       }).toThrowDeveloperError();
    });

    it('computeTangentAndBitangent throws when normal is undefined', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                }),
                st: new GeometryAttribute({
                    values: [0, 0, 1, 1],
                    componentsPerAttribute: 2,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2],
            primitiveType: PrimitiveType.TRIANGLE_STRIP
        });

        expect(function() {
            GeometryPipeline.computeTangentAndBitangent(geometry);
       }).toThrowDeveloperError();
    });

    it('computeTangentAndBitangent throws when st is undefined', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                }),
                normal: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                })
            },
            indices : [0, 1, 2],
            primitiveType: PrimitiveType.TRIANGLE_STRIP
        });

        expect(function() {
            GeometryPipeline.computeTangentAndBitangent(geometry);
       }).toThrowDeveloperError();
    });

    it('computeTangentAndBitangent throws when geometry.indices is undefined', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                }),
                normal: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                }),
                st: new GeometryAttribute({
                    values: [0, 0, 1, 1],
                    componentsPerAttribute: 2,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            primitiveType : PrimitiveType.POINTS
        });

        expect(function() {
             GeometryPipeline.computeTangentAndBitangent(geometry);
        }).toThrowDeveloperError();
    });

    it('computeTangentAndBitangent throws when indices is not a multiple of 3', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                }),
                normal: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                }),
                st: new GeometryAttribute({
                    values: [0, 0, 1, 1],
                    componentsPerAttribute: 2,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2, 3, 4],
            primitiveType: PrimitiveType.TRIANGLES
        });

        expect(function() {
            GeometryPipeline.computeTangentAndBitangent(geometry);
       }).toThrowDeveloperError();
    });

    it('computeTangentAndBitangent throws when primitive type is not triangle', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                }),
                normal: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT

                }),
                st: new GeometryAttribute({
                    values: [0, 0, 1, 1],
                    componentsPerAttribute: 2,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2],
            primitiveType: PrimitiveType.TRIANGLE_STRIP
        });

        expect(function() {
            GeometryPipeline.computeTangentAndBitangent(geometry);
       }).toThrowDeveloperError();
    });

    it('computeTangentAndBitangent computes tangent and bitangent for one triangle', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                }),
                st: new GeometryAttribute({
                    values: [0, 0, 1, 0, 0, 1],
                    componentsPerAttribute: 2,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2],
            primitiveType: PrimitiveType.TRIANGLES
        });

        geometry = GeometryPipeline.computeNormal(geometry);
        geometry = GeometryPipeline.computeTangentAndBitangent(geometry);

        expect(geometry.attributes.tangent.values).toEqual([1, 0, 0, 1, 0, 0, 1, 0, 0]);
        expect(geometry.attributes.bitangent.values).toEqual([0, 1, 0, 0, 1, 0, 0, 1, 0]);
    });

    it('computeTangentAndBitangent computes tangent and bitangent for two triangles', function() {
        var geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    values: [0, 0, 0, 1, 0, 1, 1, 1, 1, 2, 0, 0],
                    componentsPerAttribute: 3,
                    componentDatatype : ComponentDatatype.FLOAT
                }),
                st: new GeometryAttribute({
                    values: [0, 0, 1, 0, 1, 1, 0, 1],
                    componentsPerAttribute: 2,
                    componentDatatype : ComponentDatatype.FLOAT
                })
            },
            indices : [0, 1, 2, 1, 3, 2],
            primitiveType: PrimitiveType.TRIANGLES
        });

        geometry = GeometryPipeline.computeNormal(geometry);
        geometry = GeometryPipeline.computeTangentAndBitangent(geometry);
        expect(geometry.attributes.tangent.values).toEqualEpsilon([0.7071067811865475, 0, 0.7071067811865475,
                                                        0, 1, 0,
                                                        0, 1, 0,
                                                        -0.5773502691896258, 0.5773502691896258, 0.5773502691896258], CesiumMath.EPSILON7);
        expect(geometry.attributes.bitangent.values).toEqualEpsilon([0, 1, 0,
                                                        -1, 0, 0,
                                                        -1, 0, 0,
                                                        -0.4082482904638631, -0.8164965809277261, 0.4082482904638631], CesiumMath.EPSILON7);
    });

    it ('computeTangentAndBitangent computes tangent and bitangent for BoxGeometry', function() {
        var geometry = BoxGeometry.createGeometry(new BoxGeometry({
            vertexFormat : new VertexFormat({
                position : true,
                normal : true,
                st : true
            }),
            maximum : new Cartesian3(250000.0, 250000.0, 250000.0),
            minimum : new Cartesian3(-250000.0, -250000.0, -250000.0)
        }));
        geometry = GeometryPipeline.computeTangentAndBitangent(geometry);
        var actualTangents = geometry.attributes.tangent.values;
        var actualBitangents = geometry.attributes.bitangent.values;

        var expectedGeometry = BoxGeometry.createGeometry(new BoxGeometry({
            vertexFormat: VertexFormat.ALL,
            maximum : new Cartesian3(250000.0, 250000.0, 250000.0),
            minimum : new Cartesian3(-250000.0, -250000.0, -250000.0)
        }));
        var expectedTangents = expectedGeometry.attributes.tangent.values;
        var expectedBitangents = expectedGeometry.attributes.bitangent.values;

        expect(actualTangents.length).toEqual(expectedTangents.length);
        expect(actualBitangents.length).toEqual(expectedBitangents.length);

        for (var i = 0; i < actualTangents.length; i += 3) {
            var actual = Cartesian3.fromArray(actualTangents, i);
            var expected = Cartesian3.fromArray(expectedTangents, i);
            expect(actual).toEqualEpsilon(expected, CesiumMath.EPSILON1);

            actual = Cartesian3.fromArray(actualBitangents, i);
            expected = Cartesian3.fromArray(expectedBitangents, i);
            expect(actual).toEqualEpsilon(expected, CesiumMath.EPSILON1);
        }
    });

    it('compressVertices throws without geometry', function() {
        expect(function() {
            return GeometryPipeline.compressVertices();
        }).toThrowDeveloperError();
    });

    it('compressVertices on geometry without normals or texture coordinates does nothing', function() {
        var geometry = BoxGeometry.createGeometry(new BoxGeometry({
            vertexFormat : new VertexFormat({
                position : true
            }),
            maximum : new Cartesian3(250000.0, 250000.0, 250000.0),
            minimum : new Cartesian3(-250000.0, -250000.0, -250000.0)
        }));
        expect(geometry.attributes.normal).not.toBeDefined();
        geometry = GeometryPipeline.compressVertices(geometry);
        expect(geometry.attributes.normal).not.toBeDefined();
    });

    it('compressVertices compresses normals', function() {
        var geometry = BoxGeometry.createGeometry(new BoxGeometry({
            vertexFormat : new VertexFormat({
                position : true,
                normal : true
            }),
            maximum : new Cartesian3(250000.0, 250000.0, 250000.0),
            minimum : new Cartesian3(-250000.0, -250000.0, -250000.0)
        }));
        expect(geometry.attributes.normal).toBeDefined();
        var originalNormals = Array.prototype.slice.call(geometry.attributes.normal.values);

        geometry = GeometryPipeline.compressVertices(geometry);

        expect(geometry.attributes.compressedAttributes).toBeDefined();

        var normals = geometry.attributes.compressedAttributes.values;
        expect(normals.length).toEqual(originalNormals.length / 3);

        for (var i = 0; i < normals.length; ++i) {
            expect(AttributeCompression.octDecodeFloat(normals[i], new Cartesian3())).toEqualEpsilon(Cartesian3.fromArray(originalNormals, i * 3), CesiumMath.EPSILON2);
        }
    });

    it('compressVertices compresses texture coordinates', function() {
        var geometry = BoxGeometry.createGeometry(new BoxGeometry({
            vertexFormat : new VertexFormat({
                position : true,
                st : true
            }),
            maximum : new Cartesian3(250000.0, 250000.0, 250000.0),
            minimum : new Cartesian3(-250000.0, -250000.0, -250000.0)
        }));
        expect(geometry.attributes.st).toBeDefined();
        var originalST = Array.prototype.slice.call(geometry.attributes.st.values);

        geometry = GeometryPipeline.compressVertices(geometry);

        expect(geometry.attributes.st).not.toBeDefined();
        expect(geometry.attributes.compressedAttributes).toBeDefined();

        var st = geometry.attributes.compressedAttributes.values;
        expect(st.length).toEqual(originalST.length / 2);

        for (var i = 0; i < st.length; ++i) {
            var temp = st[i] / 4096.0;
            var stx = Math.floor(temp) / 4096.0;
            var sty = temp - Math.floor(temp);
            var texCoord = new Cartesian2(stx, sty);
            expect(texCoord).toEqualEpsilon(Cartesian2.fromArray(originalST, i * 2, new Cartesian2()), CesiumMath.EPSILON2);
        }
    });

    it('compressVertices packs compressed normals with texture coordinates', function() {
        var geometry = BoxGeometry.createGeometry(new BoxGeometry({
            vertexFormat : new VertexFormat({
                position : true,
                normal : true,
                st : true
            }),
            maximum : new Cartesian3(250000.0, 250000.0, 250000.0),
            minimum : new Cartesian3(-250000.0, -250000.0, -250000.0)
        }));
        expect(geometry.attributes.normal).toBeDefined();
        expect(geometry.attributes.st).toBeDefined();
        var originalNormals = Array.prototype.slice.call(geometry.attributes.normal.values);
        var originalST = Array.prototype.slice.call(geometry.attributes.st.values);

        geometry = GeometryPipeline.compressVertices(geometry);

        expect(geometry.attributes.normal).not.toBeDefined();
        expect(geometry.attributes.st).not.toBeDefined();
        expect(geometry.attributes.compressedAttributes).toBeDefined();

        var stNormal = geometry.attributes.compressedAttributes.values;
        expect(stNormal.length).toEqual(originalST.length);

        for (var i = 0; i < stNormal.length; i += 2) {
            expect(AttributeCompression.decompressTextureCoordinates(stNormal[i], new Cartesian2())).toEqualEpsilon(Cartesian2.fromArray(originalST, i, new Cartesian2()), CesiumMath.EPSILON2);
            expect(AttributeCompression.octDecodeFloat(stNormal[i + 1], new Cartesian3())).toEqualEpsilon(Cartesian3.fromArray(originalNormals, i / 2 * 3), CesiumMath.EPSILON2);
        }
    });

    it('compressVertices packs compressed tangents and bitangents', function() {
        var geometry = BoxGeometry.createGeometry(new BoxGeometry({
            vertexFormat : new VertexFormat({
                position : true,
                normal : true,
                tangent : true,
                bitangent : true
            }),
            maximum : new Cartesian3(250000.0, 250000.0, 250000.0),
            minimum : new Cartesian3(-250000.0, -250000.0, -250000.0)
        }));
        expect(geometry.attributes.normal).toBeDefined();
        expect(geometry.attributes.tangent).toBeDefined();
        expect(geometry.attributes.bitangent).toBeDefined();
        var originalNormals = Array.prototype.slice.call(geometry.attributes.normal.values);
        var originalTangents = Array.prototype.slice.call(geometry.attributes.tangent.values);
        var originalBitangents = Array.prototype.slice.call(geometry.attributes.bitangent.values);

        geometry = GeometryPipeline.compressVertices(geometry);

        expect(geometry.attributes.tangent).not.toBeDefined();
        expect(geometry.attributes.bitangent).not.toBeDefined();
        expect(geometry.attributes.compressedAttributes).toBeDefined();

        var compressedNormals = geometry.attributes.compressedAttributes.values;
        expect(compressedNormals.length).toEqual(originalNormals.length / 3 * 2);

        var normal = new Cartesian3();
        var tangent = new Cartesian3();
        var bitangent = new Cartesian3();

        for (var i = 0; i < compressedNormals.length; i += 2) {
            var compressed = Cartesian2.fromArray(compressedNormals, i, new Cartesian2());
            AttributeCompression.octUnpack(compressed, normal, tangent, bitangent);

            expect(normal).toEqualEpsilon(Cartesian3.fromArray(originalNormals, i / 2 * 3), CesiumMath.EPSILON2);
            expect(tangent).toEqualEpsilon(Cartesian3.fromArray(originalTangents, i / 2 * 3), CesiumMath.EPSILON2);
            expect(bitangent).toEqualEpsilon(Cartesian3.fromArray(originalBitangents, i / 2 * 3), CesiumMath.EPSILON2);
        }
    });

    it('splitLongitude does nothing for geometry not split by the IDL', function() {
        var instance = new GeometryInstance({
            geometry : PolygonGeometry.createGeometry(PolygonGeometry.fromPositions({
                positions : Cartesian3.fromDegreesArray([
                    -1.0, 1.0,
                    -1.0, -1.0,
                    1.0, -1.0,
                    1.0, 1.0
                ]),
                vertexFormat : VertexFormat.POSITION_ONLY,
                granularity : 2.0 * CesiumMath.RADIANS_PER_DEGREE
            }))
        });

        var splitInstance = GeometryPipeline.splitLongitude(instance);
        expect(splitInstance).toBe(instance);
    });

    it('splitLongitude provides indices for an un-indexed triangle list', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([
                                        0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0,
                                        8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.0, 0.0])
                    })
                },
                primitiveType : PrimitiveType.TRIANGLES
            })
        });

        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry.indices).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('splitLongitude returns unchanged geometry if indices are already defined for an un-indexed triangle list', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([
                                        0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0,
                                        8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.0, 0.0])
                    })
                },
                primitiveType : PrimitiveType.TRIANGLES,
                indices : new Uint16Array([0, 1, 2, 3, 4, 5])
            })
        });

        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry.indices).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('splitLongitude throws when primitive type is TRIANGLES and number of vertices is less than 3', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0])
                    })
                },
                primitiveType : PrimitiveType.TRIANGLES
            })
        });

        expect(function() {
            GeometryPipeline.splitLongitude(instance);
        }).toThrowDeveloperError();
    });

    it('splitLongitude throws when primitive type is TRIANGLES and number of vertices is not a multiple of 3', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([
                                        0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0,
                                        8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.0])
                    })
                },
                primitiveType : PrimitiveType.TRIANGLES
            })
        });

        expect(function() {
            GeometryPipeline.splitLongitude(instance);
        }).toThrowDeveloperError();
    });

    it('splitLongitude creates indexed triangles for a triangle fan', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 8.0, 7.0, 6.0])
                    })
                },
                primitiveType : PrimitiveType.TRIANGLE_FAN
            })
        });

        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry.primitiveType).toEqual(PrimitiveType.TRIANGLES);
        expect(instance.geometry.indices).toEqual([0, 1, 2, 2, 1, 3]);
    });

    it('splitLongitude throws when primitive type is TRIANGLE_FAN and number of vertices is less than 3', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0])
                    })
                },
                primitiveType : PrimitiveType.TRIANGLE_FAN
            })
        });

        expect(function() {
            GeometryPipeline.splitLongitude(instance);
        }).toThrowDeveloperError();
    });

    it('splitLongitude creates indexd triangles for triangle strips', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0,
                                                   8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.0, 0.0])
                    })
                },
                primitiveType : PrimitiveType.TRIANGLE_STRIP
            })
        });

        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry.primitiveType).toEqual(PrimitiveType.TRIANGLES);
        expect(instance.geometry.indices).toEqual([0, 1, 2, 0, 2, 3, 3, 2, 4, 3, 4, 5]);
    });

    it('splitLongitude throws when the primitive type is TRIANGLE_STRIP and number of vertices is less than 3', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0])
                    })
                },
                primitiveType : PrimitiveType.TRIANGLE_STRIP
            })
        });

        expect(function() {
            GeometryPipeline.splitLongitude(instance);
        }).toThrowDeveloperError();
    });

    it('splitLongitude creates indexed lines', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 8.0, 7.0, 6.0])
                    })
                },
                primitiveType : PrimitiveType.LINES
            })
        });

        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry.indices).toEqual([0, 1, 2, 3]);
    });

    it('splitLongitude returns lines unchanged if indices are provided', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 8.0, 7.0, 6.0])
                    })
                },
                primitiveType : PrimitiveType.LINES,
                indices : new Uint16Array([0, 1, 2, 3])
            })
        });

        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry.indices).toEqual([0, 1, 2, 3]);
    });

    it('splitLongitude throws when primitive type is LINES and number of vertices is less than 2', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0])
                    })
                },
                primitiveType : PrimitiveType.LINES
            })
        });

        expect(function() {
            GeometryPipeline.splitLongitude(instance);
        }).toThrowDeveloperError();
    });

    it('splitLongitude throws when primitive type is LINES and number of vertices is not a multiple 2', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0])
                    })
                },
                primitiveType : PrimitiveType.LINES
            })
        });

        expect(function() {
            GeometryPipeline.splitLongitude(instance);
        }).toThrowDeveloperError();
    });

    it('splitLongitude creates indexed lines from line strip', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 8.0, 7.0, 6.0])
                    })
                },
                primitiveType : PrimitiveType.LINE_STRIP
            })
        });

        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry.primitiveType).toEqual(PrimitiveType.LINES);
        expect(instance.geometry.indices).toEqual([0, 1, 1, 2, 2, 3]);
    });

    it('splitLongitude throws when primitive type is LINE_STRIP and number of vertices is less than 2', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0])
                    })
                },
                primitiveType : PrimitiveType.LINE_STRIP
            })
        });

        expect(function() {
            GeometryPipeline.splitLongitude(instance);
        }).toThrowDeveloperError();
    });

    it('splitLongitude creates indexed lines from line loops', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 8.0, 7.0, 6.0])
                    })
                },
                primitiveType : PrimitiveType.LINE_LOOP
            })
        });

        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry.primitiveType).toEqual(PrimitiveType.LINES);
        expect(instance.geometry.indices).toEqual([0, 1, 1, 2, 2, 3, 3, 0]);
    });

    it('splitLongitude throws when the primitive type is LINE_LOOP and number of vertices is less than 2', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([0.0, 1.0, 2.0])
                    })
                },
                primitiveType : PrimitiveType.LINE_LOOP
            })
        });

        expect(function() {
            GeometryPipeline.splitLongitude(instance);
        }).toThrowDeveloperError();
    });

    it('splitLongitude subdivides triangle crossing the international date line, p0 behind', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, -1.0, 0.0, -1.0, 1.0, 2.0, -1.0, 2.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry).not.toBeDefined();

        expect(instance.westHemisphereGeometry).toBeDefined();
        expect(instance.westHemisphereGeometry.indices).toBeDefined();
        expect(instance.westHemisphereGeometry.indices.length).toEqual(3);
        expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(3 * 3);

        expect(instance.eastHemisphereGeometry).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices.length).toEqual(6);
        expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(5 * 3);
    });

    it('splitLongitude subdivides triangle crossing the international date line, p1 behind', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, 1.0, 2.0, -1.0, -1.0, 0.0, -1.0, 2.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry).not.toBeDefined();

        expect(instance.westHemisphereGeometry).toBeDefined();
        expect(instance.westHemisphereGeometry.indices).toBeDefined();
        expect(instance.westHemisphereGeometry.indices.length).toEqual(3);
        expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(3 * 3);

        expect(instance.eastHemisphereGeometry).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices.length).toEqual(6);
        expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(5 * 3);
    });

    it('splitLongitude subdivides triangle crossing the international date line, p2 behind', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, 1.0, 2.0, -1.0, 2.0, 2.0, -1.0, -1.0, 0.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry).not.toBeDefined();

        expect(instance.westHemisphereGeometry).toBeDefined();
        expect(instance.westHemisphereGeometry.indices).toBeDefined();
        expect(instance.westHemisphereGeometry.indices.length).toEqual(3);
        expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(3 * 3);

        expect(instance.eastHemisphereGeometry).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices.length).toEqual(6);
        expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(5 * 3);
    });

    it('splitLongitude subdivides triangle crossing the international date line, p0 ahead', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, 1.0, 0.0, -1.0, -1.0, 0.0, -2.0, -1.0, 0.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry).not.toBeDefined();

        expect(instance.westHemisphereGeometry).toBeDefined();
        expect(instance.westHemisphereGeometry.indices).toBeDefined();
        expect(instance.westHemisphereGeometry.indices.length).toEqual(6);
        expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(5 * 3);

        expect(instance.eastHemisphereGeometry).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices.length).toEqual(3);
        expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(3 * 3);
    });

    it('splitLongitude subdivides triangle crossing the international date line, p1 ahead', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-2.0, -1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry).not.toBeDefined();

        expect(instance.westHemisphereGeometry).toBeDefined();
        expect(instance.westHemisphereGeometry.indices).toBeDefined();
        expect(instance.westHemisphereGeometry.indices.length).toEqual(6);
        expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(5 * 3);

        expect(instance.eastHemisphereGeometry).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices.length).toEqual(3);
        expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(3 * 3);
    });

    it('splitLongitude subdivides triangle crossing the international date line, p2 ahead', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, -1.0, 0.0, -2.0, -1.0, 0.0, -1.0, 1.0, 0.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry).not.toBeDefined();

        expect(instance.westHemisphereGeometry).toBeDefined();
        expect(instance.westHemisphereGeometry.indices).toBeDefined();
        expect(instance.westHemisphereGeometry.indices.length).toEqual(6);
        expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(5 * 3);

        expect(instance.eastHemisphereGeometry).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices.length).toEqual(3);
        expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(3 * 3);
    });

    it('splitLongitude returns offset triangle that touches the international date line', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, 0.0, 1.0, -1.0, CesiumMath.EPSILON14, 2.0, -2.0, 2.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        var geometry = instance.geometry;

        expect(geometry.indices).toEqual([0, 1, 2]);

        var positions = geometry.attributes.position.values;
        expect(positions).toEqual([-1.0, CesiumMath.EPSILON6, 1.0, -1.0, CesiumMath.EPSILON6, 2.0, -2.0, 2.0, 2.0]);
        expect(positions.length).toEqual(3 * 3);
    });

    it('splitLongitude returns the same points if the triangle doesn\'t cross the international date line, behind', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, -1.0, 1.0, -1.0, -2.0, 1.0, -1.0, -2.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        var geometry = instance.geometry;

        expect(geometry.indices).toEqual([0, 1, 2]);

        var positions = geometry.attributes.position.values;
        expect(positions).toEqual([-1.0, -1.0, 1.0, -1.0, -2.0, 1.0, -1.0, -2.0, 2.0]);
        expect(positions.length).toEqual(3 * 3);
    });

    it('splitLongitude returns the same points if the triangle doesn\'t cross the international date line, ahead', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, 1.0, 1.0, -1.0, 2.0, 1.0, -1.0, 2.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        var geometry = instance.geometry;

        expect(geometry.indices).toEqual([0, 1, 2]);

        var positions = geometry.attributes.position.values;
        expect(positions).toEqual([-1.0, 1.0, 1.0, -1.0, 2.0, 1.0, -1.0, 2.0, 2.0]);
        expect(positions.length).toEqual(3 * 3);
    });

    it('splitLongitude returns the same points if the triangle doesn\'t cross the international date line, positive x', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 2.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1, 2]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        var geometry = instance.geometry;

        expect(geometry.indices).toEqual([0, 1, 2]);

        var positions = geometry.attributes.position.values;
        expect(positions).toEqual([1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 2.0, 2.0]);
        expect(positions.length).toEqual(3 * 3);
    });

    it('splitLongitude computes all attributes for a triangle crossing the international date line', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-2.0, -1.0, 0.0, -3.0, 1.0, 0.0, -1.0, 1.0, 0.0])
                    }),
                    normal : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0])
                    }),
                    tangent : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : new Float32Array([-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0])
                    }),
                    bitangent : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 3,
                        values : new Float32Array([0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0])
                    }),
                    st : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.FLOAT,
                        componentsPerAttribute : 2,
                        values : new Float32Array([0.0, 0.0, 1.0, 0.0, 0.5, 0.5])
                    })
                },
                indices : new Uint16Array([1, 2, 0]),
                primitiveType : PrimitiveType.TRIANGLES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry).not.toBeDefined();

        expect(instance.westHemisphereGeometry).toBeDefined();
        expect(instance.westHemisphereGeometry.indices).toBeDefined();
        expect(instance.westHemisphereGeometry.indices.length).toEqual(3);
        expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(3 * 3);
        expect(instance.westHemisphereGeometry.attributes.normal).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.normal.values.length).toEqual(3 * 3);
        expect(instance.westHemisphereGeometry.attributes.bitangent).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.bitangent.values.length).toEqual(3 * 3);
        expect(instance.westHemisphereGeometry.attributes.tangent).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.tangent.values.length).toEqual(3 * 3);
        expect(instance.westHemisphereGeometry.attributes.st).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.st.values.length).toEqual(3 * 2);

        expect(instance.eastHemisphereGeometry).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices.length).toEqual(6);
        expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(5 * 3);
        expect(instance.eastHemisphereGeometry.attributes.normal).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.normal.values.length).toEqual(5 * 3);
        expect(instance.eastHemisphereGeometry.attributes.bitangent).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.bitangent.values.length).toEqual(5 * 3);
        expect(instance.eastHemisphereGeometry.attributes.tangent).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.tangent.values.length).toEqual(5 * 3);
        expect(instance.eastHemisphereGeometry.attributes.st).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.st.values.length).toEqual(5 * 2);
    });

    it('splitLongitude subdivides line crossing the international date line', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, -1.0, 0.0, -1.0, 1.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1]),
                primitiveType : PrimitiveType.LINES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        expect(instance.geometry).not.toBeDefined();

        expect(instance.westHemisphereGeometry).toBeDefined();
        expect(instance.westHemisphereGeometry.indices).toBeDefined();
        expect(instance.westHemisphereGeometry.indices.length).toEqual(2);
        expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(2 * 3);

        expect(instance.eastHemisphereGeometry).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices).toBeDefined();
        expect(instance.eastHemisphereGeometry.indices.length).toEqual(2);
        expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
        expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(2 * 3);
    });

    it('splitLongitude returns offset line that touches the international date line', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([-1.0, 0.0, 0.0, -1.0, 1.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1]),
                primitiveType : PrimitiveType.LINES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        var geometry = instance.geometry;

        expect(geometry.indices).toEqual([0, 1]);

        var positions = geometry.attributes.position.values;
        expect(positions).toEqual([-1.0, CesiumMath.EPSILON6, 0.0, -1.0, 1.0, 2.0]);
    });

    it('splitLongitude returns the same points if the line doesn\'t cross the international date line', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([1.0, 1.0, 0.0, 1.0, 1.0, 2.0])
                    })
                },
                indices : new Uint16Array([0, 1]),
                primitiveType : PrimitiveType.LINES
            })
        });
        GeometryPipeline.splitLongitude(instance);
        var geometry = instance.geometry;

        expect(geometry.indices).toEqual([0, 1]);

        var positions = geometry.attributes.position.values;
        expect(positions).toEqual([1.0, 1.0, 0.0, 1.0, 1.0, 2.0]);
    });

    it('splitLongitude does nothing for points', function() {
        var instance = new GeometryInstance({
            geometry : new Geometry({
                attributes : {
                    position : new GeometryAttribute({
                        componentDatatype : ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : new Float64Array([1.0, 1.0, 0.0, 1.0, 1.0, 2.0])
                    })
                },
                primitiveType : PrimitiveType.POINTS
            })
        });
        GeometryPipeline.splitLongitude(instance);
        var geometry = instance.geometry;

        expect(geometry.indices).not.toBeDefined();

        var positions = geometry.attributes.position.values;
        expect(positions).toEqual([1.0, 1.0, 0.0, 1.0, 1.0, 2.0]);
    });

    describe('splitLongitude polylines', function() {
        it('subdivides wide line crossing the international date line', function() {
            var instance = new GeometryInstance({
                geometry : new Geometry({
                    attributes : {
                        position : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, -1.0, 0.0, -1.0, -1.0, 0.0, -1.0, 1.0, 2.0, -1.0, 1.0, 2.0])
                        }),
                        nextPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 1.0, 2.0, -1.0, 1.0, 2.0, -1.0, 2.0, 3.0, -1.0, 2.0, 3.0])
                        }),
                        prevPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, -2.0, -1.0, -1.0, -2.0, -1.0, -1.0, -1.0, 0.0, -1.0, -1.0, 0.0])
                        }),
                        expandAndWidth : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.FLOAT,
                            componentsPerAttribute : 2,
                            values : new Float32Array([-1.0, 5.0, 1.0, 5.0, -1.0, -5.0, 1.0, -5.0])
                        })
                    },
                    indices : new Uint16Array([0, 2, 1, 1, 2, 3]),
                    primitiveType : PrimitiveType.TRIANGLES,
                    geometryType : GeometryType.POLYLINES
                })
            });
            GeometryPipeline.splitLongitude(instance);
            expect(instance.geometry).not.toBeDefined();

            expect(instance.westHemisphereGeometry).toBeDefined();
            expect(instance.westHemisphereGeometry.indices).toBeDefined();
            expect(instance.westHemisphereGeometry.indices.length).toEqual(6);
            expect(instance.westHemisphereGeometry.attributes.position).toBeDefined();
            expect(instance.westHemisphereGeometry.attributes.position.values.length).toEqual(4 * 3);
            expect(instance.westHemisphereGeometry.attributes.nextPosition).toBeDefined();
            expect(instance.westHemisphereGeometry.attributes.nextPosition.values.length).toEqual(4 * 3);
            expect(instance.westHemisphereGeometry.attributes.prevPosition).toBeDefined();
            expect(instance.westHemisphereGeometry.attributes.prevPosition.values.length).toEqual(4 * 3);
            expect(instance.westHemisphereGeometry.attributes.expandAndWidth).toBeDefined();
            expect(instance.westHemisphereGeometry.attributes.expandAndWidth.values.length).toEqual(4 * 2);

            expect(instance.eastHemisphereGeometry).toBeDefined();
            expect(instance.eastHemisphereGeometry.indices).toBeDefined();
            expect(instance.eastHemisphereGeometry.indices.length).toEqual(6);
            expect(instance.eastHemisphereGeometry.attributes.position).toBeDefined();
            expect(instance.eastHemisphereGeometry.attributes.position.values.length).toEqual(4 * 3);
            expect(instance.eastHemisphereGeometry.attributes.nextPosition).toBeDefined();
            expect(instance.eastHemisphereGeometry.attributes.nextPosition.values.length).toEqual(4 * 3);
            expect(instance.eastHemisphereGeometry.attributes.prevPosition).toBeDefined();
            expect(instance.eastHemisphereGeometry.attributes.prevPosition.values.length).toEqual(4 * 3);
            expect(instance.eastHemisphereGeometry.attributes.expandAndWidth).toBeDefined();
            expect(instance.eastHemisphereGeometry.attributes.expandAndWidth.values.length).toEqual(4 * 2);
        });

        it('returns offset wide line with first point on the IDL and the second is east', function() {
            var instance = new GeometryInstance({
                geometry : new Geometry({
                    attributes : {
                        position : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 1.0, 2.0, -1.0, 1.0, 2.0])
                        }),
                        nextPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 1.0, 2.0, -1.0, 1.0, 2.0, -1.0, 2.0, 3.0, -1.0, 2.0, 3.0])
                        }),
                        prevPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, -2.0, -1.0, -1.0, -2.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0])
                        }),
                        expandAndWidth : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.FLOAT,
                            componentsPerAttribute : 2,
                            values : new Float32Array([-1.0, 5.0, 1.0, 5.0, -1.0, -5.0, 1.0, -5.0])
                        })
                    },
                    indices : new Uint16Array([0, 2, 1, 1, 2, 3]),
                    primitiveType : PrimitiveType.TRIANGLES,
                    geometryType : GeometryType.POLYLINES
                })
            });
            GeometryPipeline.splitLongitude(instance);
            var geometry = instance.geometry;

            expect(geometry.indices).toEqual([0, 2, 1, 1, 2, 3]);

            var positions = geometry.attributes.position.values;
            var nextPositions = geometry.attributes.nextPosition.values;
            var prevPositions = geometry.attributes.prevPosition.values;

            expect(positions).toEqual([-1.0, CesiumMath.EPSILON6, 0.0, -1.0, CesiumMath.EPSILON6, 0.0, -1.0, 1.0, 2.0, -1.0, 1.0, 2.0]);
            expect(prevPositions).toEqual([-1.0, CesiumMath.EPSILON6, 0.0, -1.0, CesiumMath.EPSILON6, 0.0, -1.0, CesiumMath.EPSILON6, 0.0, -1.0, CesiumMath.EPSILON6, 0.0]);
            expect(nextPositions).toEqual([-1.0, 1.0, 2.0, -1.0, 1.0, 2.0, -1.0, 2.0, 3.0, -1.0, 2.0, 3.0]);
        });

        it('returns offset wide line with first point on the IDL and the second is west', function() {
            var instance = new GeometryInstance({
                geometry : new Geometry({
                    attributes : {
                        position : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0])
                        }),
                        nextPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, -1.0, 2.0, -1.0, -1.0, 2.0, -1.0, -2.0, 0.0, -1.0, -2.0, 0.0])
                        }),
                        prevPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0])
                        }),
                        expandAndWidth : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.FLOAT,
                            componentsPerAttribute : 2,
                            values : new Float32Array([-1.0, 5.0, 1.0, 5.0, -1.0, -5.0, 1.0, -5.0])
                        })
                    },
                    indices : new Uint16Array([0, 2, 1, 1, 2, 3]),
                    primitiveType : PrimitiveType.TRIANGLES,
                    geometryType : GeometryType.POLYLINES
                })
            });
            GeometryPipeline.splitLongitude(instance);
            var geometry = instance.geometry;

            expect(geometry.indices).toEqual([0, 2, 1, 1, 2, 3]);

            var positions = geometry.attributes.position.values;
            var nextPositions = geometry.attributes.nextPosition.values;
            var prevPositions = geometry.attributes.prevPosition.values;

            expect(positions).toEqual([-1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0]);
            expect(prevPositions).toEqual([-1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -CesiumMath.EPSILON6, 0.0]);
            expect(nextPositions).toEqual([-1.0, -1.0, 2.0, -1.0, -1.0, 2.0, -1.0, -2.0, 0.0, -1.0, -2.0, 0.0]);
        });

        it('returns offset wide line with first point is east and the second is on the IDL', function() {
            var instance = new GeometryInstance({
                geometry : new Geometry({
                    attributes : {
                        position : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 1.0, 2.0, -1.0, 1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0])
                        }),
                        nextPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0])
                        }),
                        prevPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-2.0, 2.0, 2.0, -1.0, 2.0, 2.0, -1.0, 1.0, 2.0, -1.0, 1.0, 2.0])
                        }),
                        expandAndWidth : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.FLOAT,
                            componentsPerAttribute : 2,
                            values : new Float32Array([-1.0, 5.0, 1.0, 5.0, -1.0, -5.0, 1.0, -5.0])
                        })
                    },
                    indices : new Uint16Array([0, 2, 1, 1, 2, 3]),
                    primitiveType : PrimitiveType.TRIANGLES,
                    geometryType : GeometryType.POLYLINES
                })
            });
            GeometryPipeline.splitLongitude(instance);
            var geometry = instance.geometry;

            expect(geometry.indices).toEqual([0, 2, 1, 1, 2, 3]);

            var positions = geometry.attributes.position.values;
            var nextPositions = geometry.attributes.nextPosition.values;
            var prevPositions = geometry.attributes.prevPosition.values;

            expect(positions).toEqual([-1.0, 1.0, 2.0, -1.0, 1.0, 2.0, -1.0, CesiumMath.EPSILON6, 0.0, -1.0, CesiumMath.EPSILON6, 0.0]);
            expect(nextPositions).toEqual([-1.0, CesiumMath.EPSILON6, 0.0, -1.0, CesiumMath.EPSILON6, 0.0, -1.0, CesiumMath.EPSILON6, 0.0, -1.0, CesiumMath.EPSILON6, 0.0]);
            expect(prevPositions).toEqual([-2.0, 2.0, 2.0, -1.0, 2.0, 2.0, -1.0, 1.0, 2.0, -1.0, 1.0, 2.0]);
        });

        it('returns offset wide line with first point is west and the second is on the IDL', function() {
            var instance = new GeometryInstance({
                geometry : new Geometry({
                    attributes : {
                        position : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, -1.0, 2.0, -1.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0])
                        }),
                        nextPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 1.0, 2.0, -1.0, 1.0, 2.0])
                        }),
                        prevPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-2.0, -2.0, 2.0, -1.0, -2.0, 2.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0])
                        }),
                        expandAndWidth : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.FLOAT,
                            componentsPerAttribute : 2,
                            values : new Float32Array([-1.0, 5.0, 1.0, 5.0, -1.0, -5.0, 1.0, -5.0])
                        })
                    },
                    indices : new Uint16Array([0, 2, 1, 1, 2, 3]),
                    primitiveType : PrimitiveType.TRIANGLES,
                    geometryType : GeometryType.POLYLINES
                })
            });
            GeometryPipeline.splitLongitude(instance);
            var geometry = instance.geometry;

            expect(geometry.indices).toEqual([0, 2, 1, 1, 2, 3]);

            var positions = geometry.attributes.position.values;
            var nextPositions = geometry.attributes.nextPosition.values;
            var prevPositions = geometry.attributes.prevPosition.values;

            expect(positions).toEqual([-1.0, -1.0, 2.0, -1.0, -1.0, 2.0, -1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -CesiumMath.EPSILON6, 0.0]);
            expect(nextPositions).toEqual([-1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -CesiumMath.EPSILON6, 0.0, -1.0, -CesiumMath.EPSILON6, 0.0]);
            expect(prevPositions).toEqual([-2.0, -2.0, 2.0, -1.0, -2.0, 2.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0]);
        });

        it('returns the same points if the wide line doesn\'t cross the international date line', function() {
            var instance = new GeometryInstance({
                geometry : new Geometry({
                    attributes : {
                        position : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, 1.0, 2.0, -1.0, 1.0, 2.0])
                        }),
                        nextPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, 1.0, 2.0, -1.0, 1.0, 2.0, -1.0, 2.0, 3.0, -1.0, 2.0, 3.0])
                        }),
                        prevPosition : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : new Float64Array([-1.0, -2.0, -1.0, -1.0, -2.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0])
                        }),
                        expandAndWidth : new GeometryAttribute({
                            componentDatatype : ComponentDatatype.FLOAT,
                            componentsPerAttribute : 2,
                            values : new Float32Array([-1.0, 5.0, 1.0, 5.0, -1.0, -5.0, 1.0, -5.0])
                        })
                    },
                    indices : new Uint16Array([0, 2, 1, 1, 2, 3]),
                    primitiveType : PrimitiveType.TRIANGLES,
                    geometryType : GeometryType.POLYLINES
                })
            });
            GeometryPipeline.splitLongitude(instance);
            var geometry = instance.geometry;

            expect(geometry.indices).toEqual([0, 2, 1, 1, 2, 3]);

            var positions = geometry.attributes.position.values;
            expect(positions).toEqual([-1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, 1.0, 2.0, -1.0, 1.0, 2.0]);
        });
    });

    it('splitLongitude throws when geometry is undefined', function() {
        expect(function() {
            return GeometryPipeline.splitLongitude();
        }).toThrowDeveloperError();
    });
});
