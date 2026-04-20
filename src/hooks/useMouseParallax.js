import { useEffect, useRef } from 'react'

export function useMouseParallax(maxOffset = 0.8) {
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to -1..1
      target.current.x = ((e.clientX / window.innerWidth) * 2 - 1) * maxOffset
      target.current.y = (-(e.clientY / window.innerHeight) * 2 + 1) * maxOffset * 0.6
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [maxOffset])

  return { target, current }
}
