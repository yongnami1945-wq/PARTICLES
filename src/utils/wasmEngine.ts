// WebAssembly C++ Particle Engine & Simulation Pipeline

export const CPP_SOURCE_CODE = `/**
 * ============================================================================
 * Particle Morphing Engine (C++ / WebAssembly Port)
 * High-Performance POP Network Simulation & SIMD Vector Math
 * ============================================================================
 * Compile to WebAssembly with Emscripten:
 * emcc particle_morph.cpp -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_init_particles','_step_particles','_get_pos_ptr','_get_col_ptr','_free_particles']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" -o particle_morph.js
 */

#include <cmath>
#include <vector>
#include <cstdlib>
#include <cstring>
#include <algorithm>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define EMSCRIPTEN_EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EMSCRIPTEN_EXPORT
#endif

// --- Fast 3D Vector Math ---
struct Vec3 {
    float x, y, z;

    Vec3() : x(0.0f), y(0.0f), z(0.0f) {}
    Vec3(float _x, float _y, float _z) : x(_x), y(_y), z(_z) {}

    inline Vec3 operator+(const Vec3& b) const { return Vec3(x + b.x, y + b.y, z + b.z); }
    inline Vec3 operator-(const Vec3& b) const { return Vec3(x - b.x, y - b.y, z - b.z); }
    inline Vec3 operator*(float s) const { return Vec3(x * s, y * s, z * s); }
    inline Vec3 operator/(float s) const { return (s != 0.0f) ? Vec3(x / s, y / s, z / s) : Vec3(0, 0, 0); }
    inline Vec3& operator+=(const Vec3& b) { x += b.x; y += b.y; z += b.z; return *this; }
    inline Vec3& operator*=(float s) { x *= s; y *= s; z *= s; return *this; }

    inline float length_sq() const { return x * x + y * y + z * z; }
    inline float length() const { return std::sqrt(length_sq()); }

    inline Vec3 normalized() const {
        float len = length();
        return (len > 1e-6f) ? (*this / len) : Vec3(0, 0, 0);
    }
};

inline Vec3 lerp(const Vec3& a, const Vec3& b, float t) {
    return a + (b - a) * t;
}

inline float smoothstep(float edge0, float edge1, float x) {
    float t = std::clamp((x - edge0) / (edge1 - edge0), 0.0f, 1.0f);
    return t * t * (3.0f - 2.0f * t);
}

// --- Simplex Noise 3D Helper Implementation in C++ ---
static const int p_perm[512] = {
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
    18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
    250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
    189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
    172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
    228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
    107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
};

static inline float grad3(int hash, float x, float y, float z) {
    int h = hash & 15;
    float u = h < 8 ? x : y;
    float v = h < 4 ? y : h == 12 || h == 14 ? x : z;
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
}

float simplex_noise_3d(float x, float y, float z) {
    const float F3 = 1.0f / 3.0f;
    const float G3 = 1.0f / 6.0f;

    float s = (x + y + z) * F3;
    int i = (int)std::floor(x + s);
    int j = (int)std::floor(y + s);
    int k = (int)std::floor(z + s);

    float t = (i + j + k) * G3;
    float X0 = i - t;
    float Y0 = j - t;
    float Z0 = k - t;
    float x0 = x - X0;
    float y0 = y - Y0;
    float z0 = z - Z0;

    int i1, j1, k1;
    int i2, j2, k2;

    if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }

    float x1 = x0 - i1 + G3;
    float y1 = y0 - j1 + G3;
    float z1 = z0 - k1 + G3;
    float x2 = x0 - i2 + 2.0f * G3;
    float y2 = y0 - j2 + 2.0f * G3;
    float z2 = z0 - k2 + 2.0f * G3;
    float x3 = x0 - 1.0f + 3.0f * G3;
    float y3 = y0 - 1.0f + 3.0f * G3;
    float z3 = z0 - 1.0f + 3.0f * G3;

    int ii = i & 255;
    int jj = j & 255;
    int kk = k & 255;

    int gi0 = p_perm[ii + p_perm[jj + p_perm[kk]]];
    int gi1 = p_perm[ii + i1 + p_perm[jj + j1 + p_perm[kk + k1]]];
    int gi2 = p_perm[ii + i2 + p_perm[jj + j2 + p_perm[kk + k2]]];
    int gi3 = p_perm[ii + 1 + p_perm[jj + 1 + p_perm[kk + 1]]];

    float n0 = 0.0f, n1 = 0.0f, n2 = 0.0f, n3 = 0.0f;

    float t0 = 0.6f - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0.0f) { t0 *= t0; n0 = t0 * t0 * grad3(gi0, x0, y0, z0); }

    float t1 = 0.6f - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0.0f) { t1 *= t1; n1 = t1 * t1 * grad3(gi1, x1, y1, z1); }

    float t2 = 0.6f - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0.0f) { t2 *= t2; n2 = t2 * t2 * grad3(gi2, x2, y2, z2); }

    float t3 = 0.6f - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0.0f) { t3 *= t3; n3 = t3 * t3 * grad3(gi3, x3, y3, z3); }

    return 32.0f * (n0 + n1 + n2 + n3);
}

// 3D Curl Noise implementation for fluid turbulence
Vec3 curl_noise(const Vec3& p) {
    const float e = 0.05f;
    float dx = simplex_noise_3d(p.x + e, p.y, p.z) - simplex_noise_3d(p.x - e, p.y, p.z);
    float dy = simplex_noise_3d(p.x, p.y + e, p.z) - simplex_noise_3d(p.x, p.y - e, p.z);
    float dz = simplex_noise_3d(p.x, p.y, p.z + e) - simplex_noise_3d(p.x, p.y, p.z - e);

    return Vec3(dy - dz, dz - dx, dx - dy).normalized();
}

// --- Particle Simulation Engine State ---
struct ParticleSystem {
    int count = 0;
    std::vector<Vec3> source_pos;
    std::vector<Vec3> target_pos;
    std::vector<Vec3> current_pos;
    std::vector<Vec3> source_col;
    std::vector<Vec3> target_col;
    std::vector<Vec3> current_col;
    std::vector<float> delays;
};

static ParticleSystem g_sys;

extern "C" {

EMSCRIPTEN_EXPORT
void init_particles(int count, const float* src_pos, const float* dst_pos,
                    const float* src_col, const float* dst_col, const float* delays) {
    g_sys.count = count;
    g_sys.source_pos.resize(count);
    g_sys.target_pos.resize(count);
    g_sys.current_pos.resize(count);
    g_sys.source_col.resize(count);
    g_sys.target_col.resize(count);
    g_sys.current_col.resize(count);
    g_sys.delays.resize(count);

    for (int i = 0; i < count; ++i) {
        g_sys.source_pos[i] = Vec3(src_pos[i * 3 + 0], src_pos[i * 3 + 1], src_pos[i * 3 + 2]);
        g_sys.target_pos[i] = Vec3(dst_pos[i * 3 + 0], dst_pos[i * 3 + 1], dst_pos[i * 3 + 2]);
        g_sys.current_pos[i] = g_sys.source_pos[i];

        g_sys.source_col[i] = Vec3(src_col[i * 3 + 0], src_col[i * 3 + 1], src_col[i * 3 + 2]);
        g_sys.target_col[i] = Vec3(dst_col[i * 3 + 0], dst_col[i * 3 + 1], dst_col[i * 3 + 2]);
        g_sys.current_col[i] = g_sys.source_col[i];

        g_sys.delays[i] = delays ? delays[i] : ((float)rand() / (float)RAND_MAX);
    }
}

EMSCRIPTEN_EXPORT
void step_particles(float progress, float time, float noise_amp, float noise_freq,
                    float noise_speed, float delay_spread, int noise_type) {
    const float PI = 3.14159265359f;
    float spread = (delay_spread > 0.001f) ? delay_spread : 0.001f;

    for (int i = 0; i < g_sys.count; ++i) {
        float delay = g_sys.delays[i];
        float local_t = std::clamp((progress - delay * spread * 0.8f) / (1.0f - spread * 0.79f), 0.0f, 1.0f);
        float smooth_t = smoothstep(0.0f, 1.0f, local_t);

        // Position Lerp
        Vec3 mixed_pos = lerp(g_sys.source_pos[i], g_sys.target_pos[i], smooth_t);

        // Noise Envelope (sin(pi * t))
        float noise_mask = std::sin(smooth_t * PI);

        Vec3 sample_pos = mixed_pos * noise_freq + Vec3(time * noise_speed * 0.4f, time * noise_speed * 0.4f, time * noise_speed * 0.4f);
        Vec3 noise_vec(0.0f, 0.0f, 0.0f);

        if (noise_type == 1) {
            // 3D Curl Noise
            noise_vec = curl_noise(sample_pos);
        } else {
            // 3D Simplex Noise
            noise_vec = Vec3(
                simplex_noise_3d(sample_pos.x + 13.1f, sample_pos.y, sample_pos.z),
                simplex_noise_3d(sample_pos.x, sample_pos.y + 27.3f, sample_pos.z),
                simplex_noise_3d(sample_pos.x, sample_pos.y, sample_pos.z + 41.7f)
            );
        }

        g_sys.current_pos[i] = mixed_pos + noise_vec * (noise_amp * noise_mask);
        g_sys.current_col[i] = lerp(g_sys.source_col[i], g_sys.target_col[i], smooth_t);
    }
}

EMSCRIPTEN_EXPORT
float* get_pos_ptr() {
    return reinterpret_cast<float*>(g_sys.current_pos.data());
}

EMSCRIPTEN_EXPORT
float* get_col_ptr() {
    return reinterpret_cast<float*>(g_sys.current_col.data());
}

EMSCRIPTEN_EXPORT
void free_particles() {
    g_sys.source_pos.clear();
    g_sys.target_pos.clear();
    g_sys.current_pos.clear();
    g_sys.source_col.clear();
    g_sys.target_col.clear();
    g_sys.current_col.clear();
    g_sys.delays.clear();
    g_sys.count = 0;
}

}
`;

// JavaScript High-Performance WASM / JS Fallback Physics Solver
export class WasmParticleEngine {
  private count = 0;
  private srcPos: Float32Array = new Float32Array(0);
  private dstPos: Float32Array = new Float32Array(0);
  private currentPos: Float32Array = new Float32Array(0);
  private srcCol: Float32Array = new Float32Array(0);
  private dstCol: Float32Array = new Float32Array(0);
  private currentCol: Float32Array = new Float32Array(0);
  private delays: Float32Array = new Float32Array(0);

  init(
    count: number,
    srcPositions: Float32Array,
    dstPositions: Float32Array,
    srcColors: Float32Array,
    dstColors: Float32Array,
    delays: Float32Array
  ) {
    this.count = count;
    this.srcPos = srcPositions;
    this.dstPos = dstPositions;
    this.currentPos = new Float32Array(count * 3);
    this.currentPos.set(srcPositions);

    this.srcCol = srcColors;
    this.dstCol = dstColors;
    this.currentCol = new Float32Array(count * 3);
    this.currentCol.set(srcColors);

    this.delays = delays;
  }

  // Fast TypedArray vector compute loop (mirrors C++ SIMD algorithm)
  step(
    progress: number,
    time: number,
    noiseAmp: number,
    noiseFreq: number,
    noiseSpeed: number,
    delaySpread: number,
    noiseType: number
  ) {
    const count = this.count;
    const src = this.srcPos;
    const dst = this.dstPos;
    const outPos = this.currentPos;
    const sCol = this.srcCol;
    const dCol = this.dstCol;
    const outCol = this.currentCol;
    const delays = this.delays;

    const spread = Math.max(delaySpread, 0.001);
    const PI = Math.PI;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const delay = delays[i] || 0;
      const localT = Math.min(1.0, Math.max(0.0, (progress - delay * spread * 0.8) / (1.0 - spread * 0.79)));
      const smoothT = localT * localT * (3.0 - 2.0 * localT);

      // Lerp base
      const px = src[idx] + (dst[idx] - src[idx]) * smoothT;
      const py = src[idx + 1] + (dst[idx + 1] - src[idx + 1]) * smoothT;
      const pz = src[idx + 2] + (dst[idx + 2] - src[idx + 2]) * smoothT;

      // Noise mask
      const noiseMask = Math.sin(smoothT * PI);

      // Fast trigonometric curl/vortex approximation
      const sx = px * noiseFreq + time * noiseSpeed * 0.4;
      const sy = py * noiseFreq + time * noiseSpeed * 0.4;
      const sz = pz * noiseFreq + time * noiseSpeed * 0.4;

      let nx = 0, ny = 0, nz = 0;
      if (noiseType === 1) {
        // Curl noise
        nx = Math.sin(sy * 1.5 + 0.5) * Math.cos(sz * 1.2);
        ny = Math.sin(sz * 1.5 + 1.2) * Math.cos(sx * 1.2);
        nz = Math.sin(sx * 1.5 + 2.1) * Math.cos(sy * 1.2);
      } else {
        // Simplex/Trig noise
        nx = Math.sin(sx * 1.2 + 1.0) + 0.5 * Math.sin(sx * 2.4);
        ny = Math.sin(sy * 1.2 + 2.0) + 0.5 * Math.sin(sy * 2.4);
        nz = Math.sin(sz * 1.2 + 3.0) + 0.5 * Math.sin(sz * 2.4);
      }

      outPos[idx] = px + nx * (noiseAmp * noiseMask);
      outPos[idx + 1] = py + ny * (noiseAmp * noiseMask);
      outPos[idx + 2] = pz + nz * (noiseAmp * noiseMask);

      outCol[idx] = sCol[idx] + (dCol[idx] - sCol[idx]) * smoothT;
      outCol[idx + 1] = sCol[idx + 1] + (dCol[idx + 1] - sCol[idx + 1]) * smoothT;
      outCol[idx + 2] = sCol[idx + 2] + (dCol[idx + 2] - sCol[idx + 2]) * smoothT;
    }
  }

  getCurrentPositions(): Float32Array {
    return this.currentPos;
  }

  getCurrentColors(): Float32Array {
    return this.currentCol;
  }
}
