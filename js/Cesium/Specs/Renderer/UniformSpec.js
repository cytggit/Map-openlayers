defineSuite([
        'Core/Cartesian2',
        'Core/Cartesian3',
        'Core/Cartesian4',
        'Core/Color',
        'Core/Matrix2',
        'Core/Matrix3',
        'Core/Matrix4',
        'Specs/createContext'
    ], 'Renderer/Uniform', function(
        Cartesian2,
        Cartesian3,
        Cartesian4,
        Color,
        Matrix2,
        Matrix3,
        Matrix4,
        createContext) {
    'use strict';

    var context;

    beforeAll(function() {
        context = createContext();
    });

    afterAll(function() {
        context.destroyForSpecs();
    });

    it('sets float uniform', function() {
        var uniformMap = {
            u : function() {
                return 1.0;
            }
        };

        var fs =
            'uniform float u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == 1.0); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets vec2 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian2(0.25, 0.5);
            }
        };

        var fs =
            'uniform vec2 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == vec2(0.25, 0.5)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets vec3 uniform (Cartesian3)', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian3(0.25, 0.5, 0.75);
            }
        };

        var fs =
            'uniform vec3 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == vec3(0.25, 0.5, 0.75)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets vec3 uniform (Color)', function() {
        var uniformMap = {
            u : function() {
                return new Color(0.25, 0.5, 0.75);
            }
        };

        var fs =
            'uniform vec3 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == vec3(0.25, 0.5, 0.75)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets vec4 uniform (Cartesian4)', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian4(0.25, 0.5, 0.75, 1.0);
            }
        };

        var fs =
            'uniform vec4 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == vec4(0.25, 0.5, 0.75, 1.0)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets vec4 uniform (Color)', function() {
        var uniformMap = {
            u : function() {
                return new Color(0.25, 0.5, 0.75, 1.0);
            }
        };

        var fs =
            'uniform vec4 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == vec4(0.25, 0.5, 0.75, 1.0)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets int uniform', function() {
        var uniformMap = {
            u : function() {
                return 1;
            }
        };

        var fs =
            'uniform int u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == 1); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets ivec2 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian2(1, 2);
            }
        };

        var fs =
            'uniform ivec2 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == ivec2(1, 2)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets ivec3 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian3(1, 2, 3);
            }
        };

        var fs =
            'uniform ivec3 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == ivec3(1, 2, 3)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets ivec4 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian4(1, 2, 3, 4);
            }
        };

        var fs =
            'uniform ivec4 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == ivec4(1, 2, 3, 4)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets bool uniform', function() {
        var uniformMap = {
            u : function() {
                return true;
            }
        };

        var fs =
            'uniform bool u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets bvec2 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian2(true, false);
            }
        };

        var fs =
            'uniform bvec2 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == bvec2(true, false)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets bvec3 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian3(true, false, true);
            }
        };

        var fs =
            'uniform bvec3 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == bvec3(true, false, true)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets bvec4 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Cartesian4(true, false, true, false);
            }
        };

        var fs =
            'uniform bvec4 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(u == bvec4(true, false, true, false)); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets mat2 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Matrix2(
                    1.0, 2.0,
                    3.0, 4.0);
            }
        };

        var fs =
            'uniform mat2 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0].x == 1.0) && (u[1].x == 2.0) &&' +
            '    (u[0].y == 3.0) && (u[1].y == 4.0) ' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets mat3 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Matrix3(
                    1.0, 2.0, 3.0,
                    4.0, 5.0, 6.0,
                    7.0, 8.0, 9.0);
            }
        };

        var fs =
            'uniform mat3 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0].x == 1.0) && (u[1].x == 2.0) && (u[2].x == 3.0) &&' +
            '    (u[0].y == 4.0) && (u[1].y == 5.0) && (u[2].y == 6.0) &&' +
            '    (u[0].z == 7.0) && (u[1].z == 8.0) && (u[2].z == 9.0)' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets mat4 uniform', function() {
        var uniformMap = {
            u : function() {
                return new Matrix4(
                         1.0,  2.0,  3.0,  4.0,
                         5.0,  6.0,  7.0,  8.0,
                         9.0, 10.0, 11.0, 12.0,
                        13.0, 14.0, 15.0, 16.0);
            }
        };

        var fs =
            'uniform mat4 u;' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0].x == 1.0)  && (u[1].x == 2.0)  && (u[2].x == 3.0)  && (u[3].x == 4.0) &&' +
            '    (u[0].y == 5.0)  && (u[1].y == 6.0)  && (u[2].y == 7.0)  && (u[3].y == 8.0) &&' +
            '    (u[0].z == 9.0)  && (u[1].z == 10.0) && (u[2].z == 11.0) && (u[3].z == 12.0) &&' +
            '    (u[0].w == 13.0) && (u[1].w == 14.0) && (u[2].w == 15.0) && (u[3].w == 16.0)' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets a struct uniform', function() {
        var uniformMap = {
            'u.f' : function() {
                return 2.5;
            },
            'u.v' : function() {
                return new Cartesian4(0.25, 0.5, 0.75, 1.0);
            }
        };

        var fs =
            'uniform struct { float f; vec4 v; } u;' +
            'void main() { ' +
            '  gl_FragColor = vec4((u.f == 2.5)); ' +
            '}';

        // There appears to be a bug in Chrome on Windows (not in Firefox or IE, or Chrome on Mac).
        // The following fails since u.v is still (0.0, 0.0, 0.0, 0.0) even after the call to uniform4f.
        //
        // '  gl_FragColor = vec4((u.f == 2.5) && (u.v == vec4(0.25, 0.5, 0.75, 1.0))); '

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets float uniform array', function() {
        var uniformMap = {
            u : function() {
                return new Float32Array([0.25, 0.5]);
            },
            u2 : function() {
                return [1.25, 1.5];
            }
        };

        var fs =
            'uniform float u[2];' +
            'uniform float u2[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == 0.25) && (u[1] == 0.5) &&' +
            '    (u2[0] == 1.25) && (u2[1] == 1.5)' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets vec2 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian2(0.25, 0.5),
                    new Cartesian2(1.25, 1.5)
                ];
            }
        };

        var fs =
            'uniform vec2 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == vec2(0.25, 0.5)) &&' +
            '    (u[1] == vec2(1.25, 1.5))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets vec3 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian3(0.25, 0.5, 0.75),
                    new Cartesian3(1.25, 1.5, 1.75)
                ];
            }
        };

        var fs =
            'uniform vec3 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == vec3(0.25, 0.5, 0.75)) &&' +
            '    (u[1] == vec3(1.25, 1.5, 1.75))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets vec4 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian4(0.25, 0.5, 0.75, 1.0),
                    new Cartesian4(1.25, 1.5, 1.75, 2.0)
                ];
            }
        };

        var fs =
            'uniform vec4 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == vec4(0.25, 0.5, 0.75, 1.0)) &&' +
            '    (u[1] == vec4(1.25, 1.5, 1.75, 2.0))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets int uniform array', function() {
        var uniformMap = {
            u : function() {
                return new Int32Array([1, 2]);
            },
            u2 : function() {
                return [3, 4];
            }
        };

        var fs =
            'uniform int u[2];' +
            'uniform int u2[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == 1) && (u[1] == 2) &&' +
            '    (u2[0] == 3) && (u2[1] == 4)' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets ivec2 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian2(1, 2),
                    new Cartesian2(3, 4)
                ];
            }
        };

        var fs =
            'uniform ivec2 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == ivec2(1, 2)) &&' +
            '    (u[1] == ivec2(3, 4))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets ivec3 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian3(1, 2, 3),
                    new Cartesian3(4, 5, 6)
                ];
            }
        };

        var fs =
            'uniform ivec3 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == ivec3(1, 2, 3)) &&' +
            '    (u[1] == ivec3(4, 5, 6))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets ivec4 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian4(1, 2, 3, 4),
                    new Cartesian4(5, 6, 7, 8)
                ];
            }
        };

        var fs =
            'uniform ivec4 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == ivec4(1, 2, 3, 4)) &&' +
            '    (u[1] == ivec4(5, 6, 7, 8))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets bool uniform array', function() {
        var uniformMap = {
            u : function() {
                return new Int32Array([1, 0]);
            },
            u2 : function() {
                return [0, 1];
            }
        };

        var fs =
            'uniform bool u[2];' +
            'uniform bool u2[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    u[0] && !u[1] &&' +
            '    !u2[0] && u2[1]' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets bvec2 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian2(true, false),
                    new Cartesian2(false, true)
                ];
            }
        };

        var fs =
            'uniform bvec2 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == bvec2(true, false)) &&' +
            '    (u[1] == bvec2(false, true))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets bvec3 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian3(true, false, true),
                    new Cartesian3(false, true, false)
                ];
            }
        };

        var fs =
            'uniform bvec3 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == bvec3(true, false, true)) &&' +
            '    (u[1] == bvec3(false, true, false))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets bvec4 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Cartesian4(true, false, true, false),
                    new Cartesian4(false, true, false, true)
                ];
            }
        };

        var fs =
            'uniform bvec4 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    (u[0] == bvec4(true, false, true, false)) &&' +
            '    (u[1] == bvec4(false, true, false, true))' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets mat2 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Matrix2(
                        1.0, 2.0,
                        3.0, 4.0),
                    new Matrix2(
                        5.0, 6.0,
                        7.0, 8.0)
                ];
            }
        };

        var fs =
            'uniform mat2 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    ((u[0])[0].x == 1.0) && ((u[0])[1].x == 2.0) &&' +
            '    ((u[0])[0].y == 3.0) && ((u[0])[1].y == 4.0) &&' +

            '    ((u[1])[0].x == 5.0) && ((u[1])[1].x == 6.0) &&' +
            '    ((u[1])[0].y == 7.0) && ((u[1])[1].y == 8.0) ' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets mat3 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Matrix3(
                        1.0, 2.0, 3.0,
                        4.0, 5.0, 6.0,
                        7.0, 8.0, 9.0),
                    new Matrix3(
                        11.0, 12.0, 13.0,
                        14.0, 15.0, 16.0,
                        17.0, 18.0, 19.0)
                ];
            }
        };

        var fs =
            'uniform mat3 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    ((u[0])[0].x == 1.0) && ((u[0])[1].x == 2.0) && ((u[0])[2].x == 3.0) &&' +
            '    ((u[0])[0].y == 4.0) && ((u[0])[1].y == 5.0) && ((u[0])[2].y == 6.0) &&' +
            '    ((u[0])[0].z == 7.0) && ((u[0])[1].z == 8.0) && ((u[0])[2].z == 9.0) &&' +

            '    ((u[1])[0].x == 11.0) && ((u[1])[1].x == 12.0) && ((u[1])[2].x == 13.0) &&' +
            '    ((u[1])[0].y == 14.0) && ((u[1])[1].y == 15.0) && ((u[1])[2].y == 16.0) &&' +
            '    ((u[1])[0].z == 17.0) && ((u[1])[1].z == 18.0) && ((u[1])[2].z == 19.0)' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });

    it('sets mat4 uniform array', function() {
        var uniformMap = {
            u : function() {
                return [
                    new Matrix4(
                        1.0,  2.0,  3.0,  4.0,
                        5.0,  6.0,  7.0,  8.0,
                        9.0, 10.0, 11.0, 12.0,
                       13.0, 14.0, 15.0, 16.0),
                   new Matrix4(
                       11.0,  12.0,  13.0,  14.0,
                       15.0,  16.0,  17.0,  18.0,
                       19.0, 110.0, 111.0, 112.0,
                      113.0, 114.0, 115.0, 116.0)
                ];
            }
        };

        var fs =
            'uniform mat4 u[2];' +
            'void main() { ' +
            '  gl_FragColor = vec4(' +
            '    ((u[0])[0].x == 1.0)  && ((u[0])[1].x == 2.0)  && ((u[0])[2].x == 3.0)  && ((u[0])[3].x == 4.0) &&' +
            '    ((u[0])[0].y == 5.0)  && ((u[0])[1].y == 6.0)  && ((u[0])[2].y == 7.0)  && ((u[0])[3].y == 8.0) &&' +
            '    ((u[0])[0].z == 9.0)  && ((u[0])[1].z == 10.0) && ((u[0])[2].z == 11.0) && ((u[0])[3].z == 12.0) &&' +
            '    ((u[0])[0].w == 13.0) && ((u[0])[1].w == 14.0) && ((u[0])[2].w == 15.0) && ((u[0])[3].w == 16.0) &&' +

            '    ((u[1])[0].x == 11.0)  && ((u[1])[1].x == 12.0)  && ((u[1])[2].x == 13.0)  && ((u[1])[3].x == 14.0) &&' +
            '    ((u[1])[0].y == 15.0)  && ((u[1])[1].y == 16.0)  && ((u[1])[2].y == 17.0)  && ((u[1])[3].y == 18.0) &&' +
            '    ((u[1])[0].z == 19.0)  && ((u[1])[1].z == 110.0) && ((u[1])[2].z == 111.0) && ((u[1])[3].z == 112.0) &&' +
            '    ((u[1])[0].w == 113.0) && ((u[1])[1].w == 114.0) && ((u[1])[2].w == 115.0) && ((u[1])[3].w == 116.0)' +
            '  ); ' +
            '}';

        expect({
            context : context,
            fragmentShader : fs,
            uniformMap : uniformMap
        }).contextToRender();
    });
}, 'WebGL');
