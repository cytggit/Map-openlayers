define([
        './Check',
        './defaultValue',
        './defined'
    ], function(
        Check,
        defaultValue,
        defined) {
    'use strict';

    /**
     * Fill an array or a portion of an array with a given value.
     *
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill the array with.
     * @param {Number} [start=0] The index to start filling at.
     * @param {Number} [end=array.length] The index to end stop at.
     *
     * @returns {Array} The resulting array.
     * @private
     */
    function arrayFill(array, value, start, end) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('array', array);
        Check.defined('value', value);
        if (defined(start)) {
            Check.typeOf.number('start', start);
        }
        if (defined(end)) {
            Check.typeOf.number('end', end);
        }
        //>>includeEnd('debug');

        if (typeof array.fill === 'function') {
            return array.fill(value, start, end);
        }

        var length = array.length >>> 0;
        var relativeStart = defaultValue(start, 0);
        // If negative, find wrap around position
        var k = (relativeStart < 0) ? Math.max(length + relativeStart, 0) : Math.min(relativeStart, length);
        var relativeEnd = defaultValue(end, length);
        // If negative, find wrap around position
        var final = (relativeEnd < 0) ? Math.max(length + relativeEnd, 0) : Math.min(relativeEnd, length);

        // Fill array accordingly
        while (k < final) {
            array[k] = value;
            k++;
        }
        return array;
    }

    return arrayFill;
});
