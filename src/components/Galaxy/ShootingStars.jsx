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
    float x = vUv.x;
    float y = vUv.y;
    
    float dy = abs(y - 0.5);
    
    // Tail dày và mượt hơn, không bị nhọn hoắt
    float tailCore = smoothstep(0.15, 0.0, dy) * smoothstep(0.0, 0.9, x);
    float tailGlow = smoothstep(0.4, 0.0, dy) * smoothstep(0.0, 0.9, x) * 0.6;
    
    // Đầu sao băng: Toả sáng dạng Elip bầu bĩnh (thay vì tròn vo xíu xiu)
    // Giảm tỷ lệ bóp ở X để hình dáng trông mềm mại, giống viên đạn/sao chổi 
    vec2 headPos = vec2(0.88, 0.5);
    vec2 diff = vec2((x - headPos.x) * 4.0, (y - headPos.y) * 2.0);
    float dist = length(diff);
    
    // Core sáng hơn và quầng sáng rộng
    float headCore = smoothstep(0.4, 0.0, dist) * 1.8;
    float headGlow = smoothstep(1.2, 0.0, dist);
    
    // Rìa mờ tự nhiên ôm sát mép phải để tạo phần mõm thoi (blunt front)
    float edgeMask = smoothstep(1.0, 0.92, x);
    
    float baseAlpha = (tailCore + tailGlow + headCore + headGlow) * edgeMask;
    
    // Hiệu ứng nhấp nháy lung linh nhẹ nhàng
    float shimmer = 0.85 + 0.25 * sin(uOpacity * 60.0);
    float alpha = baseAlpha * uOpacity * shimmer;
    
    vec3 color = mix(vec3(0.5, 0.7, 1.0), vec3(1.0, 1.0, 1.0), x);
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
        
        // Varying speeds: 60% chance of being very slow, 40% medium
        const isSlow = Math.random() < 0.6;
        // Tốc độ chậm ban đầu là ~2.5 đến 5.5, giờ tăng gấp 1.5 thành ~3.75 đến 8.25
        s.speed = isSlow ? ((Math.random() * 3 + 2.5) * 1.5) : (Math.random() * 5 + 6.5)
        
        // Cực kì chậm tan: cho phép sao lướt trọn vẹn màn hình
        s.fadeRate = isSlow ? (Math.random() * 0.08 + 0.05) : (Math.random() * 0.15 + 0.15)
        
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
        // Giữ nguyên chiều dài trong lúc bay để tránh lỗi scale làm mesh bị giật cục/co rút từ 2 đầu
        meshRef.current.scale.set(s.length, 0.22, 1)
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
