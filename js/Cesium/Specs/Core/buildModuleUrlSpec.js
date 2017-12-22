defineSuite([
        'Core/buildModuleUrl',
        'Core/loadText',
        'ThirdParty/Uri'
    ], function(
        buildModuleUrl,
        loadText,
        Uri) {
    'use strict';

    it('produces an absolute URL for a module', function() {
        var url = buildModuleUrl('Workers/transferTypedArrayTest.js');

        expect(url).toMatch(/Workers\/transferTypedArrayTest.js$/);
        expect(new Uri(url).isAbsolute()).toBe(true);

        // make sure it actually exists at that URL
        return loadText(url);
    });

    it('matches the expected forms of URLs to Cesium.js', function() {
        var r = buildModuleUrl._cesiumScriptRegex;

        expect(r.exec('Cesium.js')[1]).toEqual('');
        expect(r.exec('assets/foo/Cesium-b16.js')[1]).toEqual('assets/foo/');
        expect(r.exec('assets/foo/Cesium.js')[1]).toEqual('assets/foo/');
        expect(r.exec('http://example.invalid/Cesium/assets/foo/Cesium.js')[1]).toEqual('http://example.invalid/Cesium/assets/foo/');

        expect(r.exec('assets/foo/bar.cesium.js')).toBeNull();
    });
});
