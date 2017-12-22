defineSuite([
        'Core/loadImageViaBlob',
        'Core/Request',
        'Core/RequestScheduler',
        'ThirdParty/when'
    ], function(
        loadImageViaBlob,
        Request,
        RequestScheduler,
        when) {
    'use strict';

    var dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2Nk+M/wHwAEBgIA5agATwAAAABJRU5ErkJggg==';

    it('can load an image', function() {
        return loadImageViaBlob('./Data/Images/Green.png').then(function(loadedImage) {
            expect(loadedImage.width).toEqual(1);
            expect(loadedImage.height).toEqual(1);
        });
    });

    it('can load an image from a data URI', function() {
        return loadImageViaBlob(dataUri).then(function(loadedImage) {
            expect(loadedImage.width).toEqual(1);
            expect(loadedImage.height).toEqual(1);
        });
    });

    it('throws with if url is missing', function() {
        expect(function() {
            loadImageViaBlob();
        }).toThrowDeveloperError();
    });

    it('resolves the promise when the image loads', function() {
        var fakeImage = {};
        spyOn(window, 'Image').and.returnValue(fakeImage);

        var success = false;
        var failure = false;
        var loadedImage;

        when(loadImageViaBlob(dataUri), function(image) {
            success = true;
            loadedImage = image;
        }, function() {
            failure = true;
        });

        // neither callback has fired yet
        expect(success).toEqual(false);
        expect(failure).toEqual(false);

        fakeImage.onload();
        expect(success).toEqual(true);
        expect(failure).toEqual(false);
        expect(loadedImage).toBe(fakeImage);
    });

    it('rejects the promise when the image errors', function() {
        var fakeImage = {};
        spyOn(window, 'Image').and.returnValue(fakeImage);

        var success = false;
        var failure = false;
        var loadedImage;

        when(loadImageViaBlob(dataUri), function(image) {
            success = true;
            loadedImage = image;
        }, function() {
            failure = true;
        });

        // neither callback has fired yet
        expect(success).toEqual(false);
        expect(failure).toEqual(false);

        fakeImage.onerror();
        expect(success).toEqual(false);
        expect(failure).toEqual(true);
        expect(loadedImage).toBeUndefined();
    });

    it('returns undefined if the request is throttled', function() {
        var oldMaximumRequests = RequestScheduler.maximumRequests;
        RequestScheduler.maximumRequests = 0;

        var request = new Request({
            throttle : true
        });

        var testUrl = 'http://example.invalid/testuri';
        var promise = loadImageViaBlob(testUrl, request);
        expect(promise).toBeUndefined();

        RequestScheduler.maximumRequests = oldMaximumRequests;
    });
});
