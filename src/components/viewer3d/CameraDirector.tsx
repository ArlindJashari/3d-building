import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

interface Props {
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>
  desiredTarget: THREE.Vector3
  desiredPosition: THREE.Vector3
  trigger: number | string
  durationMs?: number
}

/**
 * Smoothly tweens the OrbitControls camera + target toward the desired
 * position whenever `trigger` increments. The user can keep dragging the
 * scene; tweens are non-destructive after they finish.
 */
export function CameraDirector({ controlsRef, desiredTarget, desiredPosition, trigger, durationMs = 700 }: Props) {
  const { camera } = useThree()
  const startRef = useRef<{
    fromPos: THREE.Vector3
    fromTarget: THREE.Vector3
    toPos: THREE.Vector3
    toTarget: THREE.Vector3
    startTime: number
    active: boolean
  }>({
    fromPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    startTime: 0,
    active: false,
  })

  useEffect(() => {
    if (!controlsRef.current) return
    startRef.current = {
      fromPos: camera.position.clone(),
      fromTarget: controlsRef.current.target.clone(),
      toPos: desiredPosition.clone(),
      toTarget: desiredTarget.clone(),
      startTime: performance.now(),
      active: true,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  useFrame(() => {
    const s = startRef.current
    if (!s.active || !controlsRef.current) return
    const t = Math.min(1, (performance.now() - s.startTime) / durationMs)
    // Ease-out cubic
    const k = 1 - Math.pow(1 - t, 3)
    camera.position.lerpVectors(s.fromPos, s.toPos, k)
    controlsRef.current.target.lerpVectors(s.fromTarget, s.toTarget, k)
    controlsRef.current.update()
    if (t >= 1) s.active = false
  })

  return null
}
