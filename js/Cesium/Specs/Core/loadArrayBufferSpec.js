defineSuite([
        'Core/loadArrayBuffer',
        'Core/Request',
        'Core/RequestErrorEvent',
        'Core/RequestScheduler'
    ], function(
        loadArrayBuffer,
        Request,
        RequestErrorEvent,
        RequestScheduler) {
    'use strict';

    var fakeXHR;

    beforeEach(function() {
        fakeXHR = jasmine.createSpyObj('XMLHttpRequest', ['send', 'open', 'setRequestHeader', 'abort', 'getAllResponseHeaders']);
        fakeXHR.simulateLoad = function(response) {
            fakeXHR.status = 200;
            fakeXHR.response = response;
            if (typeof fakeXHR.onload === 'function') {
                fakeXHR.onload();
            }
        };
        fakeXHR.simulateError = function() {
            fakeXHR.response = '';
            if (typeof fakeXHR.onerror === 'function') {
                fakeXHR.onerror();
            }
        };
        fakeXHR.simulateHttpError = function(statusCode, response) {
            fakeXHR.status = statusCode;
            fakeXHR.response = response;
            if (typeof fakeXHR.onload === 'function') {
                fakeXHR.onload();
            }
        };

        spyOn(window, 'XMLHttpRequest').and.returnValue(fakeXHR);
    });

    it('throws with no url', function() {
        expect(function() {
            loadArrayBuffer();
        }).toThrowDeveloperError();
    });

    it('creates and sends request without any custom headers', function() {
        var testUrl = 'http://example.invalid/testuri';
        loadArrayBuffer(testUrl);

        expect(fakeXHR.open).toHaveBeenCalledWith('GET', testUrl, true);
        expect(fakeXHR.setRequestHeader).not.toHaveBeenCalled();
        expect(fakeXHR.send).toHaveBeenCalled();
    });

    it('creates and sends request with custom headers', function() {
        var testUrl = 'http://example.invalid/testuri';
        loadArrayBuffer(testUrl, {
            'Accept' : 'application/json',
            'Cache-Control' : 'no-cache'
        });

        expect(fakeXHR.open).toHaveBeenCalledWith('GET', testUrl, true);
        expect(fakeXHR.setRequestHeader.calls.count()).toEqual(2);
        expect(fakeXHR.setRequestHeader).toHaveBeenCalledWith('Accept', 'application/json');
        expect(fakeXHR.setRequestHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
        expect(fakeXHR.send).toHaveBeenCalled();
    });

    it('returns a promise that resolves when the request loads', function() {
        var testUrl = 'http://example.invalid/testuri';
        var promise = loadArrayBuffer(testUrl);

        expect(promise).toBeDefined();

        var resolvedValue;
        var rejectedError;
        promise.then(function(value) {
            resolvedValue = value;
        }, function(error) {
            rejectedError = error;
        });

        expect(resolvedValue).toBeUndefined();
        expect(rejectedError).toBeUndefined();

        var response = 'some response';
        fakeXHR.simulateLoad(response);
        expect(resolvedValue).toEqual(response);
        expect(rejectedError).toBeUndefined();
    });

    it('returns a promise that rejects when the request errors', function() {
        var testUrl = 'http://example.invalid/testuri';
        var promise = loadArrayBuffer(testUrl);

        expect(promise).toBeDefined();

        var resolvedValue;
        var rejectedError;
        promise.then(function(value) {
            resolvedValue = value;
        }, function(error) {
            rejectedError = error;
        });

        expect(resolvedValue).toBeUndefined();
        expect(rejectedError).toBeUndefined();

        fakeXHR.simulateError();
        expect(resolvedValue).toBeUndefined();
        expect(rejectedError instanceof RequestErrorEvent).toBe(true);
        expect(rejectedError.statusCode).toBeUndefined();
        expect(rejectedError.response).toBeUndefined();
    });

    it('returns a promise that rejects when the request results in an HTTP error code', function() {
        var testUrl = 'http://example.invalid/testuri';
        var promise = loadArrayBuffer(testUrl);

        expect(promise).toBeDefined();

        var resolvedValue;
        var rejectedError;
        promise.then(function(value) {
            resolvedValue = value;
        }, function(error) {
            rejectedError = error;
        });

        expect(resolvedValue).toBeUndefined();
        expect(rejectedError).toBeUndefined();

        var error = 'some error';
        fakeXHR.simulateHttpError(404, error);
        expect(resolvedValue).toBeUndefined();
        expect(rejectedError instanceof RequestErrorEvent).toBe(true);
        expect(rejectedError.statusCode).toEqual(404);
        expect(rejectedError.response).toEqual(error);
    });

    it('returns undefined if the request is throttled', function() {
        var oldMaximumRequests = RequestScheduler.maximumRequests;
        RequestScheduler.maximumRequests = 0;

        var request = new Request({
            throttle : true
        });

        var testUrl = 'http://example.invalid/testuri';
        var promise = loadArrayBuffer(testUrl, undefined, request);
        expect(promise).toBeUndefined();

        RequestScheduler.maximumRequests = oldMaximumRequests;
    });
});
