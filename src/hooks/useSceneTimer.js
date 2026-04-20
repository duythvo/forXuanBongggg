import { useEffect, useRef } from 'react'
import useStore from '../store/useStore'

export function useSceneTimer(scene, duration, callback) {
  const timerRef = useRef(null)
  const currentScene = useStore((s) => s.currentScene)

  useEffect(() => {
    if (currentScene === scene) {
      timerRef.current = setTimeout(callback, duration)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentScene, scene, duration, callback])
}
