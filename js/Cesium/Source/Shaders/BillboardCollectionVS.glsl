#ifdef INSTANCED
attribute vec2 direction;
#endif
attribute vec4 positionHighAndScale;
attribute vec4 positionLowAndRotation;
attribute vec4 compressedAttribute0;                       // pixel offset, translate, horizontal origin, vertical origin, show, direction, texture coordinates (texture offset)
attribute vec4 compressedAttribute1;                       // aligned axis, translucency by distance, image width
attribute vec4 compressedAttribute2;                       // image height, color, pick color, size in meters, valid aligned axis, 13 bits free
attribute vec4 eyeOffset;                                  // eye offset in meters, 4 bytes free (texture range)
attribute vec4 scaleByDistance;                            // near, nearScale, far, farScale
attribute vec4 pixelOffsetScaleByDistance;                 // near, nearScale, far, farScale
attribute vec3 distanceDisplayConditionAndDisableDepth;    // near, far, disableDepthTestDistance

varying vec2 v_textureCoordinates;

#ifdef RENDER_FOR_PICK
varying vec4 v_pickColor;
#else
varying vec4 v_color;
#endif

const float UPPER_BOUND = 32768.0;

const float SHIFT_LEFT16 = 65536.0;
const float SHIFT_LEFT8 = 256.0;
const float SHIFT_LEFT7 = 128.0;
const float SHIFT_LEFT5 = 32.0;
const float SHIFT_LEFT3 = 8.0;
const float SHIFT_LEFT2 = 4.0;
const float SHIFT_LEFT1 = 2.0;

const float SHIFT_RIGHT8 = 1.0 / 256.0;
const float SHIFT_RIGHT7 = 1.0 / 128.0;
const float SHIFT_RIGHT5 = 1.0 / 32.0;
const float SHIFT_RIGHT3 = 1.0 / 8.0;
const float SHIFT_RIGHT2 = 1.0 / 4.0;
const float SHIFT_RIGHT1 = 1.0 / 2.0;

vec4 computePositionWindowCoordinates(vec4 positionEC, vec2 imageSize, float scale, vec2 direction, vec2 origin, vec2 translate, vec2 pixelOffset, vec3 alignedAxis, bool validAlignedAxis, float rotation, bool sizeInMeters)
{
    // Note the halfSize cannot be computed in JavaScript because it is sent via
    // compressed vertex attributes that coerce it to an integer.
    vec2 halfSize = imageSize * scale * czm_resolutionScale * 0.5;
    halfSize *= ((direction * 2.0) - 1.0);

    vec2 originTranslate = origin * abs(halfSize);

#if defined(ROTATION) || defined(ALIGNED_AXIS)
    if (validAlignedAxis || rotation != 0.0)
    {
        float angle = rotation;
        if (validAlignedAxis)
        {
            vec4 projectedAlignedAxis = czm_modelViewProjection * vec4(alignedAxis, 0.0);
            angle += sign(-projectedAlignedAxis.x) * acos( sign(projectedAlignedAxis.y) * (projectedAlignedAxis.y * projectedAlignedAxis.y) /
                    (projectedAlignedAxis.x * projectedAlignedAxis.x + projectedAlignedAxis.y * projectedAlignedAxis.y) );
        }

        float cosTheta = cos(angle);
        float sinTheta = sin(angle);
        mat2 rotationMatrix = mat2(cosTheta, sinTheta, -sinTheta, cosTheta);
        halfSize = rotationMatrix * halfSize;
    }
#endif

    if (sizeInMeters)
    {
        positionEC.xy += halfSize;
    }

    vec4 positionWC = czm_eyeToWindowCoordinates(positionEC);

    if (sizeInMeters)
    {
        originTranslate /= czm_metersPerPixel(positionEC);
    }

    positionWC.xy += originTranslate;
    if (!sizeInMeters)
    {
        positionWC.xy += halfSize;
    }

    positionWC.xy += translate;
    positionWC.xy += (pixelOffset * czm_resolutionScale);

    return positionWC;
}

void main()
{
    // Modifying this shader may also require modifications to Billboard._computeScreenSpacePosition

    // unpack attributes
    vec3 positionHigh = positionHighAndScale.xyz;
    vec3 positionLow = positionLowAndRotation.xyz;
    float scale = positionHighAndScale.w;

#if defined(ROTATION) || defined(ALIGNED_AXIS)
    float rotation = positionLowAndRotation.w;
#else
    float rotation = 0.0;
#endif

    float compressed = compressedAttribute0.x;

    vec2 pixelOffset;
    pixelOffset.x = floor(compressed * SHIFT_RIGHT7);
    compressed -= pixelOffset.x * SHIFT_LEFT7;
    pixelOffset.x -= UPPER_BOUND;

    vec2 origin;
    origin.x = floor(compressed * SHIFT_RIGHT5);
    compressed -= origin.x * SHIFT_LEFT5;

    origin.y = floor(compressed * SHIFT_RIGHT3);
    compressed -= origin.y * SHIFT_LEFT3;

    origin -= vec2(1.0);

    float show = floor(compressed * SHIFT_RIGHT2);
    compressed -= show * SHIFT_LEFT2;

#ifdef INSTANCED
    vec2 textureCoordinatesBottomLeft = czm_decompressTextureCoordinates(compressedAttribute0.w);
    vec2 textureCoordinatesRange = czm_decompressTextureCoordinates(eyeOffset.w);
    vec2 textureCoordinates = textureCoordinatesBottomLeft + direction * textureCoordinatesRange;
#else
    vec2 direction;
    direction.x = floor(compressed * SHIFT_RIGHT1);
    direction.y = compressed - direction.x * SHIFT_LEFT1;

    vec2 textureCoordinates = czm_decompressTextureCoordinates(compressedAttribute0.w);
#endif

    float temp = compressedAttribute0.y  * SHIFT_RIGHT8;
    pixelOffset.y = -(floor(temp) - UPPER_BOUND);

    vec2 translate;
    translate.y = (temp - floor(temp)) * SHIFT_LEFT16;

    temp = compressedAttribute0.z * SHIFT_RIGHT8;
    translate.x = floor(temp) - UPPER_BOUND;

    translate.y += (temp - floor(temp)) * SHIFT_LEFT8;
    translate.y -= UPPER_BOUND;

    temp = compressedAttribute1.x * SHIFT_RIGHT8;

    vec2 imageSize = vec2(floor(temp), compressedAttribute2.w);

#ifdef EYE_DISTANCE_TRANSLUCENCY
    vec4 translucencyByDistance;
    translucencyByDistance.x = compressedAttribute1.z;
    translucencyByDistance.z = compressedAttribute1.w;

    translucencyByDistance.y = ((temp - floor(temp)) * SHIFT_LEFT8) / 255.0;

    temp = compressedAttribute1.y * SHIFT_RIGHT8;
    translucencyByDistance.w = ((temp - floor(temp)) * SHIFT_LEFT8) / 255.0;
#endif

#ifdef ALIGNED_AXIS
    vec3 alignedAxis = czm_octDecode(floor(compressedAttribute1.y * SHIFT_RIGHT8));
    temp = compressedAttribute2.z * SHIFT_RIGHT5;
    bool validAlignedAxis = (temp - floor(temp)) * SHIFT_LEFT1 > 0.0;
#else
    vec3 alignedAxis = vec3(0.0);
    bool validAlignedAxis = false;
#endif

#ifdef RENDER_FOR_PICK
    temp = compressedAttribute2.y;
#else
    temp = compressedAttribute2.x;
#endif

    vec4 color;
    temp = temp * SHIFT_RIGHT8;
    color.b = (temp - floor(temp)) * SHIFT_LEFT8;
    temp = floor(temp) * SHIFT_RIGHT8;
    color.g = (temp - floor(temp)) * SHIFT_LEFT8;
    color.r = floor(temp);

    temp = compressedAttribute2.z * SHIFT_RIGHT8;
    bool sizeInMeters = floor((temp - floor(temp)) * SHIFT_LEFT7) > 0.0;
    temp = floor(temp) * SHIFT_RIGHT8;

#ifdef RENDER_FOR_PICK
    color.a = (temp - floor(temp)) * SHIFT_LEFT8;
    vec4 pickColor = color / 255.0;
#else
    color.a = floor(temp);
    color /= 255.0;
#endif

    ///////////////////////////////////////////////////////////////////////////

    vec4 p = czm_translateRelativeToEye(positionHigh, positionLow);
    vec4 positionEC = czm_modelViewRelativeToEye * p;
    positionEC = czm_eyeOffset(positionEC, eyeOffset.xyz);
    positionEC.xyz *= show;

    ///////////////////////////////////////////////////////////////////////////

#if defined(EYE_DISTANCE_SCALING) || defined(EYE_DISTANCE_TRANSLUCENCY) || defined(EYE_DISTANCE_PIXEL_OFFSET) || defined(DISTANCE_DISPLAY_CONDITION) || defined(DISABLE_DEPTH_DISTANCE)
    float lengthSq;
    if (czm_sceneMode == czm_sceneMode2D)
    {
        // 2D camera distance is a special case
        // treat all billboards as flattened to the z=0.0 plane
        lengthSq = czm_eyeHeight2D.y;
    }
    else
    {
        lengthSq = dot(positionEC.xyz, positionEC.xyz);
    }
#endif

#ifdef EYE_DISTANCE_SCALING
    float distanceScale = czm_nearFarScalar(scaleByDistance, lengthSq);
    scale *= distanceScale;
    translate *= distanceScale;
    // push vertex behind near plane for clipping
    if (scale == 0.0)
    {
        positionEC.xyz = vec3(0.0);
    }
#endif

    float translucency = 1.0;
#ifdef EYE_DISTANCE_TRANSLUCENCY
    translucency = czm_nearFarScalar(translucencyByDistance, lengthSq);
    // push vertex behind near plane for clipping
    if (translucency == 0.0)
    {
        positionEC.xyz = vec3(0.0);
    }
#endif

#ifdef EYE_DISTANCE_PIXEL_OFFSET
    float pixelOffsetScale = czm_nearFarScalar(pixelOffsetScaleByDistance, lengthSq);
    pixelOffset *= pixelOffsetScale;
#endif

#ifdef DISTANCE_DISPLAY_CONDITION
    float nearSq = distanceDisplayConditionAndDisableDepth.x;
    float farSq = distanceDisplayConditionAndDisableDepth.y;
    if (lengthSq < nearSq || lengthSq > farSq)
    {
        positionEC.xyz = vec3(0.0);
    }
#endif

    vec4 positionWC = computePositionWindowCoordinates(positionEC, imageSize, scale, direction, origin, translate, pixelOffset, alignedAxis, validAlignedAxis, rotation, sizeInMeters);
    gl_Position = czm_viewportOrthographic * vec4(positionWC.xy, -positionWC.z, 1.0);
    v_textureCoordinates = textureCoordinates;

#ifdef DISABLE_DEPTH_DISTANCE
    float disableDepthTestDistance = distanceDisplayConditionAndDisableDepth.z;
    if (disableDepthTestDistance == 0.0 && czm_minimumDisableDepthTestDistance != 0.0)
    {
        disableDepthTestDistance = czm_minimumDisableDepthTestDistance;
    }

    if (disableDepthTestDistance != 0.0)
    {
        // Don't try to "multiply both sides" by w.  Greater/less-than comparisons won't work for negative values of w.
        float zclip = gl_Position.z / gl_Position.w;
        bool clipped = (zclip < -1.0 || zclip > 1.0);
        if (!clipped && (disableDepthTestDistance < 0.0 || (lengthSq > 0.0 && lengthSq < disableDepthTestDistance)))
        {
            // Position z on the near plane.
            gl_Position.z = -gl_Position.w;
        }
    }
#endif

#ifdef RENDER_FOR_PICK
    v_pickColor = pickColor;
#else
    v_color = color;
    v_color.a *= translucency;
#endif
}
