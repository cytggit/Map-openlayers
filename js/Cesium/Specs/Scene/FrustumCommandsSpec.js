defineSuite([
        'Renderer/Pass',
        'Scene/FrustumCommands'
    ], function(
        Pass,
        FrustumCommands) {
    'use strict';

    it('constructs without arguments', function() {
        var frustum = new FrustumCommands();
        expect(frustum.near).toEqual(0.0);
        expect(frustum.far).toEqual(0.0);
        expect(frustum.commands).toBeDefined();
        expect(frustum.commands.length).toEqual(Pass.NUMBER_OF_PASSES);
        expect(frustum.indices).toBeDefined();
        expect(frustum.indices.length).toEqual(Pass.NUMBER_OF_PASSES);
    });

    it('constructs with arguments', function() {
        var near = 1.0;
        var far = 2.0;
        var frustum = new FrustumCommands(near, far);
        expect(frustum.near).toEqual(near);
        expect(frustum.far).toEqual(far);
        expect(frustum.commands).toBeDefined();
        expect(frustum.commands.length).toEqual(Pass.NUMBER_OF_PASSES);
        expect(frustum.indices).toBeDefined();
        expect(frustum.indices.length).toEqual(Pass.NUMBER_OF_PASSES);
    });
});
