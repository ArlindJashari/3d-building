import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, OrthographicCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Building, Issue, LayerState, Pipe, Valve } from '../../types'
import { FLOOR_D, FLOOR_H, FLOOR_W } from './constants'
import { Floor3D } from './Floor3D'
import { CameraDirector } from './CameraDirector'
import { buildHeroSceneBindings, type ScenePickPayload } from './heroSceneBindings'

export type ViewMode = 'Full Building' | 'Floor Cutaway' | 'Focus'

interface Props {
  building: Building
  pipes: Pipe[]
  valves: Valve[]
  issues: Issue[]
  layers: LayerState
  selectedFloor: string
  selectedPipeId: string | null
  selectedValveId: string | null
  selectedIssueId: string | null
  viewMode: ViewMode
  onSelectFloor: (name: string) => void
  onSelectPipe: (p: Pipe) => void
  onSelectValve: (v: Valve) => void
  onSelectIssue: (i: Issue) => void
  onClearSelection: () => void
  /** Optional: fixture / ceiling clicks that are not real assets */
  onSceneContextPick?: (payload: { title: string; detail: string }) => void
}

export function Building3DCanvas(props: Props) {
  const {
    building,
    selectedFloor,
    onSelectFloor,
    pipes,
    valves,
    issues,
    onSelectPipe,
    onSelectValve,
    onSelectIssue,
    onSceneContextPick,
  } = props
  void props.onClearSelection
  void props.viewMode
  void props.layers
  void props.selectedPipeId
  void props.selectedValveId
  void props.selectedIssueId

  const floors = building.floors
  const floorIndex = useCallback((name: string) => Math.max(0, floors.indexOf(name)), [floors])
  const floorY = useCallback((name: string) => floorIndex(name) * FLOOR_H, [floorIndex])

  const isMechanical = (name: string) => name === 'Basement' || name === 'Roof'

  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const [orthoZoom, setOrthoZoom] = useState(58)

  const heroTarget = useMemo(() => new THREE.Vector3(0, floorY(selectedFloor) + 0.85, FLOOR_D * 0.26), [floorY, selectedFloor])

  const cameraPlan = useMemo(() => {
    const target = heroTarget.clone()
    const offset = new THREE.Vector3(1, Math.SQRT2, 1).normalize().multiplyScalar(28)
    const pos = target.clone().add(offset)
    return {
      position: pos,
      target,
      trigger: selectedFloor,
    }
  }, [heroTarget, selectedFloor])

  const camPositionTuple = useMemo(
    (): [number, number, number] => [cameraPlan.position.x, cameraPlan.position.y, cameraPlan.position.z],
    [cameraPlan.position.x, cameraPlan.position.y, cameraPlan.position.z],
  )

  const bindings = useMemo(
    () => buildHeroSceneBindings(selectedFloor, pipes, valves, issues),
    [selectedFloor, pipes, valves, issues],
  )

  const onScenePick = useCallback(
    (payload: ScenePickPayload) => {
      if (payload.kind === 'pipe') {
        const p = pipes.find((x) => x.id === payload.pipeId)
        if (p) onSelectPipe(p)
        return
      }
      if (payload.kind === 'valve') {
        const v = valves.find((x) => x.id === payload.valveId)
        if (v) onSelectValve(v)
        return
      }
      if (payload.kind === 'issue') {
        const i = issues.find((x) => x.id === payload.issueId)
        if (i) onSelectIssue(i)
        return
      }
      onSceneContextPick?.({ title: payload.title, detail: payload.detail })
    },
    [pipes, valves, issues, onSelectPipe, onSelectValve, onSelectIssue, onSceneContextPick],
  )

  useLayoutEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return
    ctrl.target.copy(heroTarget)
    ctrl.update()
  }, [selectedFloor, heroTarget])

  return (
    <Canvas
      shadows
      gl={{ antialias: true, toneMappingExposure: 1.05 }}
      onWheel={(e) => {
        const next = Math.max(34, Math.min(110, orthoZoom + e.deltaY * -0.04))
        setOrthoZoom(next)
      }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#05080d']} />
      <fog attach="fog" args={['#05080d', 22, 60]} />

      <OrthographicCamera makeDefault position={camPositionTuple} zoom={orthoZoom} near={-50} far={100} />

      <Environment preset="apartment" environmentIntensity={0.45} />

      <ambientLight intensity={0.18} color="#9bb3d4" />
      <hemisphereLight args={['#9ab4d8', '#05080d', 0.6]} />
      <directionalLight
        position={[14, 18, 10]}
        intensity={1.2}
        color="#dde7ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-FLOOR_W}
        shadow-camera-right={FLOOR_W}
        shadow-camera-top={FLOOR_W}
        shadow-camera-bottom={-FLOOR_W}
      />
      <directionalLight position={[-12, 10, -8]} intensity={0.4} color="#7e9aff" />

      <spotLight
        position={[heroTarget.x + 4, heroTarget.y + 6, heroTarget.z + 4]}
        angle={0.55}
        penumbra={0.85}
        intensity={2.2}
        color="#cad8ff"
        castShadow
      >
        <object3D attach="target" position={[heroTarget.x, heroTarget.y, heroTarget.z]} />
      </spotLight>

      <pointLight position={[heroTarget.x, heroTarget.y + 2.0, heroTarget.z]} color="#9fc7ff" intensity={0.55} distance={6} decay={2} />

      <ContactShadows
        position={[0, -0.36, 0]}
        opacity={0.55}
        scale={36}
        blur={2.4}
        far={3.4}
        resolution={1024}
        color="#000000"
      />

      {floors.map((name) => {
        const idx = floorIndex(name)
        const selIdx = floorIndex(selectedFloor)
        const visible = idx <= selIdx
        return (
          <Floor3D
            key={name}
            name={name}
            y={floorY(name)}
            isSelected={name === selectedFloor}
            isVisible={visible}
            isMechanical={isMechanical(name)}
            onClick={(n) => onSelectFloor(n)}
            heroBindings={bindings}
            onScenePick={onScenePick}
          />
        )
      })}

      <CameraDirector
        controlsRef={controlsRef}
        desiredPosition={cameraPlan.position}
        desiredTarget={cameraPlan.target}
        trigger={cameraPlan.trigger}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.12}
        enableZoom={false}
        enablePan
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.42}
        minAzimuthAngle={-Math.PI * 0.55}
        maxAzimuthAngle={Math.PI * 0.55}
      />

      <EffectComposer multisampling={2}>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.32}
          mipmapBlur
          radius={0.55}
        />
        <Vignette eskil={false} offset={0.32} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
