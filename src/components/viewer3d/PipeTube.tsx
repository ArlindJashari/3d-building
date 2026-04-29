import * as THREE from 'three'
import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Pipe } from '../../types'

interface Props {
  pipe: Pipe
  start: THREE.Vector3
  end: THREE.Vector3
  selected: boolean
  dimmed: boolean
  hovered: boolean
  onSelect: (pipe: Pipe) => void
  onHover: (pipe: Pipe | null) => void
}

const UP = new THREE.Vector3(0, 1, 0)

export function PipeTube({ pipe, start, end, selected, dimmed, hovered, onSelect, onHover }: Props) {
  const { mid, len, quaternion } = useMemo(() => {
    const m = start.clone().add(end).multiplyScalar(0.5)
    const l = start.distanceTo(end)
    const dir = end.clone().sub(start).normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir)
    return { mid: m, len: l, quaternion: q }
  }, [start, end])

  const radius = pipe.systemType === 'Waste Line' ? 0.13 : 0.075
  const baseOpacity = dimmed ? 0.18 : 1
  const isHighlighted = selected || hovered

  const handlePointer = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(pipe)
    document.body.style.cursor = 'pointer'
  }

  const handleLeave = () => {
    onHover(null)
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={mid.toArray()} quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(pipe) }}
        onPointerOver={handlePointer}
        onPointerOut={handleLeave}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, len, 18]} />
        <meshStandardMaterial
          color={pipe.color}
          metalness={0.55}
          roughness={0.32}
          emissive={isHighlighted ? pipe.color : '#000000'}
          emissiveIntensity={isHighlighted ? (selected ? 0.85 : 0.4) : 0.05}
          transparent={baseOpacity < 1}
          opacity={baseOpacity}
        />
      </mesh>

      {isHighlighted && (
        <mesh raycast={() => null}>
          <cylinderGeometry args={[radius * 2.4, radius * 2.4, len, 18]} />
          <meshBasicMaterial color={pipe.color} transparent opacity={selected ? 0.18 : 0.1} depthWrite={false} />
        </mesh>
      )}

      {selected && (
        <Html
          position={[0, 0, 0]}
          center
          zIndexRange={[40, 0]}
          pointerEvents="none"
        >
          <div className="rounded-lg bg-[#0B0F15]/95 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-white shadow-floating ring-1 ring-white/15 whitespace-nowrap">
            {pipe.id}
          </div>
        </Html>
      )}
    </group>
  )
}
