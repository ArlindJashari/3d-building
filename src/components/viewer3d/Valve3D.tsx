import * as THREE from 'three'
import { useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Valve } from '../../types'
import { systemStyles } from '../../styleguide'

interface Props {
  valve: Valve
  position: THREE.Vector3
  selected: boolean
  dimmed: boolean
  hovered: boolean
  onSelect: (v: Valve) => void
  onHover: (v: Valve | null) => void
}

export function Valve3D({ valve, position, selected, dimmed, hovered, onSelect, onHover }: Props) {
  const ringRef = useRef<THREE.Mesh>(null)
  const color = systemStyles[valve.systemType].hex
  const baseOpacity = dimmed ? 0.25 : 1

  useFrame((_, dt) => {
    if (!ringRef.current) return
    if (selected) {
      ringRef.current.rotation.z += dt * 1.4
    }
  })

  const handleEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(valve)
    document.body.style.cursor = 'pointer'
  }
  const handleLeave = () => {
    onHover(null)
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={position.toArray()}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(valve) }}
        onPointerOver={handleEnter}
        onPointerOut={handleLeave}
        castShadow
      >
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color={color}
          metalness={0.65}
          roughness={0.25}
          emissive={selected || hovered ? color : '#000000'}
          emissiveIntensity={selected ? 0.9 : hovered ? 0.45 : 0.1}
          transparent={baseOpacity < 1}
          opacity={baseOpacity}
        />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 0.22, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
        <meshStandardMaterial color="#cbd2d8" metalness={0.7} roughness={0.3} transparent={baseOpacity < 1} opacity={baseOpacity} />
      </mesh>

      {/* Handle wheel */}
      <mesh ref={ringRef} position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <torusGeometry args={[0.12, 0.025, 8, 24]} />
        <meshStandardMaterial color="#e2e7eb" metalness={0.6} roughness={0.4} transparent={baseOpacity < 1} opacity={baseOpacity} />
      </mesh>

      {/* Selection halo */}
      {(selected || hovered) && (
        <mesh raycast={() => null}>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshBasicMaterial color={color} transparent opacity={selected ? 0.18 : 0.08} depthWrite={false} />
        </mesh>
      )}

      {selected && (
        <Html center pointerEvents="none" zIndexRange={[40, 0]}>
          <div className="rounded-lg bg-[#0B0F15]/95 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-white shadow-floating ring-1 ring-white/15 whitespace-nowrap">
            {valve.id}
          </div>
        </Html>
      )}
    </group>
  )
}
