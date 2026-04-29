import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Issue } from '../../types'

interface Props {
  issue: Issue
  position: THREE.Vector3
  selected: boolean
  dimmed: boolean
  onSelect: (i: Issue) => void
}

const SEVERITY_COLOR: Record<string, string> = {
  Emergency: '#ff3b30',
  High: '#ff5744',
  Medium: '#f39c12',
  Low: '#27ae60',
}

export function IssueBeacon3D({ issue, position, selected, dimmed, onSelect }: Props) {
  const beaconRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const color = SEVERITY_COLOR[issue.severity] ?? '#ff5744'
  const opacityFactor = dimmed ? 0.4 : 1

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = 0.5 + Math.sin(t * 4) * 0.5
    if (beaconRef.current) {
      const s = 1 + Math.sin(t * 4) * 0.08
      beaconRef.current.scale.setScalar(s)
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + pulse * 0.7
    }
    if (ring1Ref.current) {
      const phase = (t * 1.2) % 1
      ring1Ref.current.scale.setScalar(0.4 + phase * 1.6)
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - phase) * 0.6 * opacityFactor
    }
    if (ring2Ref.current) {
      const phase = ((t * 1.2) + 0.5) % 1
      ring2Ref.current.scale.setScalar(0.4 + phase * 1.6)
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - phase) * 0.5 * opacityFactor
    }
    if (lightRef.current) {
      lightRef.current.intensity = (0.7 + pulse * 0.6) * opacityFactor
    }
  })

  return (
    <group position={position.toArray()}>
      {/* Ground rings (sonar-style) */}
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} raycast={() => null}>
        <ringGeometry args={[0.25, 0.32, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.24, 0]} raycast={() => null}>
        <ringGeometry args={[0.25, 0.32, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical beam connecting beacon to floor */}
      <mesh position={[0, 0.1, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.45 * opacityFactor} depthWrite={false} />
      </mesh>

      {/* Beacon sphere */}
      <mesh
        ref={beaconRef}
        position={[0, 0.55, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(issue) }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={0.2}
          roughness={0.4}
          transparent={opacityFactor < 1}
          opacity={opacityFactor}
        />
      </mesh>

      <pointLight ref={lightRef} position={[0, 0.55, 0]} color={color} intensity={1} distance={3.5} decay={2} />

      {selected && (
        <Html
          position={[0, 0.95, 0]}
          center
          pointerEvents="none"
          zIndexRange={[60, 0]}
        >
          <div className="flex items-center gap-1.5 rounded-lg bg-[#0B0F15]/95 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-white shadow-floating ring-1 ring-white/15 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            {issue.id} · {issue.severity}
          </div>
        </Html>
      )}
    </group>
  )
}
