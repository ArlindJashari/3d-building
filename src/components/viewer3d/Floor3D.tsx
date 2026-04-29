import * as THREE from 'three'
import { Suspense, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FLOOR_W, FLOOR_D, SLAB_T } from './constants'
import type { HeroSceneBindings, ScenePickPayload } from './heroSceneBindings'

interface Props {
  name: string
  y: number
  isSelected: boolean
  isVisible: boolean
  isMechanical: boolean
  onClick: (name: string) => void
  heroBindings: HeroSceneBindings | null
  onScenePick: (payload: ScenePickPayload) => void
}

const QUATERNIUS_OBJ_BASE = '/assets/quaternius/Ultimate%20House%20Interior%20Pack%20-%20June%202020/OBJ'
const ROOM_HEIGHT = 1.05
const HERO_WALL_HEIGHT = 0.85
const WALL_THICKNESS = 0.08

// Apartment grid: 3 across X, 2 across Z (six units per floor in reference style)
const UNIT_W = (FLOOR_W - 0.4) / 3
const UNIT_D = (FLOOR_D - 0.4) / 2
const HERO_GRID = { col: 1, row: 1 } // front-row middle unit (closest to camera)

const unitCenter = (col: number, row: number): [number, number] => [
  -FLOOR_W / 2 + 0.2 + UNIT_W * (col + 0.5),
  -FLOOR_D / 2 + 0.2 + UNIT_D * (row + 0.5),
]

export function Floor3D({ name, y, isSelected, isVisible, isMechanical, onClick, heroBindings, onScenePick }: Props) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick(name)
  }

  const slabColor = isSelected ? '#1a232f' : isMechanical ? '#0c1219' : '#0f1620'

  return (
    <group>
      {/* Concrete slab */}
      <mesh
        position={[0, y, 0]}
        onClick={isVisible ? handleClick : undefined}
        onPointerOver={
          isVisible
            ? (e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }
            : undefined
        }
        onPointerOut={isVisible ? () => { document.body.style.cursor = 'auto' } : undefined}
        raycast={isVisible ? undefined : () => null}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[FLOOR_W, SLAB_T, FLOOR_D]} />
        <meshStandardMaterial
          color={slabColor}
          metalness={0.18}
          roughness={0.78}
          transparent
          opacity={isVisible ? (isSelected ? 1 : 0.85) : 0.12}
        />
      </mesh>

      {/* Slab top edge highlight */}
      <Line
        points={[
          [-FLOOR_W / 2, y + SLAB_T / 2 + 0.001, -FLOOR_D / 2],
          [FLOOR_W / 2, y + SLAB_T / 2 + 0.001, -FLOOR_D / 2],
          [FLOOR_W / 2, y + SLAB_T / 2 + 0.001, FLOOR_D / 2],
          [-FLOOR_W / 2, y + SLAB_T / 2 + 0.001, FLOOR_D / 2],
          [-FLOOR_W / 2, y + SLAB_T / 2 + 0.001, -FLOOR_D / 2],
        ]}
        color={isSelected ? '#7a8896' : '#283341'}
        lineWidth={isSelected ? 1.4 : 0.8}
        transparent
        opacity={isVisible ? 0.7 : 0.12}
        raycast={isVisible ? undefined : () => null}
      />

      {/* Floor label */}
      {isVisible && (
        <Html
          position={[-FLOOR_W / 2 - 0.6, y + SLAB_T / 2, 0]}
          center
          pointerEvents="none"
          zIndexRange={[10, 0]}
        >
          <div
            className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
              isSelected
                ? 'bg-accent-blue text-white shadow-floating-inverse ring-1 ring-white/30'
                : isMechanical
                  ? 'bg-white/10 text-white/55 ring-1 ring-white/10'
                  : 'bg-white/5 text-white/45 ring-1 ring-white/5'
            }`}
          >
            {name.replace('Floor ', 'F')}
          </div>
        </Html>
      )}

      {/* Apartments and walls */}
      {isVisible && !isMechanical && (
        <ApartmentGrid
          y={y}
          isSelected={isSelected}
          floorName={name}
          heroBindings={heroBindings}
          onScenePick={onScenePick}
        />
      )}
    </group>
  )
}

function ApartmentGrid({
  y,
  isSelected,
  floorName,
  heroBindings,
  onScenePick,
}: {
  y: number
  isSelected: boolean
  floorName: string
  heroBindings: HeroSceneBindings | null
  onScenePick: (payload: ScenePickPayload) => void
}) {
  const units = useMemo(() => {
    const items: Array<{ col: number; row: number; isHero: boolean }> = []
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        items.push({ col, row, isHero: col === HERO_GRID.col && row === HERO_GRID.row })
      }
    }
    return items
  }, [])

  return (
    <group>
      {units.map((u) => (
        <ApartmentUnit
          key={`${u.col}-${u.row}`}
          col={u.col}
          row={u.row}
          y={y}
          isHero={u.isHero}
          isSelectedFloor={isSelected}
          floorName={floorName}
          heroBindings={heroBindings}
          onScenePick={onScenePick}
        />
      ))}
    </group>
  )
}

function ApartmentUnit({
  col,
  row,
  y,
  isHero,
  isSelectedFloor,
  floorName,
  heroBindings,
  onScenePick,
}: {
  col: number
  row: number
  y: number
  isHero: boolean
  isSelectedFloor: boolean
  floorName: string
  heroBindings: HeroSceneBindings | null
  onScenePick: (payload: ScenePickPayload) => void
}) {
  const [cx, cz] = unitCenter(col, row)
  const fy = y + SLAB_T / 2
  const baseHeight = isHero ? HERO_WALL_HEIGHT : ROOM_HEIGHT
  const wallY = fy + baseHeight / 2
  const halfW = UNIT_W / 2
  const halfD = UNIT_D / 2

  const wallOpacity = isSelectedFloor ? (isHero ? 0.92 : 0.78) : 0.32
  const interiorVisible = isSelectedFloor

  // The hero unit on a selected floor opens its near walls (the corner facing the camera).
  const cutFront = isHero && isSelectedFloor // remove +Z wall (closest to camera)
  const cutSide = isHero && isSelectedFloor  // remove +X wall (right side facing camera)

  return (
    <group>
      {/* Floor finish — pickable on hero floor for presentation context */}
      <mesh
        position={[cx, fy + 0.005, cz]}
        receiveShadow
        raycast={isHero && isSelectedFloor ? undefined : () => null}
        onClick={
          isHero && isSelectedFloor
            ? (e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation()
                onScenePick({
                  kind: 'context',
                  title: 'Unit floor plate',
                  detail: `Finished floor in the hero unit on ${floorName}. Slopes to drain at wet areas; scan below before coring.`,
                })
              }
            : undefined
        }
        onPointerOver={
          isHero && isSelectedFloor
            ? (e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }
            : undefined
        }
        onPointerOut={isHero && isSelectedFloor ? () => { document.body.style.cursor = 'auto' } : undefined}
      >
        <boxGeometry args={[UNIT_W - 0.06, 0.015, UNIT_D - 0.06]} />
        <meshStandardMaterial
          color={isHero ? '#1d2731' : '#161e28'}
          metalness={0.25}
          roughness={0.62}
          transparent
          opacity={interiorVisible ? 1 : 0.4}
        />
      </mesh>

      {/* Back wall (-Z) - kept */}
      <SolidWall
        position={[cx, wallY, cz - halfD + WALL_THICKNESS / 2]}
        size={[UNIT_W, baseHeight, WALL_THICKNESS]}
        opacity={wallOpacity * 0.9}
        accent={isHero}
      />
      {/* Front wall (+Z) - removed for hero so we see inside */}
      {!cutFront && (
        <SolidWall
          position={[cx, wallY, cz + halfD - WALL_THICKNESS / 2]}
          size={[UNIT_W, baseHeight, WALL_THICKNESS]}
          opacity={wallOpacity}
          accent={isHero}
        />
      )}
      {/* Left wall (-X) - kept */}
      <SolidWall
        position={[cx - halfW + WALL_THICKNESS / 2, wallY, cz]}
        size={[WALL_THICKNESS, baseHeight, UNIT_D]}
        opacity={wallOpacity}
        accent={isHero}
      />
      {/* Right wall (+X) - shorter for hero so the corner reads as a cutaway */}
      {!cutSide && (
        <SolidWall
          position={[cx + halfW - WALL_THICKNESS / 2, wallY, cz]}
          size={[WALL_THICKNESS, baseHeight, UNIT_D]}
          opacity={wallOpacity}
          accent={isHero}
        />
      )}

      {/* Window strips on the back wall for ambient warm glow */}
      {interiorVisible && (
        <>
          {[-1, 0, 1].map((i) => (
            <mesh
              key={i}
              position={[cx + i * (UNIT_W * 0.28), wallY + 0.05, cz + halfD - 0.06]}
              raycast={() => null}
            >
              <boxGeometry args={[UNIT_W * 0.22, ROOM_HEIGHT * 0.42, 0.02]} />
              <meshBasicMaterial color={isHero ? '#f6c887' : '#a3b6c9'} transparent opacity={isHero ? 0.32 : 0.16} />
            </mesh>
          ))}
        </>
      )}

      {/* Interior content */}
      {interiorVisible && (
        <Suspense fallback={null}>
          <UnitInterior cx={cx} cz={cz} fy={fy} isHero={isHero} floorName={floorName} onScenePick={onScenePick} />
        </Suspense>
      )}

      {/* Hero unit: ceiling slab raised for an exploded cutaway feel */}
      {cutFront && heroBindings && (
        <ExplodedCeiling cx={cx} cz={cz} fy={fy} halfW={halfW} halfD={halfD} floorName={floorName} onScenePick={onScenePick} />
      )}
      {cutFront && heroBindings && (
        <HeroBathroomCore cx={cx} cz={cz} fy={fy} floorName={floorName} onScenePick={onScenePick} />
      )}
      {cutFront && heroBindings && (
        <HeroPipes cx={cx} cz={cz} fy={fy} bindings={heroBindings} onScenePick={onScenePick} />
      )}
    </group>
  )
}

function SolidWall({
  position,
  size,
  opacity,
  accent,
}: {
  position: [number, number, number]
  size: [number, number, number]
  opacity: number
  accent: boolean
}) {
  return (
    <mesh position={position} castShadow receiveShadow raycast={() => null}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={accent ? '#1c252f' : '#141c25'}
        metalness={0.18}
        roughness={0.7}
        transparent
        opacity={opacity}
      />
    </mesh>
  )
}

function UnitInterior({
  cx,
  cz,
  fy,
  isHero,
  floorName,
  onScenePick,
}: {
  cx: number
  cz: number
  fy: number
  isHero: boolean
  floorName: string
  onScenePick: (payload: ScenePickPayload) => void
}) {
  const pickCtx = (title: string, detail: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onScenePick({ kind: 'context', title, detail })
  }

  if (isHero) {
    // Hero unit: kitchen counter on left side, neighbouring corridor.
    return (
      <group>
        <group onClick={pickCtx('Kitchen cabinets', 'Base cabinets conceal branch valves and P-trap access. Remove drawers before acoustic scan.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
          <InteriorObj name="Kitchen_Cabinet1" position={[cx - UNIT_W * 0.32, fy, cz - UNIT_D * 0.18]} scale={0.5} rotation={[0, Math.PI / 2, 0]} />
        </group>
        <group onClick={pickCtx('Range / oven', 'Gas or electric appliance zone — coordinate shut-off with utility map before pulling unit.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
          <InteriorObj name="Kitchen_Oven" position={[cx - UNIT_W * 0.32, fy, cz + UNIT_D * 0.05]} scale={0.5} rotation={[0, Math.PI / 2, 0]} />
        </group>
        <group onClick={pickCtx('Refrigerator', 'Ice-maker saddle valves are a common hidden leak — check supply at rear panel.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
          <InteriorObj name="Kitchen_Fridge" position={[cx - UNIT_W * 0.32, fy, cz + UNIT_D * 0.28]} scale={0.5} rotation={[0, Math.PI / 2, 0]} />
        </group>
        <group onClick={pickCtx('Ceiling light', `General lighting for ${floorName} hero unit — not on emergency circuit.`)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
          <InteriorObj name="Light_Ceiling1" position={[cx + UNIT_W * 0.18, fy + ROOM_HEIGHT - 0.12, cz + UNIT_D * 0.2]} scale={0.32} />
        </group>
      </group>
    )
  }

  // Decorate other units with random furniture combinations so each room reads differently.
  const seed = (cx * 13 + cz * 7) | 0
  const variant = Math.abs(seed) % 4

  const ctx = (title: string, detail: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onScenePick({ kind: 'context', title, detail: `${detail} (${floorName})` })
  }

  return (
    <group>
      {variant === 0 && (
        <>
          <group onClick={ctx('Bedroom', 'Primary sleeping zone — check baseboard heat and outlet circuits before wall demo.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Bed_King" position={[cx, fy, cz + UNIT_D * 0.1]} scale={0.5} rotation={[0, Math.PI, 0]} />
          </group>
          <group onClick={ctx('Nightstand', 'Low voltage only in typical build — confirm before anchoring heavy hardware.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="NightStand_1" position={[cx + UNIT_W * 0.32, fy, cz + UNIT_D * 0.28]} scale={0.42} />
          </group>
          <group onClick={ctx('Plant / decor', 'Non-structural — safe for quick layout scans.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Houseplant_3" position={[cx - UNIT_W * 0.36, fy, cz - UNIT_D * 0.32]} scale={0.32} />
          </group>
        </>
      )}
      {variant === 1 && (
        <>
          <group onClick={ctx('Living seating', 'Slab-on-grade or framed floor — verify radiant loops before anchoring built-ins.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Couch_Large1" position={[cx, fy, cz + UNIT_D * 0.05]} scale={0.5} rotation={[0, Math.PI, 0]} />
          </group>
          <group onClick={ctx('Side table', 'Power/USB may route through floor box — scan before coring.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Table_RoundSmall" position={[cx, fy, cz - UNIT_D * 0.18]} scale={0.46} />
          </group>
          <group onClick={ctx('Floor lamp', 'Line-voltage cord path — keep clear of door swing during work.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Light_Floor2" position={[cx + UNIT_W * 0.32, fy, cz - UNIT_D * 0.32]} scale={0.36} />
          </group>
        </>
      )}
      {variant === 2 && (
        <>
          <group onClick={ctx('Bathroom toilet', 'Stack and closet bend — coordinate with waste map before pull.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Bathroom_Toilet" position={[cx - UNIT_W * 0.18, fy, cz - UNIT_D * 0.2]} scale={0.42} rotation={[0, Math.PI / 2, 0]} />
          </group>
          <group onClick={ctx('Bathroom sink', 'Supply bibs and P-trap — photo label valves before disassembly.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Bathroom_Sink" position={[cx + UNIT_W * 0.22, fy, cz - UNIT_D * 0.28]} scale={0.46} rotation={[0, Math.PI, 0]} />
          </group>
          <group onClick={ctx('Shower', 'Flood test and pan integrity before tile demo.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Bathroom_Shower1" position={[cx + UNIT_W * 0.28, fy, cz + UNIT_D * 0.18]} scale={0.5} />
          </group>
        </>
      )}
      {variant === 3 && (
        <>
          <group onClick={ctx('Storage', 'Drawer pack — check rear panel for low-voltage coax or alarm homerun.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Drawer_5" position={[cx - UNIT_W * 0.3, fy, cz + UNIT_D * 0.05]} scale={0.5} rotation={[0, Math.PI / 2, 0]} />
          </group>
          <group onClick={ctx('Bookshelf', 'Freestanding or lagged — verify stud engagement before loading removal.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Bookshelf" position={[cx + UNIT_W * 0.32, fy, cz - UNIT_D * 0.05]} scale={0.5} rotation={[0, -Math.PI / 2, 0]} />
          </group>
          <group onClick={ctx('Lounge seating', 'Typical 15A circuit — map outlets before partition moves.')} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
            <InteriorObj name="Couch_Medium2" position={[cx, fy, cz + UNIT_D * 0.18]} scale={0.5} rotation={[0, Math.PI, 0]} />
          </group>
        </>
      )}
    </group>
  )
}

function ExplodedCeiling({
  cx,
  cz,
  fy,
  halfW,
  halfD,
  floorName,
  onScenePick,
}: {
  cx: number
  cz: number
  fy: number
  halfW: number
  halfD: number
  floorName: string
  onScenePick: (payload: ScenePickPayload) => void
}) {
  const liftY = fy + ROOM_HEIGHT + 0.95

  return (
    <group>
      <mesh
        position={[cx, liftY, cz]}
        castShadow
        receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onScenePick({
            kind: 'context',
            title: 'Slab / ceiling plenum',
            detail: `Exploded view on ${floorName}. Above this slab: conduit, sprinkler drops, and bath vent duct. Coordinate scans before coring.`,
          })
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[UNIT_W, 0.18, UNIT_D]} />
        <meshStandardMaterial color="#1a232d" metalness={0.18} roughness={0.5} />
      </mesh>

      {/* Rim band */}
      <mesh position={[cx, liftY + 0.13, cz]} raycast={() => null}>
        <boxGeometry args={[UNIT_W + 0.04, 0.05, UNIT_D + 0.04]} />
        <meshStandardMaterial color="#0d141d" metalness={0.18} roughness={0.45} />
      </mesh>

      {/* Suspension cables (hint that the ceiling is exploded) */}
      {[
        [-halfW + 0.15, -halfD + 0.15],
        [halfW - 0.15, -halfD + 0.15],
        [-halfW + 0.15, halfD - 0.15],
        [halfW - 0.15, halfD - 0.15],
      ].map(([dx, dz], i) => (
        <Line
          key={i}
          points={[[cx + dx, fy + ROOM_HEIGHT - 0.1, cz + dz], [cx + dx, liftY - 0.12, cz + dz]]}
          color="#54616d"
          lineWidth={0.55}
          transparent
          opacity={0.5}
          raycast={() => null}
        />
      ))}
    </group>
  )
}

function HeroBathroomCore({
  cx,
  cz,
  fy,
  floorName,
  onScenePick,
}: {
  cx: number
  cz: number
  fy: number
  floorName: string
  onScenePick: (payload: ScenePickPayload) => void
}) {
  // Central core with shower, toilet, sink, mirror, towel rad, dark glass walls.
  const baseY = fy + 0.01
  const wallY = baseY + ROOM_HEIGHT / 2

  const pickWall = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onScenePick({
      kind: 'context',
      title: 'Wet wall / chase',
      detail: `Stud bay on ${floorName} packs DWV stacks and tempering lines. Scan both faces before demo — valves may sit in hallway panel instead.`,
    })
  }

  return (
    <group>
      {/* Tall back wall behind the bathroom (dark) */}
      <mesh
        position={[cx, wallY, cz - UNIT_D * 0.2]}
        castShadow
        receiveShadow
        onClick={pickWall}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[UNIT_W * 0.62, ROOM_HEIGHT, 0.08]} />
        <meshStandardMaterial color="#11181f" metalness={0.18} roughness={0.62} />
      </mesh>

      {/* Glass shower divider */}
      <mesh position={[cx - UNIT_W * 0.12, wallY, cz + UNIT_D * 0.04]} raycast={() => null}>
        <boxGeometry args={[0.04, ROOM_HEIGHT * 0.92, UNIT_D * 0.4]} />
        <meshStandardMaterial color="#cfdce5" metalness={0.18} roughness={0.05} transparent opacity={0.18} />
      </mesh>
      <mesh position={[cx + UNIT_W * 0.04, wallY - 0.08, cz - UNIT_D * 0.16]} raycast={() => null}>
        <boxGeometry args={[UNIT_W * 0.32, ROOM_HEIGHT * 0.88, 0.04]} />
        <meshStandardMaterial color="#cfdce5" metalness={0.18} roughness={0.05} transparent opacity={0.18} />
      </mesh>

      {/* Real fixtures imported from CC0 pack */}
      <Suspense fallback={null}>
        <group
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            onScenePick({
              kind: 'context',
              title: 'Shower enclosure',
              detail: 'Drain body ties into purple waste branch below slab. Flood test before re-tile.',
            })
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <InteriorObj name="Bathroom_Shower1" position={[cx - UNIT_W * 0.18, baseY, cz - UNIT_D * 0.04]} scale={0.6} rotation={[0, Math.PI / 2, 0]} />
        </group>
        <group
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            onScenePick({
              kind: 'context',
              title: 'Toilet stack',
              detail: 'Wax ring and closet bend are common leak paths — verify shut-off at supply flex before lifting.',
            })
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <InteriorObj name="Bathroom_Toilet" position={[cx + UNIT_W * 0.05, baseY, cz - UNIT_D * 0.04]} scale={0.5} rotation={[0, Math.PI, 0]} />
        </group>
        <group
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            onScenePick({
              kind: 'context',
              title: 'Vanity / lav',
              detail: 'Hot and cold branches stub through east wall. Escutcheon leaks often wick into stud pack — correlate with issue card.',
            })
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <InteriorObj name="Bathroom_Sink" position={[cx + UNIT_W * 0.22, baseY, cz - UNIT_D * 0.12]} scale={0.5} rotation={[0, Math.PI, 0]} />
        </group>
        <group
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            onScenePick({ kind: 'context', title: 'Mirror cabinet', detail: 'Surface-mounted; check for hidden med valve or receptacle routing behind.' })
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <InteriorObj name="Bathroom_Mirror1" position={[cx + UNIT_W * 0.22, baseY + 0.78, cz - UNIT_D * 0.18]} scale={0.5} rotation={[0, Math.PI, 0]} />
        </group>
        <group
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            onScenePick({ kind: 'context', title: 'Towel / accessory', detail: 'Blocking only — no MEP behind small anchors.' })
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <InteriorObj name="Bathroom_Towel" position={[cx + UNIT_W * 0.36, baseY + 0.42, cz - UNIT_D * 0.04]} scale={0.4} rotation={[0, -Math.PI / 2, 0]} />
        </group>
      </Suspense>

      {/* Towel radiator (procedural, looks like the reference) */}
      <TowelRadiator
        position={[cx + UNIT_W * 0.32, baseY + 0.6, cz + UNIT_D * 0.08]}
        onPick={(e) => {
          e.stopPropagation()
          onScenePick({
            kind: 'context',
            title: 'Towel warmer loop',
            detail: 'Hydronic or electric element — isolate from heating tab before removing trim.',
          })
        }}
      />

      {/* Warm vanity light */}
      <pointLight position={[cx + UNIT_W * 0.2, baseY + ROOM_HEIGHT - 0.2, cz - UNIT_D * 0.05]} color="#ffd29a" intensity={0.9} distance={2.6} decay={2} />
      <pointLight position={[cx - UNIT_W * 0.16, baseY + ROOM_HEIGHT - 0.2, cz + UNIT_D * 0.06]} color="#9bbfff" intensity={0.55} distance={2.4} decay={2} />
    </group>
  )
}

function HeroPipes({
  cx,
  cz,
  fy,
  bindings,
  onScenePick,
}: {
  cx: number
  cz: number
  fy: number
  bindings: HeroSceneBindings
  onScenePick: (payload: ScenePickPayload) => void
}) {
  const baseY = fy + 0.18
  const topY = fy + ROOM_HEIGHT + 0.92
  const back = cz - UNIT_D * 0.18
  const front = cz + UNIT_D * 0.34

  const cyan = '#23d1ff'
  const red = '#ff6a4d'
  const purple = '#b070ff'
  const yellow = '#facc3a'

  const pickPipe = (pipeId: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onScenePick({ kind: 'pipe', pipeId })
  }

  return (
    <group>
      {/* Floor loop running around the bathroom */}
      <NeonPipe color={cyan} points={[
        [cx - UNIT_W * 0.36, baseY, front],
        [cx + UNIT_W * 0.36, baseY, front],
        [cx + UNIT_W * 0.36, baseY, back + 0.1],
      ]} radius={0.04} onPick={pickPipe(bindings.pipeCold)} />
      <NeonPipe color={red} points={[
        [cx - UNIT_W * 0.32, baseY + 0.04, front - 0.05],
        [cx + UNIT_W * 0.32, baseY + 0.04, front - 0.05],
        [cx + UNIT_W * 0.32, baseY + 0.04, back + 0.18],
      ]} radius={0.035} onPick={pickPipe(bindings.pipeHot)} />
      <NeonPipe color={purple} points={[
        [cx - UNIT_W * 0.28, baseY - 0.02, front - 0.12],
        [cx + UNIT_W * 0.28, baseY - 0.02, front - 0.12],
      ]} radius={0.05} onPick={pickPipe(bindings.pipeWaste)} />

      {/* Verticals running through the ceiling cutout */}
      <NeonPipe color={cyan} points={[
        [cx - UNIT_W * 0.06, baseY, back + 0.14],
        [cx - UNIT_W * 0.06, topY - 0.05, back + 0.14],
        [cx - UNIT_W * 0.18, topY - 0.05, back - 0.05],
      ]} radius={0.04} onPick={pickPipe(bindings.pipeCold)} />
      <NeonPipe color={red} points={[
        [cx + UNIT_W * 0.04, baseY, back + 0.18],
        [cx + UNIT_W * 0.04, topY - 0.06, back + 0.18],
        [cx + UNIT_W * 0.18, topY - 0.06, back - 0.04],
      ]} radius={0.035} onPick={pickPipe(bindings.pipeHot)} />
      <NeonPipe color={yellow} points={[
        [cx + UNIT_W * 0.36, baseY + 0.04, back + 0.05],
        [cx + UNIT_W * 0.36, fy + ROOM_HEIGHT * 0.92, back + 0.05],
        [cx + UNIT_W * 0.36, topY - 0.05, back + 0.05],
      ]} radius={0.03} onPick={pickPipe(bindings.pipeGas)} />

      {/* Ceiling cap - run pipes along the ceiling slab */}
      <NeonPipe color={cyan} points={[
        [cx - UNIT_W * 0.18, topY - 0.05, back - 0.05],
        [cx - UNIT_W * 0.04, topY - 0.05, back - 0.05],
      ]} radius={0.04} onPick={pickPipe(bindings.pipeCold)} />
      <NeonPipe color={red} points={[
        [cx + UNIT_W * 0.18, topY - 0.06, back - 0.04],
        [cx + UNIT_W * 0.04, topY - 0.06, back - 0.04],
      ]} radius={0.035} onPick={pickPipe(bindings.pipeHot)} />

      {/* Branch valves */}
      <ValveOrb
        color={cyan}
        position={[cx - UNIT_W * 0.06, baseY + 0.4, back + 0.14]}
        onPick={(e) => {
          e.stopPropagation()
          onScenePick({ kind: 'valve', valveId: bindings.valveCold })
        }}
      />
      <ValveOrb
        color={red}
        position={[cx + UNIT_W * 0.04, baseY + 0.6, back + 0.18]}
        onPick={(e) => {
          e.stopPropagation()
          onScenePick({ kind: 'valve', valveId: bindings.valveHot })
        }}
      />
      <ValveOrb
        color={yellow}
        position={[cx + UNIT_W * 0.36, baseY + 0.5, back + 0.05]}
        warning
        onPick={(e) => {
          e.stopPropagation()
          if (bindings.issuePrimary) {
            onScenePick({ kind: 'issue', issueId: bindings.issuePrimary })
          } else {
            onScenePick({ kind: 'valve', valveId: bindings.valveGasOrUtility })
          }
        }}
      />

      {/* Issue glow at suspected leak */}
      <mesh
        position={[cx + UNIT_W * 0.04, baseY + 0.68, back + 0.18]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (bindings.issuePrimary) {
            onScenePick({ kind: 'issue', issueId: bindings.issuePrimary })
          } else {
            onScenePick({
              kind: 'context',
              title: 'Moisture zone',
              detail: 'No mapped issue on this floor — run a moisture meter sweep before opening drywall.',
            })
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#ff5744" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <pointLight position={[cx + UNIT_W * 0.04, baseY + 0.68, back + 0.18]} color="#ff5744" intensity={1.05} distance={2.5} decay={2} />
    </group>
  )
}

function NeonPipe({
  color,
  points,
  radius,
  onPick,
}: {
  color: string
  points: Array<[number, number, number]>
  radius: number
  onPick?: (e: ThreeEvent<MouseEvent>) => void
}) {
  const curve = useMemo(() => {
    const vectors = points.map((p) => new THREE.Vector3(...p))
    // 'catmullrom' + tension 0 overshoots badly on straight / collinear segments (e.g. vertical
    // gas riser), producing a huge tube that fills the viewport and blooms solid yellow.
    return new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.5)
  }, [points])

  return (
    <group
      onClick={onPick}
      onPointerOver={
        onPick
          ? (e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }
          : undefined
      }
      onPointerOut={onPick ? () => { document.body.style.cursor = 'auto' } : undefined}
    >
      <mesh raycast={() => null}>
        <tubeGeometry args={[curve, 64, radius, 12, false]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.4}
          metalness={0.4}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      {/* Wider invisible hit surface so clicks register reliably */}
      <mesh raycast={onPick ? undefined : () => null}>
        <tubeGeometry args={[curve, 32, radius * 2.8, 10, false]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      {/* Soft outer halo for bloom */}
      <mesh raycast={() => null}>
        <tubeGeometry args={[curve, 64, radius * 1.9, 12, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function ValveOrb({
  color,
  position,
  warning = false,
  onPick,
}: {
  color: string
  position: [number, number, number]
  warning?: boolean
  onPick?: (e: ThreeEvent<MouseEvent>) => void
}) {
  return (
    <group
      position={position}
      onClick={onPick}
      onPointerOver={
        onPick
          ? (e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }
          : undefined
      }
      onPointerOut={onPick ? () => { document.body.style.cursor = 'auto' } : undefined}
    >
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          metalness={0.55}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <torusGeometry args={[0.28, 0.025, 10, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} toneMapped={false} />
      </mesh>
      {warning && (
        <>
          {/* Omit distanceFactor with ortho: scale would be zoom times factor and cover the screen */}
          <Html center pointerEvents="none" zIndexRange={[30, 0]}>
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-accent-amber/50 bg-[#0B0F15]/95 text-[10px] font-bold text-accent-amber">!</div>
        </Html>
        </>
      )}
    </group>
  )
}

function TowelRadiator({
  position,
  onPick,
}: {
  position: [number, number, number]
  onPick?: (e: ThreeEvent<MouseEvent>) => void
}) {
  return (
    <group position={position} onClick={onPick} onPointerOver={onPick ? (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' } : undefined} onPointerOut={onPick ? () => { document.body.style.cursor = 'auto' } : undefined}>
      {[0, 0.18, 0.36, 0.54].map((yOffset) => (
        <mesh key={yOffset} position={[0, yOffset, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.78, 16]} />
          <meshStandardMaterial color="#c8d3df" metalness={0.78} roughness={0.22} />
        </mesh>
      ))}
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} position={[x, 0.27, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.7, 14]} />
          <meshStandardMaterial color="#a4b2bf" metalness={0.78} roughness={0.24} />
        </mesh>
      ))}
    </group>
  )
}

function InteriorObj({
  name,
  position,
  scale,
  rotation = [0, 0, 0],
}: {
  name: string
  position: [number, number, number]
  scale: number
  rotation?: [number, number, number]
}) {
  const materials = useLoader(MTLLoader, `${QUATERNIUS_OBJ_BASE}/${name}.mtl`)
  const object = useLoader(OBJLoader, `${QUATERNIUS_OBJ_BASE}/${name}.obj`, (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })

  const clone = useMemo(() => {
    const instance = object.clone()
    instance.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      const baseColor = (child.material instanceof THREE.MeshStandardMaterial ||
        child.material instanceof THREE.MeshPhongMaterial ||
        child.material instanceof THREE.MeshLambertMaterial)
        ? child.material.color.clone()
        : new THREE.Color('#9aa6b2')
      child.material = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.18,
        roughness: 0.52,
      })
    })
    return instance
  }, [object])

  return <primitive object={clone} position={position} scale={scale} rotation={rotation} />
}
