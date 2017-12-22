defineSuite([
        'Renderer/ShaderSource'
    ], function(
        ShaderSource) {
    'use strict';

    var mockContext = {
        webgl2 : false
    };

    it('combines #defines', function() {
        var source = new ShaderSource({
            defines : ['A', 'B', '']
        });

        var shaderText = source.createCombinedVertexShader(mockContext);
        expect(shaderText).toContain('#define A');
        expect(shaderText).toContain('#define B');
        expect(shaderText.match(/#define/g).length).toEqual(2);
    });

    it('combines sources', function() {
        var source = new ShaderSource({
            sources : ['void func() {}', 'void main() {}']
        });
        var shaderText = source.createCombinedVertexShader(mockContext);
        expect(shaderText).toContain('#line 0\nvoid func() {}');
        expect(shaderText).toContain('#line 0\nvoid main() {}');
    });

    it('combines #defines and sources', function() {
        var source = new ShaderSource({
            defines : ['A', 'B', ''],
            sources : ['void func() {}', 'void main() {}']
        });
        var shaderText = source.createCombinedVertexShader(mockContext);
        expect(shaderText).toContain('#define A');
        expect(shaderText).toContain('#define B');
        expect(shaderText.match(/#define/g).length).toEqual(2);
        expect(shaderText).toContain('#line 0\nvoid func() {}');
        expect(shaderText).toContain('#line 0\nvoid main() {}');
    });

    it('creates a pick shader with a uniform', function() {
        var source = new ShaderSource({
            sources : ['void main() { gl_FragColor = vec4(1.0); }'],
            pickColorQualifier : 'uniform'
        });
        var shaderText = source.createCombinedVertexShader(mockContext);
        expect(shaderText).toContain('uniform vec4 czm_pickColor;');
        expect(shaderText).toContain('gl_FragColor = czm_pickColor;');
    });

    it('creates a pick shader with a varying', function() {
        var source = new ShaderSource({
            sources : ['void main() { gl_FragColor = vec4(1.0); }'],
            pickColorQualifier : 'varying'
        });
        var shaderText = source.createCombinedVertexShader(mockContext);
        expect(shaderText).toContain('varying vec4 czm_pickColor;');
        expect(shaderText).toContain('gl_FragColor = czm_pickColor;');
    });

    it('throws with invalid qualifier', function() {
        expect(function() {
            return new ShaderSource({
                pickColorQualifier : 'const'
            });
        }).toThrowDeveloperError();
    });

    it('combines #version to shader', function() {
        var source = new ShaderSource({
            sources : ['#version 300 es\nvoid main() {gl_FragColor = vec4(1.0); }']
        });
        var shaderText = source.createCombinedVertexShader(mockContext);
        expect(shaderText).toStartWith('#version 300 es\n');
    });
});
