import { useEffect, useRef } from 'react'
import useStore from '../../store/useStore'

const isMobile = window.innerWidth <= 768

export default function CursorGlow() {
  const dotRef = useRef()
  const ringRef = useRef()
  const cursorState = useStore((s) => s.cursorState)
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const ring = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const rafRef = useRef()

  useEffect(() => {
    if (isMobile) return

    const move = (e) => {
      pos.current.x = e.clientX
      pos.current.y = e.clientY
    }
    window.addEventListener('mousemove', move)

    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 5}px, ${pos.current.y - 5}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 18}px, ${ring.current.y - 18}px)`
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (isMobile) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    if (cursorState === 'hover-star') {
      dot.style.transform += ' scale(1.6)'
      dot.style.background = '#f4c97a'
      dot.style.boxShadow = '0 0 28px 8px rgba(244,201,122,0.6)'
      ring.style.width = '50px'
      ring.style.height = '50px'
      ring.style.borderColor = 'rgba(244,201,122,0.5)'
    } else if (cursorState === 'hover-button') {
      dot.style.width = '6px'
      dot.style.height = '6px'
      ring.style.width = '65px'
      ring.style.height = '65px'
    } else {
      dot.style.width = '10px'
      dot.style.height = '10px'
      dot.style.background = '#f4c97a'
      dot.style.boxShadow = '0 0 20px 6px rgba(244,201,122,0.4)'
      ring.style.width = '36px'
      ring.style.height = '36px'
      ring.style.borderColor = 'rgba(244,201,122,0.25)'
    }
  }, [cursorState])

  if (isMobile) return null

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 10, height: 10,
          borderRadius: '50%',
          background: '#f4c97a',
          mixBlendMode: 'screen',
          boxShadow: '0 0 20px 6px rgba(244,201,122,0.4)',
          pointerEvents: 'none', zIndex: 9999,
          transition: 'width 0.2s, height 0.2s, box-shadow 0.2s, background 0.2s',
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 36, height: 36,
          borderRadius: '50%',
          border: '1px solid rgba(244,201,122,0.25)',
          pointerEvents: 'none', zIndex: 9998,
          transition: 'width 0.25s, height 0.25s, border-color 0.25s',
          willChange: 'transform',
        }}
      />
    </>
  )
}
