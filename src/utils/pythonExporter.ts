// Python 3D Particle Morphing Engine & Simulation Scripts
// Complete NumPy / Matplotlib / Open3D / Blender Python pipelines

export const PYTHON_NUMPY_SIMULATION_SCRIPT = `"""
================================================================================
3D Particle Morphing & Fluid Noise Simulation Engine (Python / NumPy / Open3D)
================================================================================
Requirements:
    pip install numpy matplotlib open3d scipy
Usage:
    python particle_morph_sim.py --source sphere --target torus --particles 50000 --noise curl
"""

import math
import argparse
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib.animation import FuncAnimation

# ------------------------------------------------------------------------------
# 1. 3D Shape Generators (NumPy Vectorized)
# ------------------------------------------------------------------------------
def generate_sphere(n=50000, radius=3.2):
    """Fibonacci Golden Spiral Sphere Distribution"""
    indices = np.arange(0, n, dtype=float) + 0.5
    phi = np.arccos(1.0 - 2.0 * indices / n)
    theta = math.pi * (1.0 + 5.0 ** 0.5) * indices
    
    x = radius * np.sin(phi) * np.cos(theta)
    y = radius * np.sin(phi) * np.sin(theta)
    z = radius * np.cos(phi)
    
    pos = np.stack([x, y, z], axis=-1)
    # Cyan-to-Blue Palette
    colors = np.zeros_like(pos)
    colors[:, 0] = np.clip(0.0 + 0.2 * (y / radius), 0, 1)
    colors[:, 1] = np.clip(0.8 + 0.2 * (x / radius), 0, 1)
    colors[:, 2] = np.clip(1.0 - 0.3 * (z / radius), 0, 1)
    return pos, colors

def generate_torus(n=50000, R=3.2, r=1.1):
    """3D Torus / Donut Parametric Surface"""
    u = np.random.uniform(0, 2 * np.pi, n)
    v = np.random.uniform(0, 2 * np.pi, n)
    
    x = (R + r * np.cos(v)) * np.cos(u)
    y = r * np.sin(v)
    z = (R + r * np.cos(v)) * np.sin(u)
    
    pos = np.stack([x, y, z], axis=-1)
    # Magenta-to-Gold Palette
    colors = np.zeros_like(pos)
    colors[:, 0] = np.clip(0.9 + 0.1 * np.sin(u), 0, 1)
    colors[:, 1] = np.clip(0.1 + 0.6 * np.cos(v), 0, 1)
    colors[:, 2] = np.clip(0.5 + 0.5 * np.sin(v), 0, 1)
    return pos, colors

def generate_galaxy(n=50000, arms=4, radius=4.5):
    """Logarithmic Spiral Galaxy with Star Core"""
    r = np.random.power(0.5, n) * radius
    theta = r * 1.8 + (np.random.randint(0, arms, n) * (2 * np.pi / arms))
    spread = np.random.normal(0, 0.2, (n, 3))
    
    x = r * np.cos(theta) + spread[:, 0]
    y = np.random.normal(0, 0.25 * np.exp(-r / 2.0), n)
    z = r * np.sin(theta) + spread[:, 2]
    
    pos = np.stack([x, y, z], axis=-1)
    colors = np.zeros_like(pos)
    colors[:, 0] = np.clip(0.6 + 0.4 * np.exp(-r / 2.0), 0, 1)
    colors[:, 1] = np.clip(0.2 + 0.5 * (1.0 - r / radius), 0, 1)
    colors[:, 2] = np.clip(0.9 + 0.1 * (r / radius), 0, 1)
    return pos, colors

def generate_dna(n=50000, height=8.0, radius=2.0, turns=3.5):
    """DNA Double Helix with Base-Pair Hydrogen Bridges"""
    t = np.random.uniform(-0.5, 0.5, n) * height
    strand = np.random.choice([0, 1, 2], n, p=[0.42, 0.42, 0.16])
    
    angle = (t / height) * turns * 2 * np.pi
    x = np.zeros(n)
    y = t
    z = np.zeros(n)
    colors = np.zeros((n, 3))
    
    # Strand 1
    m1 = (strand == 0)
    x[m1] = radius * np.cos(angle[m1])
    z[m1] = radius * np.sin(angle[m1])
    colors[m1] = [0.0, 0.94, 1.0]
    
    # Strand 2 (Phase 180 deg)
    m2 = (strand == 1)
    x[m2] = radius * np.cos(angle[m2] + np.pi)
    z[m2] = radius * np.sin(angle[m2] + np.pi)
    colors[m2] = [1.0, 0.05, 0.55]
    
    # Rungs (Bridge connection)
    m3 = (strand == 2)
    alpha = np.random.uniform(-1, 1, np.sum(m3))
    x[m3] = alpha * radius * np.cos(angle[m3])
    z[m3] = alpha * radius * np.sin(angle[m3])
    colors[m3] = [1.0, 0.9, 0.1]
    
    pos = np.stack([x, y, z], axis=-1)
    return pos, colors

# ------------------------------------------------------------------------------
# 2. Vectorized 3D Curl Noise & Turbulence Field
# ------------------------------------------------------------------------------
def fast_curl_noise(p, time=0.0, freq=0.8, speed=0.7):
    """Vectorized mathematical Curl Noise field for fluid turbulence"""
    s = p * freq + time * speed * 0.4
    
    # Analytical vector potential curl
    nx = np.sin(s[:, 1] * 1.5 + 0.5) * np.cos(s[:, 2] * 1.2)
    ny = np.sin(s[:, 2] * 1.5 + 1.2) * np.cos(s[:, 0] * 1.2)
    nz = np.sin(s[:, 0] * 1.5 + 2.1) * np.cos(s[:, 1] * 1.2)
    
    vec = np.stack([nx, ny, nz], axis=-1)
    norm = np.linalg.norm(vec, axis=-1, keepdims=True) + 1e-6
    return vec / norm

# ------------------------------------------------------------------------------
# 3. Particle Morphing Step Solver
# ------------------------------------------------------------------------------
class ParticleMorphEngine:
    def __init__(self, src_pos, dst_pos, src_col, dst_col, delay_spread=0.45):
        self.src_pos = src_pos
        self.dst_pos = dst_pos
        self.src_col = src_col
        self.dst_col = dst_col
        self.count = len(src_pos)
        self.delay_spread = max(delay_spread, 0.001)
        self.delays = np.random.uniform(0.0, 1.0, self.count)
        
    def step(self, progress, time=0.0, noise_amp=1.5, noise_freq=0.8, noise_speed=0.7):
        """Calculates 3D morph position and color at progress t in [0.0, 1.0]"""
        # Staggered local time window
        local_t = np.clip((progress - self.delays * self.delay_spread * 0.8) / 
                          (1.0 - self.delay_spread * 0.79), 0.0, 1.0)
        smooth_t = local_t * local_t * (3.0 - 2.0 * local_t)
        smooth_t = smooth_t[:, np.newaxis]
        
        # Base Linear Hermite Interpolation
        base_pos = self.src_pos + (self.dst_pos - self.src_pos) * smooth_t
        
        # Mid-Flight Noise Envelope (Peaks at t = 0.5)
        noise_mask = np.sin(smooth_t * np.pi)
        
        # Turbulent Curl Noise Displacement
        curl = fast_curl_noise(base_pos, time, noise_freq, noise_speed)
        current_pos = base_pos + curl * (noise_amp * noise_mask)
        
        # Color Interpolation
        current_col = self.src_col + (self.dst_col - self.src_col) * smooth_t
        return current_pos, current_col

# ------------------------------------------------------------------------------
# 4. Interactive Matplotlib 3D Real-Time Animator
# ------------------------------------------------------------------------------
def run_interactive_animation(n_particles=15000, source='sphere', target='torus'):
    generators = {
        'sphere': generate_sphere,
        'torus': generate_torus,
        'galaxy': generate_galaxy,
        'dna': generate_dna,
    }
    
    src_func = generators.get(source, generate_sphere)
    dst_func = generators.get(target, generate_torus)
    
    src_pos, src_col = src_func(n_particles)
    dst_pos, dst_col = dst_func(n_particles)
    
    engine = ParticleMorphEngine(src_pos, dst_pos, src_col, dst_col)
    
    # Setup Matplotlib 3D Figure
    fig = plt.figure(figsize=(10, 8), facecolor='#0a0a0b')
    ax = fig.add_subplot(111, projection='3d', facecolor='#0a0a0b')
    ax.grid(False)
    ax.set_axis_off()
    
    # Subsampled scatter for fast real-time 60fps rendering in Python
    render_count = min(n_particles, 8000)
    current_pos, current_col = engine.step(0.0)
    scatter = ax.scatter(
        current_pos[:render_count, 0],
        current_pos[:render_count, 1],
        current_pos[:render_count, 2],
        c=current_col[:render_count],
        s=1.2,
        alpha=0.85,
        edgecolors='none'
    )
    
    ax.set_xlim(-5, 5)
    ax.set_ylim(-5, 5)
    ax.set_zlim(-5, 5)
    
    time_tracker = {'t': 0.0, 'progress': 0.0, 'dir': 1.0}
    
    def update(frame):
        time_tracker['t'] += 0.03
        time_tracker['progress'] += 0.008 * time_tracker['dir']
        
        if time_tracker['progress'] >= 1.0:
            time_tracker['progress'] = 1.0
            time_tracker['dir'] = -1.0
        elif time_tracker['progress'] <= 0.0:
            time_tracker['progress'] = 0.0
            time_tracker['dir'] = 1.0
            
        pos, col = engine.step(time_tracker['progress'], time=time_tracker['t'])
        
        # Update 3D coordinates & colors
        scatter._offsets3d = (pos[:render_count, 0], pos[:render_count, 1], pos[:render_count, 2])
        scatter.set_color(col[:render_count])
        
        # Subtle Orbit Camera Rotation
        ax.view_init(elev=20 + math.sin(time_tracker['t'] * 0.2) * 5, azim=frame * 0.6)
        return scatter,
        
    anim = FuncAnimation(fig, update, frames=600, interval=25, blit=False)
    plt.title(f"Python 3D Particle Morphing [{source.upper()} ➔ {target.upper()}]", color='#00f0ff', fontsize=12, pad=10)
    plt.show()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Python 3D Particle Morphing Engine")
    parser.add_argument('--source', type=str, default='sphere', choices=['sphere', 'torus', 'galaxy', 'dna'])
    parser.add_argument('--target', type=str, default='torus', choices=['sphere', 'torus', 'galaxy', 'dna'])
    parser.add_argument('--particles', type=int, default=20000, help="Number of 3D particles")
    args = parser.parse_args()
    
    print(f"Starting Python 3D Particle Simulation: {args.source} -> {args.target} ({args.particles} particles)...")
    run_interactive_animation(args.particles, args.source, args.target)
`;

export const PYTHON_OPEN3D_EXPORT_SCRIPT = `"""
================================================================================
Open3D Point Cloud (.PLY / .XYZ / .LAS) Batch Exporter & Real-Time Mesh Viewer
================================================================================
Install:
    pip install open3d numpy
Usage:
    python export_pointcloud.py
"""

import numpy as np
import open3d as o3d

def export_morph_sequence(frames=60, count=50000):
    print(f"Generating {frames} frames of high-density 3D PLY particle point clouds...")
    
    # 1. Fibonacci Sphere
    idx = np.arange(count, dtype=float) + 0.5
    phi = np.arccos(1.0 - 2.0 * idx / count)
    theta = np.pi * (1.0 + 5.0 ** 0.5) * idx
    src_pos = np.stack([3.2 * np.sin(phi) * np.cos(theta),
                        3.2 * np.sin(phi) * np.sin(theta),
                        3.2 * np.cos(phi)], axis=-1)
    
    # 2. Torus Target
    u = np.random.uniform(0, 2*np.pi, count)
    v = np.random.uniform(0, 2*np.pi, count)
    dst_pos = np.stack([(3.2 + 1.1*np.cos(v)) * np.cos(u),
                        1.1*np.sin(v),
                        (3.2 + 1.1*np.cos(v)) * np.sin(u)], axis=-1)
                        
    for i in range(frames):
        t = i / float(frames - 1)
        smooth_t = t * t * (3.0 - 2.0 * t)
        
        # Morph Position + Noise
        pos = src_pos + (dst_pos - src_pos) * smooth_t
        noise = np.sin(pos * 0.8 + i * 0.1) * (1.5 * np.sin(smooth_t * np.pi))
        pos += noise
        
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(pos)
        
        # Color Ramp (Cyan to Pink)
        colors = np.zeros_like(pos)
        colors[:, 0] = np.clip(smooth_t + 0.2 * np.sin(pos[:, 0]), 0, 1)
        colors[:, 1] = np.clip(1.0 - smooth_t * 0.8, 0, 1)
        colors[:, 2] = np.clip(0.9 * (1.0 - smooth_t) + 0.8 * smooth_t, 0, 1)
        pcd.colors = o3d.utility.Vector3dVector(colors)
        
        filename = f"particle_frame_{i:04d}.ply"
        o3d.io.write_point_cloud(filename, pcd)
        if i % 10 == 0:
            print(f"Exported frame {i}/{frames}: {filename}")
            
    print("PLY Point Cloud Sequence Export Complete!")

if __name__ == '__main__':
    export_morph_sequence()
`;

export const BLENDER_PYTHON_SCRIPT = `"""
================================================================================
Blender 3.x / 4.x Python Particle Simulation & Geometry Nodes Generator
================================================================================
Paste this script into Blender Scripting Tab and press [Run Script] (Alt+P)
"""

import bpy
import math
import numpy as np

def create_blender_particle_morph(count=30000):
    # Clear existing objects in scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    # Create Point Cloud Mesh
    mesh = bpy.data.meshes.new("ParticleMorphCloud")
    obj = bpy.data.objects.new("ParticleMorphCloud", mesh)
    bpy.context.collection.objects.link(obj)
    
    # Generate Fibonacci Sphere Vertices
    idx = np.arange(count, dtype=float) + 0.5
    phi = np.arccos(1.0 - 2.0 * idx / count)
    theta = math.pi * (1.0 + 5.0 ** 0.5) * idx
    
    verts = [
        (3.0 * math.sin(p) * math.cos(t),
         3.0 * math.sin(p) * math.sin(t),
         3.0 * math.cos(p))
        for p, t in zip(phi, theta)
    ]
    
    mesh.from_pydata(verts, [], [])
    mesh.update()
    
    # Add Glowing Emission Shader
    mat = bpy.data.materials.new(name="ParticleNeonEmission")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_emit = nodes.new(type='ShaderNodeEmission')
    node_emit.inputs['Color'].default_value = (0.0, 0.94, 1.0, 1.0)
    node_emit.inputs['Strength'].default_value = 15.0
    
    mat.node_tree.links.new(node_emit.outputs['Emission'], node_out.inputs['Surface'])
    obj.data.materials.append(mat)
    
    print(f"Successfully generated {count} particle cloud in Blender with Neon Emission Shader!")

create_blender_particle_morph(30000)
`;

// Helper to trigger direct python script download
export function downloadPythonScript(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/x-python;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
