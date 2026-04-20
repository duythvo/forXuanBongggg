import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  attribute float aScale;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vOpacity;
  uniform float uTime;

  void main() {
    vColor = aColor;
    
    // Per-star twinkling using seed offset
    float twinkle = sin(uTime * 1.5 + aSeed * 6.283) * 0.5 + 0.5;
    vOpacity = 0.3 + twinkle * 0.7;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aScale * (280.0 / -mvPosition.z) * (0.6 + twinkle * 0.4);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    // Soft circular point
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    
    // Glow falloff
    float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
    alpha *= alpha; // sharper core
    
    gl_FragColor = vec4(vColor, alpha * vOpacity);
  }
`

export default function StarField({ count = 3000 }) {
  const meshRef = useRef()
  const materialRef = useRef()

  const { positions, colors, scales, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const seeds = new Float32Array(count)

    // Color palette for stars
    const starColors = [
      new THREE.Color('#f5f0ff'), // cool white
      new THREE.Color('#c8d8ff'), // blue white
      new THREE.Color('#f4c97a'), // warm gold
      new THREE.Color('#e8a4c0'), // soft rose
      new THREE.Color('#9b72cf'), // violet
      new THREE.Color('#ffffff'), // pure white
    ]

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const r = 15 + Math.random() * 20
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5 // flatten
      positions[i * 3 + 2] = r * Math.cos(phi)

      const c = starColors[Math.floor(Math.random() * starColors.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      scales[i] = 0.3 + Math.random() * 1.2
      seeds[i] = Math.random() * Math.PI * 2
    }

    return { positions, colors, scales, seeds }
  }, [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return geo
  }, [positions, colors, scales, seeds])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
