import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const nebulaVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const nebulaFrag = `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    
    // Animated noise pattern
    vec2 noiseUv = vUv * 2.0 + uTime * 0.02;
    float n = smoothNoise(noiseUv) * 0.5 + smoothNoise(noiseUv * 2.1) * 0.25;
    
    // Radial falloff
    float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * uOpacity;
    alpha *= (0.6 + n * 0.4);
    
    gl_FragColor = vec4(uColor, alpha);
  }
`

const NEBULA_DATA = [
  // Deeper background layers (Dark blues and purples)
  { color: '#1a0845', opacity: 0.09, position: [0, 0, -15], rotation: 0.0001, size: 38 },
  { color: '#0d1f4a', opacity: 0.07, position: [-8, 4, -18], rotation: -0.00015, size: 32 },
  { color: '#2a1b54', opacity: 0.10, position: [10, 6, -16], rotation: 0.0002, size: 30 },
  
  // Mid layers with nice colors (Reduced brightness)
  { color: '#e8a4c0', opacity: 0.045, position: [6, -3, -12], rotation: 0.0003, size: 26 },
  { color: '#9b72cf', opacity: 0.06, position: [-4, -5, -10], rotation: -0.00025, size: 24 },
  { color: '#5b2f8a', opacity: 0.075, position: [2, 2, -11], rotation: 0.00035, size: 28 },
  
  // Front hints (Very subtle)
  { color: '#c8d8ff', opacity: 0.035, position: [-6, 6, -9], rotation: -0.0002, size: 20 },
  { color: '#ffb3d9', opacity: 0.02, position: [8, -6, -8], rotation: 0.0004, size: 18 },
]

function NebulaMesh({ color, opacity, position, rotation: rotSpeed, size }) {
  const meshRef = useRef()
  const materialRef = useRef()

  const rgb = useMemo(() => {
    const c = new THREE.Color(color)
    return [c.r, c.g, c.b]
  }, [color])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += rotSpeed
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[size, size, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={nebulaVert}
        fragmentShader={nebulaFrag}
        uniforms={{
          uColor: { value: rgb },
          uOpacity: { value: opacity },
          uTime: { value: 0 },
        }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export default function Nebula({ count = 4 }) {
  const data = NEBULA_DATA.slice(0, count)
  return (
    <>
      {data.map((props, i) => (
        <NebulaMesh key={i} {...props} />
      ))}
    </>
  )
}
