/**
 * @license
 * Copyright (c) 2000-2005, Sean O'Neil (s_p_oneil@hotmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of the project nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without
 *   specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Modifications made by Analytical Graphics, Inc.
 */
//This file is automatically rebuilt by the Cesium build process.
define(function() {
    'use strict';
    return "/**\n\
 * @license\n\
 * Copyright (c) 2000-2005, Sean O'Neil (s_p_oneil@hotmail.com)\n\
 * All rights reserved.\n\
 *\n\
 * Redistribution and use in source and binary forms, with or without\n\
 * modification, are permitted provided that the following conditions\n\
 * are met:\n\
 *\n\
 * * Redistributions of source code must retain the above copyright notice,\n\
 *   this list of conditions and the following disclaimer.\n\
 * * Redistributions in binary form must reproduce the above copyright notice,\n\
 *   this list of conditions and the following disclaimer in the documentation\n\
 *   and/or other materials provided with the distribution.\n\
 * * Neither the name of the project nor the names of its contributors may be\n\
 *   used to endorse or promote products derived from this software without\n\
 *   specific prior written permission.\n\
 *\n\
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\n\
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n\
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE\n\
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE\n\
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL\n\
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR\n\
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER\n\
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,\n\
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n\
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\
 *\n\
 * Modifications made by Analytical Graphics, Inc.\n\
 */\n\
\n\
 // Code:  http://sponeil.net/\n\
 // GPU Gems 2 Article:  http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter16.html\n\
\n\
#ifdef COLOR_CORRECT\n\
uniform vec3 u_hsbShift; // Hue, saturation, brightness\n\
#endif\n\
\n\
uniform vec4 u_cameraAndRadiiAndDynamicAtmosphereColor; // Camera height, outer radius, inner radius, dynamic atmosphere color flag\n\
\n\
const float g = -0.95;\n\
const float g2 = g * g;\n\
\n\
varying vec3 v_rayleighColor;\n\
varying vec3 v_mieColor;\n\
varying vec3 v_toCamera;\n\
varying vec3 v_positionEC;\n\
\n\
void main (void)\n\
{\n\
    // Extra normalize added for Android\n\
    float cosAngle = dot(czm_sunDirectionWC, normalize(v_toCamera)) / length(v_toCamera);\n\
    float rayleighPhase = 0.75 * (1.0 + cosAngle * cosAngle);\n\
    float miePhase = 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + cosAngle * cosAngle) / pow(1.0 + g2 - 2.0 * g * cosAngle, 1.5);\n\
\n\
    const float exposure = 2.0;\n\
\n\
    vec3 rgb = rayleighPhase * v_rayleighColor + miePhase * v_mieColor;\n\
    rgb = vec3(1.0) - exp(-exposure * rgb);\n\
    // Compute luminance before color correction to avoid strangely gray night skies\n\
    float l = czm_luminance(rgb);\n\
\n\
#ifdef COLOR_CORRECT\n\
    // Convert rgb color to hsb\n\
    vec3 hsb = czm_RGBToHSB(rgb);\n\
    // Perform hsb shift\n\
    hsb.x += u_hsbShift.x; // hue\n\
    hsb.y = clamp(hsb.y + u_hsbShift.y, 0.0, 1.0); // saturation\n\
    hsb.z = hsb.z > czm_epsilon7 ? hsb.z + u_hsbShift.z : 0.0; // brightness\n\
    // Convert shifted hsb back to rgb\n\
    rgb = czm_HSBToRGB(hsb);\n\
\n\
    // Check if correction decreased the luminance to 0\n\
    l = min(l, czm_luminance(rgb));\n\
#endif\n\
\n\
    // Alter alpha based on how close the viewer is to the ground (1.0 = on ground, 0.0 = at edge of atmosphere)\n\
    float atmosphereAlpha = clamp((u_cameraAndRadiiAndDynamicAtmosphereColor.y - u_cameraAndRadiiAndDynamicAtmosphereColor.x) / (u_cameraAndRadiiAndDynamicAtmosphereColor.y - u_cameraAndRadiiAndDynamicAtmosphereColor.z), 0.0, 1.0);\n\
\n\
    // Alter alpha based on time of day (0.0 = night , 1.0 = day)\n\
    float nightAlpha = (u_cameraAndRadiiAndDynamicAtmosphereColor.w > 0.0) ? clamp(dot(normalize(czm_viewerPositionWC), normalize(czm_sunPositionWC)), 0.0, 1.0) : 1.0;\n\
    atmosphereAlpha *= pow(nightAlpha, 0.5);\n\
\n\
    gl_FragColor = vec4(rgb, mix(rgb.b, 1.0, atmosphereAlpha) * smoothstep(0.0, 1.0, czm_morphTime));\n\
}\n\
";
});