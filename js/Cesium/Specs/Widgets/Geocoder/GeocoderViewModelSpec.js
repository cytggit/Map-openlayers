defineSuite([
        'Widgets/Geocoder/GeocoderViewModel',
        'Core/Cartesian3',
        'Specs/createScene',
        'Specs/pollToPromise',
        'ThirdParty/when'
    ], function(
        GeocoderViewModel,
        Cartesian3,
        createScene,
        pollToPromise,
        when) {
    'use strict';

    var scene;
    var mockDestination = new Cartesian3(1.0, 2.0, 3.0);

    var geocoderResults1 = [{
        displayName: 'a',
        destination: mockDestination
    }, {
        displayName: 'b',
        destination: mockDestination
    }];
    var customGeocoderOptions = {
        autoComplete: true,
        geocode: function (input) {
            return when.resolve(geocoderResults1);
        }
    };

    var geocoderResults2 = [{
        displayName: '1',
        destination: mockDestination
    }, {
        displayName: '2',
        destination: mockDestination
    }];
    var customGeocoderOptions2 = {
        autoComplete: true,
        geocode: function (input) {
            return when.resolve(geocoderResults2);
        }
    };

    var noResultsGeocoder = {
        autoComplete: true,
        geocode: function (input) {
            return when.resolve([]);
        }
    };

    beforeAll(function() {
        scene = createScene();
    });

    afterAll(function() {
        scene.destroyForSpecs();
    });

    it('constructor sets expected properties', function() {
        var flightDuration = 1234;

        var viewModel = new GeocoderViewModel({
            scene : scene,
            flightDuration : flightDuration
        });

        expect(viewModel.scene).toBe(scene);
        expect(viewModel.flightDuration).toBe(flightDuration);
        expect(viewModel.keepExpanded).toBe(false);
    });

    it('can get and set flight duration', function() {
        var viewModel = new GeocoderViewModel({
            scene : scene
        });
        viewModel.flightDuration = 324;
        expect(viewModel.flightDuration).toEqual(324);

        expect(function() {
            viewModel.flightDuration = -123;
        }).toThrowDeveloperError();
    });

    it('throws is searchText is not a string', function() {
        var viewModel = new GeocoderViewModel({
            scene : scene,
            geocoderServices : [customGeocoderOptions]
        });
        expect(function() {
            viewModel.searchText = undefined;
        }).toThrowDeveloperError();
    });

    it('moves camera when search command invoked', function() {
        var viewModel = new GeocoderViewModel({
            scene : scene,
            geocoderServices : [customGeocoderOptions]
        });

        var cameraPosition = Cartesian3.clone(scene.camera.position);

        viewModel.searchText = '220 Valley Creek Blvd, Exton, PA';
        viewModel.search();

        return pollToPromise(function() {
            scene.tweens.update();
            return !Cartesian3.equals(cameraPosition, scene.camera.position);
        });
    });

    it('constructor throws without scene', function() {
        expect(function() {
            return new GeocoderViewModel();
        }).toThrowDeveloperError();
    });

    it('raises the complete event camera finished', function() {
        var viewModel = new GeocoderViewModel({
            scene : scene,
            flightDuration : 0,
            geocoderServices : [customGeocoderOptions]
        });

        var spyListener = jasmine.createSpy('listener');
        viewModel.complete.addEventListener(spyListener);

        viewModel.searchText = '-1.0, -2.0';
        viewModel.search();

        expect(spyListener.calls.count()).toBe(1);

        viewModel.flightDuration = 1.5;
        viewModel.searchText = '2.0, 2.0';
        viewModel.search();

        return pollToPromise(function() {
            scene.tweens.update();
            return spyListener.calls.count() === 2;
        });
    });

    it('can be created with a custom geocoder', function() {
        expect(function() {
            return new GeocoderViewModel({
                scene : scene,
                geocoderServices : [customGeocoderOptions]
            });
        }).not.toThrowDeveloperError();
    });

    it('automatic suggestions can be retrieved', function() {
        var geocoder = new GeocoderViewModel({
            scene : scene,
            geocoderServices : [customGeocoderOptions]
        });
        geocoder._searchText = 'some_text';
        geocoder._updateSearchSuggestions(geocoder);
        expect(geocoder._suggestions.length).toEqual(2);
    });

    it('update search suggestions results in empty list if the query is empty', function() {
        var geocoder = new GeocoderViewModel({
            scene : scene,
            geocoderServices : [customGeocoderOptions]
        });
        geocoder._searchText = '';
        spyOn(geocoder, '_adjustSuggestionsScroll');
        geocoder._updateSearchSuggestions(geocoder);
        expect(geocoder._suggestions.length).toEqual(0);
    });

    it('can activate selected search suggestion', function () {
        var geocoder = new GeocoderViewModel({
            scene : scene,
            geocoderServices : [customGeocoderOptions]
        });
        spyOn(geocoder, '_updateCamera');
        spyOn(geocoder, '_adjustSuggestionsScroll');

        var suggestion = {displayName: 'a', destination: {west: 0.0, east: 0.1, north: 0.1, south: -0.1}};
        geocoder._selectedSuggestion = suggestion;
        geocoder.activateSuggestion(suggestion);
        expect(geocoder._searchText).toEqual('a');
    });

    it('if more than one geocoder service is provided, use first result from first geocode in array order', function () {
        var geocoder = new GeocoderViewModel({
            scene : scene,
            geocoderServices : [noResultsGeocoder, customGeocoderOptions2]
        });
        geocoder._searchText = 'sthsnth'; // an empty query will prevent geocoding
        spyOn(geocoder, '_updateCamera');
        spyOn(geocoder, '_adjustSuggestionsScroll');
        geocoder.search();
        expect(geocoder._searchText).toEqual(geocoderResults2[0].displayName);
    });

    it('can update autoComplete suggestions list using multiple geocoders', function () {
        var geocoder = new GeocoderViewModel({
            scene : scene,
            geocoderServices : [customGeocoderOptions, customGeocoderOptions2]
        });
        geocoder._searchText = 'sthsnth'; // an empty query will prevent geocoding
        spyOn(geocoder, '_updateCamera');
        spyOn(geocoder, '_adjustSuggestionsScroll');
        geocoder._updateSearchSuggestions(geocoder);
        expect(geocoder._suggestions.length).toEqual(geocoderResults1.length + geocoderResults2.length);
    });

}, 'WebGL');
