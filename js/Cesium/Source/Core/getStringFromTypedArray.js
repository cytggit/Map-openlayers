define([
        './defaultValue',
        './defined',
        './DeveloperError',
        './RuntimeError'
    ], function(
        defaultValue,
        defined,
        DeveloperError,
        RuntimeError) {
    'use strict';

    /**
     * @private
     */
    function getStringFromTypedArray(uint8Array, byteOffset, byteLength) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(uint8Array)) {
            throw new DeveloperError('uint8Array is required.');
        }
        if (byteOffset < 0) {
            throw new DeveloperError('byteOffset cannot be negative.');
        }
        if (byteLength < 0) {
            throw new DeveloperError('byteLength cannot be negative.');
        }
        if ((byteOffset + byteLength) > uint8Array.byteLength) {
            throw new DeveloperError('sub-region exceeds array bounds.');
        }
        //>>includeEnd('debug');

        byteOffset = defaultValue(byteOffset, 0);
        byteLength = defaultValue(byteLength, uint8Array.byteLength - byteOffset);

        uint8Array = uint8Array.subarray(byteOffset, byteOffset + byteLength);

        return getStringFromTypedArray.decode(uint8Array);
    }

    // Exposed functions for testing
    getStringFromTypedArray.decodeWithTextDecoder = function(view) {
        var decoder = new TextDecoder('utf-8');
        return decoder.decode(view);
    };


    getStringFromTypedArray.decodeWithFromCharCode = function(view) {
        var result = '';
        var codePoints = utf8Handler(view);
        var length = codePoints.length;
        for (var i = 0; i < length; ++i) {
            var cp = codePoints[i];
            if (cp <= 0xFFFF) {
                result += String.fromCharCode(cp);
            } else {
                cp -= 0x10000;
                result += String.fromCharCode((cp >> 10) + 0xD800,
                    (cp & 0x3FF) + 0xDC00);
            }

        }
        return result;
    };

    function inRange(a, min, max) {
        return min <= a && a <= max;
    }

    // This code is inspired by public domain code found here: https://github.com/inexorabletash/text-encoding
    function utf8Handler(utfBytes) {
        var codePoint = 0;
        var bytesSeen = 0;
        var bytesNeeded = 0;
        var lowerBoundary = 0x80;
        var upperBoundary = 0xBF;

        var codePoints = [];
        var length = utfBytes.length;
        for (var i = 0; i < length; ++i) {
            var byte = utfBytes[i];

            // If bytesNeeded = 0, then we are starting a new character
            if (bytesNeeded === 0) {
                // 1 Byte Ascii character
                if (inRange(byte, 0x00, 0x7F)) {
                    // Return a code point whose value is byte.
                    codePoints.push(byte);
                    continue;
                }

                // 2 Byte character
                if (inRange(byte, 0xC2, 0xDF)) {
                    bytesNeeded = 1;
                    codePoint = byte & 0x1F;
                    continue;
                }

                // 3 Byte character
                if (inRange(byte, 0xE0, 0xEF)) {
                    // If byte is 0xE0, set utf-8 lower boundary to 0xA0.
                    if (byte === 0xE0) {
                        lowerBoundary = 0xA0;
                    }
                    // If byte is 0xED, set utf-8 upper boundary to 0x9F.
                    if (byte === 0xED) {
                        upperBoundary = 0x9F;
                    }

                    bytesNeeded = 2;
                    codePoint = byte & 0xF;
                    continue;
                }

                // 4 Byte character
                if (inRange(byte, 0xF0, 0xF4)) {
                    // If byte is 0xF0, set utf-8 lower boundary to 0x90.
                    if (byte === 0xF0) {
                        lowerBoundary = 0x90;
                    }
                    // If byte is 0xF4, set utf-8 upper boundary to 0x8F.
                    if (byte === 0xF4) {
                        upperBoundary = 0x8F;
                    }

                    bytesNeeded = 3;
                    codePoint = byte & 0x7;
                    continue;
                }

                throw new RuntimeError('String decoding failed.');
            }

            // Out of range, so ignore the first part(s) of the character and continue with this byte on its own
            if (!inRange(byte, lowerBoundary, upperBoundary)) {
                codePoint = bytesNeeded = bytesSeen = 0;
                lowerBoundary = 0x80;
                upperBoundary = 0xBF;
                --i;
                continue;
            }

            // Set appropriate boundaries, since we've now checked byte 2 of a potential longer character
            lowerBoundary = 0x80;
            upperBoundary = 0xBF;

            // Add byte to code point
            codePoint = (codePoint << 6) | (byte & 0x3F);

            // We have the correct number of bytes, so push and reset for next character
            ++bytesSeen;
            if (bytesSeen === bytesNeeded) {
                codePoints.push(codePoint);
                codePoint = bytesNeeded = bytesSeen = 0;
            }
        }

        return codePoints;
    }

    if (typeof TextDecoder !== 'undefined') {
        getStringFromTypedArray.decode = getStringFromTypedArray.decodeWithTextDecoder;
    } else {
        getStringFromTypedArray.decode = getStringFromTypedArray.decodeWithFromCharCode;
    }

    return getStringFromTypedArray;
});
