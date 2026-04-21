import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;
  uniform float uOpacity;
  void main() {
    // vUv.x goes from 0 (left) to 1 (right)
    // We want the head at right (1.0), tail fading to left (0.0)
    float tail = smoothstep(0.0, 1.0, vUv.x);
    // Vertical center glow
    float glow = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
    // Head bright peak
    float head = smoothstep(0.95, 1.0, vUv.x);
    
    float alpha = (tail * glow + head * 2.0) * uOpacity;
    
    // Core color white, tail slightly blue/purple
    vec3 color = mix(vec3(0.5, 0.7, 1.0), vec3(1.0, 1.0, 1.0), vUv.x);
    
    gl_FragColor = vec4(color, alpha);
  }
`

function ShootingStar() {
  const meshRef = useRef()
  const materialRef = useRef()
  // Store state locally to avoid re-renders
  const state = useRef({
    x: 0, y: 0, z: 0,
    speed: 0, angle: 0, length: 0,
    opacity: 0, active: false, timer: 0, delay: Math.random() * 5,
    fadeRate: 0.5
  })

  useFrame((_, delta) => {
    const s = state.current
    if (!s.active) {
      s.timer += delta
      if (s.timer > s.delay) {
        s.active = true
        s.opacity = 1
        
        const isMobile = window.innerWidth <= 768;
        // Randomize start pos on right/top side
        const isRightStart = Math.random() > 0.3
        
        if (isRightStart) {
            // Giảm toạ độ X trên mobile để sao băng bắt đầu ngay mép màn hình chứ không bị tít ngoài xa
            s.x = Math.random() * (isMobile ? 5 : 10) + (isMobile ? 4 : 10) 
            s.y = Math.random() * 10 + 2
            s.angle = -(Math.random() * 0.4 + 0.1) * Math.PI // Moving left and down roughly (-18deg to -72deg)
            if (s.angle < -Math.PI) s.angle += Math.PI * 2
            s.angle = Math.PI + s.angle
        } else {
            s.x = (Math.random() - 0.5) * (isMobile ? 8 : 20)
            s.y = 10 + Math.random() * 5
            s.angle = -Math.PI / 2 - (Math.random() - 0.5) * 0.8
        }
        // Bring them closer to the camera so they are bigger: Z between -5 and 2
        s.z = (Math.random() - 0.5) * 7 - 1.5 
        
        // Varying speeds: 40% chance of being very slow, 60% medium/fast
        const isSlow = Math.random() < 0.4;
        s.speed = isSlow ? (Math.random() * 4 + 2) : (Math.random() * 15 + 10)
        
        // Slow stars fade out very slowly to let them glide, fast stars fade quicker
        s.fadeRate = isSlow ? (Math.random() * 0.15 + 0.1) : (Math.random() * 0.4 + 0.3)
        
        // Base length
        s.length = Math.random() * 8 + 6
      }
      if (meshRef.current) meshRef.current.visible = false
      return
    }

    if (meshRef.current) meshRef.current.visible = true
    s.x += Math.cos(s.angle) * s.speed * delta
    s.y += Math.sin(s.angle) * s.speed * delta
    s.opacity -= delta * s.fadeRate // Varying fade based on speed

    if (s.opacity <= 0) {
      s.active = false
      s.timer = 0
      s.delay = Math.random() * 6 + 2
    }

    if (meshRef.current) {
        meshRef.current.position.set(s.x, s.y, s.z)
        meshRef.current.rotation.z = s.angle
        // Scale length by speed and opacity. Make them generally thicker.
        const currentLength = s.length * (0.3 + s.opacity * 0.7)
        meshRef.current.scale.set(currentLength, 0.28, 1)
    }
    
    if (materialRef.current) {
        materialRef.current.uniforms.uOpacity.value = s.opacity
    }
  })

  // Geometry is 0-1 mapped so tail is at 0, head is at 1
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
            uOpacity: { value: 0 }
        }}
        transparent 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </mesh>
  )
}

export default function ShootingStars({ count = 8 }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => <ShootingStar key={i} />)}
    </group>
  )
}
