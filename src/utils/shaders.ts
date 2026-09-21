// GLSL Shaders with multi-mode Color Mixing and procedural Particle Types (Circle, Star, Diamond, Ring, Hexagon, Cube, Nebula Cloud, Bokeh, Bird, Feather, Delta, Snowflake Sprites)

export const particleVertexShader = `
uniform float uProgress;
uniform float uTime;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uNoiseSpeed;
uniform float uDelaySpread;
uniform int uNoiseType;       // 0: Simplex, 1: Curl, 2: Turbulence, 3: Vortex
uniform int uDelayMode;       // 0: Random, 1: LinearY, 2: LinearX, 3: Radial, 4: Brightness
uniform float uPointSize;
uniform int uParticleType;    // 0~10 existing, 11: Snowflake1, 12: Snowflake2, 13: Snowflake3, 14: Snowflake4, 15: Snowflake5, 16: Multi Snowflake
uniform float uSpriteHslCycle; // 1.0 for real-time Three.js HSL cycling

// Interactive Mouse Gravity & Free-Floating Brownian Drift
uniform vec3 uMousePos;        // 3D projected mouse world coordinate
uniform float uMouseRadius;    // Gravitational influence radius
uniform float uMouseStrength;  // Gravitational force magnitude
uniform int uMouseMode;        // 0: Attract, 1: Repel, 2: Vortex Swirl
uniform float uMouseActive;    // 1.0 when mouse hovering, 0.0 otherwise
uniform float uAmbientDrift;   // Ambient free-floating wandering amplitude

// Audio Reactivity (Page 14 Manual Feature)
uniform float uAudioBass;       // 0.0 ~ 2.0 bass beat expansion
uniform float uAudioTreble;     // 0.0 ~ 2.0 treble shimmer
uniform float uAudioPulse;      // 0.0 ~ 2.0 transient kick burst

// Force Fields & Black Hole Singularity (Page 15 Manual Feature)
uniform float uBlackHoleActive; // 1.0 when active
uniform float uBlackHoleMass;   // Gravitational sink power
uniform float uBlackHoleRadius; // Event horizon radius

// Cinematic Glitch & Distortion (Page 16 Manual Feature)
uniform float uGlitchIntensity; // 0.0 ~ 2.0 glitch jitter
uniform float uMotionBlurIntensity; // 0.0 ~ 3.0 kinetic motion blur scale
uniform float uIsLightBackground;   // 1.0 when background is white / light, 0.0 for dark mode

// Color Mixing Uniforms
uniform int uColorMixMode;     // 0: Interpolate, 1: Gradient, 2: Velocity, 3: Height, 4: Radial, 5: Additive, 6: Palette
uniform int uColorMode;        // Preset themes: 0: Original, 1: Cyberpunk, 2: Fire, 3: Galaxy, 4: Emerald, 5: Sunset, 6: Custom
uniform vec3 uColorA;          // Base / Source
uniform vec3 uColorB;          // Mid / Target
uniform vec3 uColorC;          // Peak / Kinetic Highlight
uniform float uColorMixRatio;  // Mix curve balance
uniform float uVelocityShift;  // Speed excitation intensity
uniform float uColorGamma;     // Gamma power
uniform float uGlowIntensity;

attribute vec3 aColor;
attribute vec3 aTarget;
attribute vec3 aTargetColor;
attribute float aRandom;
attribute float aDelayVal;
attribute float aSpriteIndex;  // 0.0 to 4.0 for multi-sprite layer

varying vec3 vColor;
varying float vAlpha;
varying float vSpeed;
varying float vSpriteIndex;

// --- HSL to RGB Helper ---
vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

// --- Simplex Noise 3D Helper (Ashima Arts / Stefan Gustavson) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// 3D Curl Noise approximation
vec3 curlNoise(vec3 p) {
  const float e = 0.08;
  float dx = snoise(p + vec3(e, 0.0, 0.0)) - snoise(p - vec3(e, 0.0, 0.0));
  float dy = snoise(p + vec3(0.0, e, 0.0)) - snoise(p - vec3(0.0, e, 0.0));
  float dz = snoise(p + vec3(0.0, 0.0, e)) - snoise(p - vec3(0.0, 0.0, e));
  
  vec3 curl = vec3(
    snoise(p + vec3(0.0, e, 0.0)) - snoise(p + vec3(0.0, 0.0, e)),
    snoise(p + vec3(0.0, 0.0, e)) - snoise(p + vec3(e, 0.0, 0.0)),
    snoise(p + vec3(e, 0.0, 0.0)) - snoise(p + vec3(0.0, e, 0.0))
  );
  return normalize(curl + vec3(dy - dz, dz - dx, dx - dy) * 0.5);
}

void main() {
  vSpriteIndex = aSpriteIndex;

  // 1. Individual Stagger Delay Calculation
  float delayFactor = aRandom;
  if (uDelayMode == 1) {
    delayFactor = clamp((position.y + 5.0) / 10.0, 0.0, 1.0);
  } else if (uDelayMode == 2) {
    delayFactor = clamp((position.x + 5.0) / 10.0, 0.0, 1.0);
  } else if (uDelayMode == 3) {
    delayFactor = clamp(length(position.xy) / 6.0, 0.0, 1.0);
  } else if (uDelayMode == 4) {
    delayFactor = aDelayVal;
  }

  // Active morph window with delay spread
  float spread = max(uDelaySpread, 0.001);
  float localProgress = clamp((uProgress - delayFactor * spread * 0.8) / (1.0 - spread * 0.79), 0.0, 1.0);
  float smoothT = smoothstep(0.0, 1.0, localProgress);

  // 1.5. Ambient Free-Floating 3D Brownian Wandering (자유 부유 운동)
  float driftEnvelope = sin(smoothT * 3.14159265);
  vec3 wanderDrift = vec3(
    snoise(position * 0.18 + vec3(uTime * 0.22, 0.0, aRandom * 12.0)),
    snoise(position * 0.18 + vec3(0.0, uTime * 0.22, aRandom * 18.0 + 17.3)),
    snoise(position * 0.18 + vec3(aRandom * 25.0 + 31.7, uTime * 0.22, 0.0))
  ) * (uAmbientDrift * driftEnvelope * 1.3);

  // 2. Base Linear / Hermite Position Interpolation
  vec3 mixedPos = mix(position, aTarget, smoothT) + wanderDrift;

  // 3. Noise Envelope: peaks in mid-flight (sin^1.6), completely dampens to 0 at waypoints and endpoints
  float noiseMask = pow(sin(smoothT * 3.14159265), 1.6);

  // 4. Multi-algorithm Noise synthesis
  vec3 noiseVec = vec3(0.0);
  vec3 samplePos = mixedPos * uNoiseFreq + vec3(uTime * uNoiseSpeed * 0.4);

  if (uNoiseType == 0) {
    noiseVec = vec3(
      snoise(samplePos + vec3(17.3, 0.0, 0.0)),
      snoise(samplePos + vec3(0.0, 31.7, 0.0)),
      snoise(samplePos + vec3(0.0, 0.0, 43.1))
    );
  } else if (uNoiseType == 1) {
    noiseVec = curlNoise(samplePos);
  } else if (uNoiseType == 2) {
    vec3 n1 = vec3(snoise(samplePos), snoise(samplePos + 10.0), snoise(samplePos + 20.0));
    vec3 n2 = vec3(snoise(samplePos * 2.5), snoise(samplePos * 2.5 + 5.0), snoise(samplePos * 2.5 + 15.0)) * 0.4;
    noiseVec = n1 + n2;
  } else if (uNoiseType == 3) {
    float angle = length(mixedPos.xz) * 1.5 + uTime * uNoiseSpeed;
    noiseVec = vec3(-sin(angle) * mixedPos.z, snoise(samplePos) * 1.2, cos(angle) * mixedPos.x) * 0.4;
  }

  vec3 finalPos = mixedPos + noiseVec * (uNoiseAmp * noiseMask);
  float kineticSpeed = length(noiseVec) * noiseMask;

  // 4.5. INTERACTIVE 3D MOUSE GRAVITY ATTRACTION & VORTEX
  if (uMouseActive > 0.5 && uMouseRadius > 0.001) {
    vec3 toMouse = uMousePos - finalPos;
    float distToMouse = length(toMouse);
    if (distToMouse < uMouseRadius && distToMouse > 0.001) {
      float falloff = smoothstep(uMouseRadius, 0.0, distToMouse);
      vec3 dirToMouse = normalize(toMouse);
      vec3 gravityForce = vec3(0.0);
      
      if (uMouseMode == 0) {
        gravityForce = dirToMouse * falloff * (uMouseStrength * 2.4);
      } else if (uMouseMode == 1) {
        gravityForce = -dirToMouse * falloff * (uMouseStrength * 3.0);
      } else {
        vec3 upAxis = vec3(0.0, 1.0, 0.0);
        vec3 tangent = normalize(cross(dirToMouse, upAxis));
        if (length(tangent) < 0.1) tangent = vec3(1.0, 0.0, 0.0);
        gravityForce = (dirToMouse * 0.35 + tangent * 1.35) * falloff * (uMouseStrength * 2.2);
      }
      
      finalPos += gravityForce;
      kineticSpeed += falloff * abs(uMouseStrength) * 1.2;
    }
  }

  // 4.6. AUDIO REACTIVE PULSE & FREQUENCY DISPLACEMENT
  if (uAudioBass > 0.001 || uAudioTreble > 0.001 || uAudioPulse > 0.001) {
    vec3 radialDir = normalize(finalPos + vec3(0.0001));
    float bassDisp = (uAudioBass * 1.6 + uAudioPulse * 2.2);
    vec3 trebleJitter = vec3(
      snoise(finalPos * 2.5 + vec3(uTime * 5.0, 0.0, 0.0)),
      snoise(finalPos * 2.5 + vec3(0.0, uTime * 5.0, 0.0)),
      snoise(finalPos * 2.5 + vec3(0.0, 0.0, uTime * 5.0))
    ) * (uAudioTreble * 0.9);
    
    finalPos += radialDir * bassDisp + trebleJitter;
    kineticSpeed += (uAudioBass + uAudioPulse * 1.5);
  }

  // 4.7. BLACK HOLE SINGULARITY FORCE FIELD
  if (uBlackHoleActive > 0.5 && uBlackHoleRadius > 0.1) {
    vec3 bhPos = vec3(0.0, 0.0, 0.0);
    vec3 toBH = bhPos - finalPos;
    float distBH = length(toBH);
    if (distBH < uBlackHoleRadius && distBH > 0.05) {
      float bhFalloff = pow(1.0 - (distBH / uBlackHoleRadius), 1.6);
      vec3 dirBH = normalize(toBH);
      vec3 tangentBH = normalize(cross(dirBH, vec3(0.0, 1.0, 0.0)));
      if (length(tangentBH) < 0.1) tangentBH = vec3(1.0, 0.0, 0.0);
      
      finalPos += (dirBH * 0.45 + tangentBH * 1.25) * bhFalloff * (uBlackHoleMass * 2.2);
      kineticSpeed += bhFalloff * uBlackHoleMass * 1.8;
    }
  }

  // 4.8. CINEMATIC DIGITAL GLITCH JITTER
  if (uGlitchIntensity > 0.01) {
    float glitchPulse = step(0.88, sin(uTime * 14.0 + finalPos.y * 4.0));
    float xOffset = (snoise(vec3(finalPos.y * 6.0, uTime * 18.0, aRandom * 5.0)) - 0.5);
    finalPos.x += xOffset * uGlitchIntensity * glitchPulse * 2.8;
    kineticSpeed += glitchPulse * uGlitchIntensity * 1.5;
  }

  vSpeed = kineticSpeed;

  // 5. ADVANCED COLOR MIXING SOLVER
  vec3 mixedColor = vec3(1.0);

  if (uColorMixMode == 0) {
    vec3 colA = aColor;
    vec3 colB = aTargetColor;
    float biasedT = pow(smoothT, max(uColorMixRatio * 2.0, 0.1));
    mixedColor = mix(colA, colB, biasedT);
  } else if (uColorMixMode == 1) {
    float t = clamp(pow(smoothT, uColorMixRatio * 2.0), 0.0, 1.0);
    if (t < 0.5) {
      mixedColor = mix(uColorA, uColorB, t * 2.0);
    } else {
      mixedColor = mix(uColorB, uColorC, (t - 0.5) * 2.0);
    }
  } else if (uColorMixMode == 2) {
    vec3 baseCol = mix(uColorA, uColorB, smoothT);
    float speedBoost = clamp(kineticSpeed * uVelocityShift * 1.5, 0.0, 1.0);
    mixedColor = mix(baseCol, uColorC, speedBoost);
  } else if (uColorMixMode == 3) {
    float heightT = clamp((finalPos.y + 4.0) / 8.0, 0.0, 1.0);
    if (heightT < 0.5) {
      mixedColor = mix(uColorA, uColorB, heightT * 2.0);
    } else {
      mixedColor = mix(uColorB, uColorC, (heightT - 0.5) * 2.0);
    }
  } else if (uColorMixMode == 4) {
    float radDist = clamp(length(finalPos.xyz) / 6.0, 0.0, 1.0);
    if (radDist < 0.5) {
      mixedColor = mix(uColorA, uColorB, radDist * 2.0);
    } else {
      mixedColor = mix(uColorB, uColorC, (radDist - 0.5) * 2.0);
    }
  } else if (uColorMixMode == 5) {
    mixedColor = min(aColor + aTargetColor * smoothT + uColorA * 0.3, vec3(1.0));
  } else {
    vec3 colA = aColor;
    vec3 colB = aTargetColor;
    if (uColorMode == 1) {
      colA = vec3(0.0, 0.94, 1.0);  // Cyber Cyan
      colB = vec3(1.0, 0.1, 0.6);   // Neon Magenta
    } else if (uColorMode == 2) {
      colA = vec3(1.0, 0.25, 0.0);  // Solar Fire
      colB = vec3(1.0, 0.9, 0.15);  // Gold Core
    } else if (uColorMode == 3) {
      colA = vec3(0.65, 0.15, 1.0); // Void Violet
      colB = vec3(0.0, 0.6, 1.0);   // Deep Cyan
    } else if (uColorMode == 4) {
      colA = vec3(0.0, 1.0, 0.65);  // Emerald
      colB = vec3(0.4, 1.0, 0.2);   // Lime
    } else if (uColorMode == 5) {
      colA = vec3(1.0, 0.2, 0.4);   // Sunset Coral
      colB = vec3(1.0, 0.75, 0.2);  // Amber Gold
    }
    mixedColor = mix(colA, colB, smoothT);
  }

  // Real-time HSL Spectrum Cycling (Three.js WebGL Points Sprites Feature)
  if (uSpriteHslCycle > 0.5) {
    float hslBase = (aSpriteIndex * 0.05 + aRandom * 0.1);
    float hue = fract(hslBase + uTime * 0.05);
    float sat = 0.85 - aSpriteIndex * 0.15;
    float light = 0.75;
    vec3 hslColor = hsl2rgb(vec3(hue, sat, light));
    mixedColor = mix(mixedColor, hslColor, 0.85);
  }

  // Gamma correction & glow boost
  mixedColor = pow(max(mixedColor, vec3(0.0)), vec3(uColorGamma));

  if (uIsLightBackground > 0.5) {
    // 💡 HIGH CONTRAST LIGHT & TRANSPARENT BACKGROUND INK RENDERING
    // Adapt particle chromatic tones to ensure deep, vivid readability on white & transparent canvas
    float colLum = dot(mixedColor, vec3(0.299, 0.587, 0.114));
    vec3 deepChromatic = mixedColor * 0.85;
    if (colLum > 0.60) {
      // De-saturate blinding pastel/white tones into rich, high-contrast cyan/indigo/ruby ink
      deepChromatic = mix(mixedColor * 0.55, vec3(0.02, 0.25, 0.75), 0.42);
    }
    // High kinetic velocity particles get a bold contrast highlight
    vColor = mix(deepChromatic, vec3(0.04, 0.06, 0.16), clamp(noiseMask * 0.35, 0.0, 0.45));
    vAlpha = 1.0;
  } else {
    // ✨ LUMINOUS GLOWING DARK BACKGROUND RENDERING
    vColor = mixedColor + abs(noiseVec) * (0.2 * noiseMask * uGlowIntensity);
    vAlpha = 0.8 + 0.2 * (1.0 - noiseMask * 0.3);
  }

  // 6. Perspective Projection & Multi-Layer Size Scaling
  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Multi-tier size distribution matching Three.js webgl_points_sprites (20, 15, 10, 8, 5)
  float sizeMultiplier = 1.0;
  if (uParticleType == 16) {
    // 5-Layer Multi Size Scale
    sizeMultiplier = aSpriteIndex < 0.5 ? 1.6 : aSpriteIndex < 1.5 ? 1.25 : aSpriteIndex < 2.5 ? 0.95 : aSpriteIndex < 3.5 ? 0.75 : 0.55;
  } else if (uParticleType >= 11) {
    sizeMultiplier = 1.25;
  }
  
  // Kinetic velocity stretching for motion blur look
  float speedStretch = 1.0 + clamp(vSpeed * 0.12 * uMotionBlurIntensity, 0.0, 1.8);
  float pSize = uPointSize * sizeMultiplier * speedStretch * (28.0 / -mvPosition.z);
  if (uIsLightBackground > 0.5) {
    // Boost particle point size on white background so tiny dust points are clearly visible
    pSize *= 1.25;
  }
  gl_PointSize = clamp(pSize, 1.0, 64.0);
}
`;

export const particleFragmentShader = `
uniform float uIsLightBackground; // 1.0 for white / light background, 0.0 for dark
uniform float uGlowIntensity;
uniform float uTime;
uniform int uParticleType;     // 0~10 existing, 11: Snowflake1, 12: Snowflake2, 13: Snowflake3, 14: Snowflake4, 15: Snowflake5, 16: Multi Snowflake
uniform float uShapeRotation;  // Rotation in radians
uniform float uCoreRatio;      // Hot center sharpness
uniform int uUseSpriteTexture; // 1: Texture sampler, 0: Procedural Crystal
uniform sampler2D uSpriteTexture1;
uniform sampler2D uSpriteTexture2;
uniform sampler2D uSpriteTexture3;
uniform sampler2D uSpriteTexture4;
uniform sampler2D uSpriteTexture5;

varying vec3 vColor;
varying float vAlpha;
varying float vSpeed;
varying float vSpriteIndex;

// 2D Rotation Helper
vec2 rotate2d(vec2 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

// Procedural 6-Fold Snowflake Crystal Generator
float generateSnowflakeAlpha(vec2 uv, int flakeType) {
  float dist = length(uv);
  if (dist > 0.5) return 0.0;

  float angle = atan(uv.y, uv.x);
  // 6-fold radial symmetry
  float symAngle = abs(mod(angle + 0.52359877, 1.04719755) - 0.52359877);
  vec2 p = vec2(cos(symAngle) * dist, sin(symAngle) * dist);

  float alpha = 0.0;

  if (flakeType == 1) {
    // ❄️ Crystal Snowflake 1 (Broad faceted hexagonal plate with dendrite spine)
    float spine = smoothstep(0.018, 0.0, p.y) * smoothstep(0.48, 0.0, p.x);
    // 60-deg side branches
    vec2 b1 = p - vec2(0.2, 0.0);
    vec2 rb1 = rotate2d(b1, 1.0472);
    float branch1 = smoothstep(0.015, 0.0, abs(rb1.y)) * smoothstep(0.16, 0.0, abs(rb1.x));
    
    vec2 b2 = p - vec2(0.35, 0.0);
    vec2 rb2 = rotate2d(b2, 1.0472);
    float branch2 = smoothstep(0.012, 0.0, abs(rb2.y)) * smoothstep(0.12, 0.0, abs(rb2.x));

    float hexCore = smoothstep(0.14, 0.0, max(p.x * 0.866 + p.y * 0.5, p.y));
    alpha = spine * 1.3 + (branch1 + branch2) * 1.1 + hexCore * 1.4;

  } else if (flakeType == 2) {
    // ❄️ Star Snowflake 2 (Diffraction Cross Star & Ice Diamond)
    float ray = 0.02 / (p.y * 7.0 + p.x * 0.3 + 0.02) * smoothstep(0.5, 0.0, dist);
    float core = smoothstep(0.15, 0.0, dist) * 1.5;
    vec2 rb = rotate2d(p - vec2(0.25, 0.0), 1.0472);
    float tipSpur = smoothstep(0.018, 0.0, abs(rb.y)) * smoothstep(0.14, 0.0, abs(rb.x));
    alpha = ray + core + tipSpur * 1.2;

  } else if (flakeType == 3) {
    // ❄️ Dendrite Snowflake 3 (Delicate Feathered Branch Needles)
    float spine = smoothstep(0.012, 0.0, p.y) * smoothstep(0.49, 0.0, p.x);
    float needles = 0.0;
    for (float i = 0.12; i < 0.45; i += 0.08) {
      vec2 bn = rotate2d(p - vec2(i, 0.0), 1.0472);
      needles += smoothstep(0.009, 0.0, abs(bn.y)) * smoothstep(0.15 * (1.0 - i), 0.0, abs(bn.x));
    }
    float coreStar = smoothstep(0.08, 0.0, dist);
    alpha = spine * 1.4 + needles * 1.2 + coreStar * 1.5;

  } else if (flakeType == 4) {
    // ❄️ Ice Flake 4 (Hexagonal Ring & Stellar Prisms)
    float ring = smoothstep(0.03, 0.0, abs(dist - 0.22));
    float spine = smoothstep(0.015, 0.0, p.y) * smoothstep(0.48, 0.0, p.x);
    float hex = smoothstep(0.08, 0.0, max(p.x * 0.866 + p.y * 0.5, p.y));
    alpha = ring * 0.9 + spine * 1.2 + hex * 1.3;

  } else {
    // ❄️ Micro Crystal 5 (Glittering Ice Dust & Diamond Micro-Prism)
    float diamond = max(p.x + p.y, p.x * 1.5);
    float prism = smoothstep(0.42, 0.0, diamond);
    float coreSparkle = 0.015 / (p.y * 8.0 + p.x * 2.0 + 0.015);
    alpha = prism * 0.8 + coreSparkle * 0.8;
  }

  return clamp(alpha, 0.0, 1.8);
}

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  vec2 rCoord = rotate2d(coord, uShapeRotation);
  float dist = length(coord);

  float shapeAlpha = 0.0;

  if (uParticleType == 0) {
    // 0: CIRCLE (Soft Glow Round Dot)
    if (dist > 0.5) discard;
    float core = smoothstep(0.5, 0.0, dist);
    float nucleus = smoothstep(0.2 * uCoreRatio, 0.0, dist);
    shapeAlpha = pow(core, 1.5) + nucleus * 0.5;

  } else if (uParticleType == 1) {
    // 1: STAR / CROSS SPARKLE
    if (dist > 0.5) discard;
    vec2 p = abs(rCoord);
    float rayX = 0.03 / (p.x * 6.5 + p.y + 0.03);
    float rayY = 0.03 / (p.y * 6.5 + p.x + 0.03);
    vec2 diag = abs(rotate2d(rCoord, 0.785398));
    float rayDiag = 0.015 / (diag.x * 5.0 + diag.y + 0.03) + 0.015 / (diag.y * 5.0 + diag.x + 0.03);
    float starBody = (rayX + rayY + rayDiag * 0.7) * smoothstep(0.5, 0.0, dist);
    shapeAlpha = clamp(starBody, 0.0, 1.2);

  } else if (uParticleType == 2) {
    // 2: DIAMOND (Rhombus Spark)
    vec2 p = abs(rCoord);
    float diamondDist = p.x + p.y;
    if (diamondDist > 0.55) discard;
    float core = smoothstep(0.5, 0.0, diamondDist);
    shapeAlpha = pow(core, 1.3) * (1.0 + (1.0 - diamondDist));

  } else if (uParticleType == 3) {
    // 3: RING / NEON BUBBLE
    if (dist > 0.5) discard;
    float ringDist = abs(dist - 0.28);
    float ring = smoothstep(0.16, 0.0, ringDist);
    float innerGlow = smoothstep(0.3, 0.0, dist) * 0.3;
    shapeAlpha = ring + innerGlow;

  } else if (uParticleType == 4) {
    // 4: HEXAGON (Cyber Polygon)
    vec2 p = abs(rCoord);
    float hexDist = max(p.x * 0.866025 + p.y * 0.5, p.y);
    if (hexDist > 0.48) discard;
    float core = smoothstep(0.48, 0.0, hexDist);
    shapeAlpha = pow(core, 1.2);

  } else if (uParticleType == 5) {
    // 5: CUBE / SQUARE BLOCK
    vec2 p = abs(rCoord);
    float boxDist = max(p.x, p.y);
    if (boxDist > 0.48) discard;
    float core = smoothstep(0.48, 0.0, boxDist);
    shapeAlpha = pow(core, 0.8);

  } else if (uParticleType == 6) {
    // 6: NEBULA CLOUD
    if (dist > 0.5) discard;
    float angle = atan(coord.y, coord.x);
    float cloudNoise = sin(angle * 4.0 + dist * 10.0) * 0.25;
    float core = smoothstep(0.5, 0.0, dist + cloudNoise * 0.1);
    shapeAlpha = pow(core, 1.4) * (0.75 + 0.25 * sin(dist * 20.0));

  } else if (uParticleType == 7) {
    // 7: BOKEH FLARE
    if (dist > 0.5) discard;
    float core = smoothstep(0.5, 0.38, dist);
    float rim = smoothstep(0.5, 0.44, dist) * 1.5;
    shapeAlpha = (core * 0.45 + rim);

  } else if (uParticleType == 8) {
    // 8: 🦅 BOIDS BIRD WING
    if (dist > 0.5) discard;
    float flap = sin(uTime * 14.0) * 0.18;
    float wingX = abs(rCoord.x);
    float wingY = rCoord.y - (flap * wingX * 2.2);
    float bodyDist = max(wingX * 4.5, abs(rCoord.y * 1.5));
    float bodyGlow = smoothstep(0.45, 0.0, bodyDist) * 1.6;
    float wingShape = max(abs(wingY * 2.2 + wingX * 0.8), wingX * 1.2);
    float wingsGlow = smoothstep(0.52, 0.05, wingShape);
    float tipGlow = smoothstep(0.12, 0.0, abs(wingX - 0.42) + abs(wingY + 0.15)) * 1.8;
    shapeAlpha = (bodyGlow + wingsGlow * 1.1 + tipGlow);

  } else if (uParticleType == 9) {
    // 9: 🪶 AERODYNAMIC FEATHER
    if (dist > 0.5) discard;
    float taper = 1.0 - (rCoord.y + 0.5) * 0.5;
    float vaneWidth = abs(rCoord.x) / max(0.01, taper);
    float vaneBody = smoothstep(0.35, 0.0, vaneWidth) * smoothstep(0.5, 0.2, abs(rCoord.y));
    float rachis = smoothstep(0.04, 0.0, abs(rCoord.x)) * 1.5;
    float barbs = sin((rCoord.y * 4.0 - abs(rCoord.x) * 3.0) * 35.0) * 0.15;
    shapeAlpha = (vaneBody + rachis + barbs * vaneBody) * 1.3;

  } else if (uParticleType == 10) {
    // 10: 🔺 SUPERSONIC DELTA WING
    if (dist > 0.5) discard;
    float deltaX = abs(rCoord.x);
    float deltaY = rCoord.y;
    float deltaShape = max(deltaX * 1.6 + deltaY * 1.2, -deltaY * 1.4);
    if (deltaShape > 0.48) discard;
    float deltaCore = smoothstep(0.48, 0.0, deltaShape);
    float trail1 = smoothstep(0.05, 0.0, abs(rCoord.x - 0.18)) * smoothstep(-0.4, 0.0, rCoord.y);
    float trail2 = smoothstep(0.05, 0.0, abs(rCoord.x + 0.18)) * smoothstep(-0.4, 0.0, rCoord.y);
    shapeAlpha = deltaCore + (trail1 + trail2) * 0.75;

  } else if (uParticleType == 11) {
    // 11: ❄️ SNOWFLAKE SPRITE 1
    if (uUseSpriteTexture == 1) {
      vec4 tex = texture2D(uSpriteTexture1, gl_PointCoord);
      shapeAlpha = tex.a * ((tex.r + tex.g + tex.b) / 3.0 + 0.2);
    } else {
      shapeAlpha = generateSnowflakeAlpha(rCoord, 1);
    }

  } else if (uParticleType == 12) {
    // 12: ❄️ SNOWFLAKE SPRITE 2
    if (uUseSpriteTexture == 1) {
      vec4 tex = texture2D(uSpriteTexture2, gl_PointCoord);
      shapeAlpha = tex.a * ((tex.r + tex.g + tex.b) / 3.0 + 0.2);
    } else {
      shapeAlpha = generateSnowflakeAlpha(rCoord, 2);
    }

  } else if (uParticleType == 13) {
    // 13: ❄️ SNOWFLAKE SPRITE 3
    if (uUseSpriteTexture == 1) {
      vec4 tex = texture2D(uSpriteTexture3, gl_PointCoord);
      shapeAlpha = tex.a * ((tex.r + tex.g + tex.b) / 3.0 + 0.2);
    } else {
      shapeAlpha = generateSnowflakeAlpha(rCoord, 3);
    }

  } else if (uParticleType == 14) {
    // 14: ❄️ SNOWFLAKE SPRITE 4
    if (uUseSpriteTexture == 1) {
      vec4 tex = texture2D(uSpriteTexture4, gl_PointCoord);
      shapeAlpha = tex.a * ((tex.r + tex.g + tex.b) / 3.0 + 0.2);
    } else {
      shapeAlpha = generateSnowflakeAlpha(rCoord, 4);
    }

  } else if (uParticleType == 15) {
    // 15: ❄️ SNOWFLAKE SPRITE 5
    if (uUseSpriteTexture == 1) {
      vec4 tex = texture2D(uSpriteTexture5, gl_PointCoord);
      shapeAlpha = tex.a * ((tex.r + tex.g + tex.b) / 3.0 + 0.2);
    } else {
      shapeAlpha = generateSnowflakeAlpha(rCoord, 5);
    }

  } else {
    // 16: 🌨️ 5-LAYER MULTI SNOWFLAKE SPRITE BLIZZARD (Three.js webgl_points_sprites attached file)
    int sIdx = int(floor(vSpriteIndex + 0.5));
    if (uUseSpriteTexture == 1) {
      vec4 tex = vec4(1.0);
      if (sIdx == 0) tex = texture2D(uSpriteTexture2, gl_PointCoord);
      else if (sIdx == 1) tex = texture2D(uSpriteTexture3, gl_PointCoord);
      else if (sIdx == 2) tex = texture2D(uSpriteTexture1, gl_PointCoord);
      else if (sIdx == 3) tex = texture2D(uSpriteTexture5, gl_PointCoord);
      else tex = texture2D(uSpriteTexture4, gl_PointCoord);
      shapeAlpha = tex.a * ((tex.r + tex.g + tex.b) / 3.0 + 0.2);
    } else {
      int flakeKind = sIdx == 0 ? 2 : sIdx == 1 ? 3 : sIdx == 2 ? 1 : sIdx == 3 ? 5 : 4;
      shapeAlpha = generateSnowflakeAlpha(rCoord, flakeKind);
    }
  }

  if (shapeAlpha < 0.01) discard;

  if (uIsLightBackground > 0.5) {
    // 💡 HIGH-CONTRAST LIGHT & TRANSPARENT CANVAS INK RENDERING
    // Create a crisp high-contrast particle with a rich chromatic core and dark outer contour.
    // This ensures that against a transparent or pure white (#FFFFFF) background, every single particle
    // and its curl-noise movement / morph trajectories are sharply visible with deep ink definition!
    float edgeContour = smoothstep(0.5, 0.08, dist);
    vec3 particleRgb = mix(vColor * 0.22, vColor, edgeContour);
    float finalAlpha = clamp(shapeAlpha * 1.55, 0.0, 1.0);
    gl_FragColor = vec4(particleRgb, finalAlpha);
  } else {
    // ✨ LUMINOUS GLOWING DARK BACKGROUND RENDERING
    float finalAlpha = vAlpha * shapeAlpha * (1.0 + uGlowIntensity * 0.4);
    gl_FragColor = vec4(vColor, clamp(finalAlpha, 0.0, 1.0));
  }
}
`;

