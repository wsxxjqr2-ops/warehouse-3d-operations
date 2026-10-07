import { Line, OrbitControls, RoundedBox, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useWarehouseStore } from './store'
import type { WarehouseEntity } from './model'
import { demoSites } from './demo'

const palette = {
  ground: '#eaf2fc',
  road: '#cbd8eb',
  warehouse: '#f7f9fd',
  blue: '#286bea',
  ink: '#18243a',
}

const timeBackground: Record<string, string> = { Dawn: '#f2e6df', Day: '#eaf2fc', Dusk: '#d1d8e8', Night: '#18223a' }
const siteCameraPresets: Array<{ position: [number, number, number]; target: [number, number, number] }> = [
  { position: [30, 28, 30], target: [0, 0, 0] },
  { position: [42, 19, 28], target: [-5, 0, 0] },
  { position: [25, 19, -32], target: [-4, 0, -3] },
  { position: [18, 36, 34], target: [0, 0, 2] },
  { position: [50, 25, 26], target: [1, 0, 4] },
]

function CameraRig() {
  const { camera } = useThree()
  const controls = useRef<any>(null)
  const activeSiteCode = useWarehouseStore((state) => state.activeSiteCode)
  const siteIndex = Math.max(0, demoSites.findIndex((site) => site.code === activeSiteCode))
  const preset = siteCameraPresets[siteIndex] ?? siteCameraPresets[0]
  const appliedSite = useRef<string | null>(null)
  useEffect(() => {
    camera.position.set(...preset.position)
    camera.zoom = 14
    camera.updateProjectionMatrix()
    camera.lookAt(...preset.target)
    appliedSite.current = null
    const onCameraCommand = (event: Event) => {
      const command = (event as CustomEvent<string>).detail
      if (command === 'zoom-in') camera.zoom = Math.min(18, camera.zoom + 1.2)
      if (command === 'zoom-out') camera.zoom = Math.max(6, camera.zoom - 1.2)
      if (command === 'reset' || command === 'center') {
        camera.position.set(...preset.position)
        camera.zoom = command === 'center' ? 16 : 14
        camera.lookAt(...preset.target)
      }
      camera.updateProjectionMatrix()
    }
    window.addEventListener('warehouse-camera', onCameraCommand)
    return () => window.removeEventListener('warehouse-camera', onCameraCommand)
  }, [camera, preset])
  useFrame(() => {
    if (controls.current && appliedSite.current !== activeSiteCode) {
      camera.position.set(...preset.position)
      controls.current.target.set(...preset.target)
      controls.current.update()
      appliedSite.current = activeSiteCode
    }
  })
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minZoom={1.5} maxZoom={18} minPolarAngle={0.45} maxPolarAngle={1.2} />
}

function WarehouseShell({ siteIndex }: { siteIndex: number }) {
  const shellMode = useWarehouseStore((state) => state.shellMode)
  const siteOpacity = [1, 0.08, 0.08, 0.82, 0.88][siteIndex] ?? 1
  const roofOpacity = shellMode === 'Roof' ? siteOpacity : 0.12
  const roofColor = siteIndex < 2 ? '#2471f2' : '#edf4fb'
  const trimColor = siteIndex < 2 ? '#155ee8' : '#225bcf'
  const layoutScale: [number, number, number] = siteIndex === 1 ? [1.38, 1, 0.76] : siteIndex === 2 ? [1.5, 1, 0.72] : siteIndex === 3 ? [1.18, 1, 0.84] : siteIndex === 4 ? [0.92, 1, 0.92] : [1, 1, 1]
  return (
    <group>
      <RoundedBox args={[38, 0.25, 31]} radius={0.22} smoothness={3} position={[0, 0.12, 0]}>
        <meshStandardMaterial color="#edf3fb" roughness={0.8} />
      </RoundedBox>
      <group position={[-3, 0, 0]} scale={layoutScale}>
        <RoundedBox args={[30, 5.8, 0.35]} radius={0.12} smoothness={2} position={[0, 2.9, 14.9]}>
          <meshStandardMaterial color="#e8effa" roughness={0.82} />
        </RoundedBox>
        <RoundedBox args={[0.35, 5.8, 30]} radius={0.12} smoothness={2} position={[-14.8, 2.9, 0]}>
          <meshStandardMaterial color="#e8effa" roughness={0.82} />
        </RoundedBox>
        <mesh position={[0, 5.4, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[30.3, 0.4, 30.3]} />
          <meshBasicMaterial color={roofColor} transparent opacity={roofOpacity} />
        </mesh>
        <RoofWing position={[-7.2, 5.72, 8.2]} size={[14, 10]} color={roofColor} opacity={roofOpacity} />
        <RoofWing position={[7.0, 5.62, 8.0]} size={[10, 8]} color={roofColor} opacity={roofOpacity * 0.94} />
        {siteIndex === 0 && <RiversideCluster opacity={roofOpacity} />}
        {siteIndex === 1 && <CrossDockCanopy opacity={0.94} />}
        {siteIndex === 2 && <NorthgateBuilding />}
        {siteIndex === 3 && <ColdChainBuilding />}
        {siteIndex === 4 && <RoboticsBuilding />}
        <RoofDetails opacity={roofOpacity} color={trimColor} />
        {[-10, -3, 4, 11].map((x) => <DockDoor key={x} x={x} />)}
      </group>
      {[-10, -3, 4, 11].map((z) => <Dock key={z} z={z} />)}
      <Text position={[-4, 6.2, 15.1]} rotation={[0, Math.PI, 0]} fontSize={0.8} color={palette.blue} anchorX="center">WAREHOUSE OS</Text>
    </group>
  )
}

function RiversideCluster({ opacity }: { opacity: number }) {
  return <group>
    <RaisedWarehouseBlock position={[-8.2, 5.48, -4.0]} size={[12.5, 4.0, 10.5]} opacity={opacity} />
    <RaisedWarehouseBlock position={[3.8, 5.45, -4.6]} size={[9.5, 3.0, 9.0]} opacity={opacity * 0.98} />
    <RaisedWarehouseBlock position={[-0.5, 5.43, 7.8]} size={[17.0, 2.1, 7.4]} opacity={opacity} />
    <group position={[-12.5, 0, 10.5]}>
      <Forklift color="#f4b32f" />
      <Pallet />
    </group>
    <group position={[-16.2, 0, 7.8]} scale={0.92}>
      <Forklift color="#f4b32f" />
    </group>
    <group position={[-19.2, 0, 10.8]} scale={0.84}>
      <Forklift color="#f4b32f" />
    </group>
  </group>
}

function CrossDockCanopy({ opacity }: { opacity: number }) {
  return <group position={[0, 0, 14.2]}>
    <mesh position={[0, 5.88, 0]}>
      <boxGeometry args={[31.2, 0.24, 0.8]} />
      <meshBasicMaterial color="#1f67e8" transparent opacity={opacity} />
    </mesh>
    {[-13.5, -9, -4.5, 0, 4.5, 9, 13.5].map((x, index) => <group key={x} position={[x, 6.12, 0]} rotation={[0, 0, index % 2 ? -0.19 : 0.19]}>
      <mesh>
        <boxGeometry args={[4.5, 0.28, 0.72]} />
        <meshBasicMaterial color="#2f72eb" transparent opacity={opacity} />
      </mesh>
    </group>)}
    {[-14, -7, 0, 7, 14].map((x) => <mesh key={x} position={[x, 2.8, 14.8]}>
      <boxGeometry args={[0.18, 5.3, 0.16]} />
      <meshBasicMaterial color="#1b61dd" transparent opacity={opacity} />
    </mesh>)}
  </group>
}

function NorthgateBuilding() {
  return <group position={[0, 5.42, -1.2]}>
    <PaleWarehouseBlock size={[34, 5.0, 12]} />
    <BlueTrim width={34} depth={12} y={5.18} />
    {[-13, -8, -3, 2, 7, 12].map((x) => <DockDoor key={x} x={x} z={6.08} />)}
    <group position={[-7, -5.25, 3.8]}>
      <Pallet color="#2f72eb" />
      <Pallet color="#2f72eb" />
    </group>
    <group position={[1, -5.0, 4.2]} scale={0.9}><Forklift color="#f4b32f" /></group>
  </group>
}

function ColdChainBuilding() {
  return <group position={[0, 5.42, -1.0]}>
    <PaleWarehouseBlock size={[29, 4.2, 17]} />
    <BlueTrim width={29} depth={17} y={4.38} />
    {[-11, -5.5, 0, 5.5, 11].map((x) => <DockDoor key={x} x={x} z={8.58} />)}
    {[-9, -4, 1, 6, 11].map((x) => <CoolingUnit key={x} x={x} z={-3.5} />)}
    <group position={[-7, -6.0, 7.1]} scale={0.82}><Forklift color="#f4b32f" /></group>
    <group position={[0, -5.9, 7.1]} scale={0.78}><Forklift color="#f4b32f" /></group>
  </group>
}

function RoboticsBuilding() {
  return <group position={[0, 5.42, -0.8]}>
    <PaleWarehouseBlock size={[31, 5.8, 18]} />
    <BlueTrim width={31} depth={18} y={5.98} />
    {[-11, -5.5, 0, 5.5, 11].map((x) => <DockDoor key={x} x={x} z={9.08} />)}
    <group position={[-10, -6.0, 7.7]} scale={0.8}><Forklift color="#f4b32f" /></group>
    <group position={[3, -6.0, 7.7]} scale={0.8}><Forklift color="#f4b32f" /></group>
  </group>
}

function PaleWarehouseBlock({ size }: { size: [number, number, number] }) {
  const [width, height, depth] = size
  return <RoundedBox args={[width, height, depth]} radius={0.1} smoothness={2} position={[0, height / 2, 0]}>
    <meshStandardMaterial color="#f2f6fb" roughness={0.84} />
  </RoundedBox>
}

function BlueTrim({ width, depth, y }: { width: number; depth: number; y: number }) {
  return <group>
    <mesh position={[0, y, depth / 2 + 0.12]}><boxGeometry args={[width + 0.3, 0.24, 0.18]} /><meshBasicMaterial color="#286bea" /></mesh>
    <mesh position={[-width / 2 - 0.12, y, 0]}><boxGeometry args={[0.18, 0.24, depth + 0.3]} /><meshBasicMaterial color="#286bea" /></mesh>
    <mesh position={[width / 2 + 0.12, y, 0]}><boxGeometry args={[0.18, 0.24, depth + 0.3]} /><meshBasicMaterial color="#286bea" /></mesh>
  </group>
}

function CoolingUnit({ x, z }: { x: number; z: number }) {
  return <group position={[x, 4.65, z]}>
    <mesh><boxGeometry args={[1.7, 0.28, 1.05]} /><meshStandardMaterial color="#b7c4d6" roughness={0.76} /></mesh>
    <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.28, 0.28, 0.06, 16]} /><meshStandardMaterial color="#7d91ac" /></mesh>
  </group>
}

function RaisedWarehouseBlock({ position, size, opacity }: { position: [number, number, number]; size: [number, number, number]; opacity: number }) {
  const [width, height, depth] = size
  return <group position={position}>
    <RoundedBox args={[width, height, depth]} radius={0.12} smoothness={2} position={[0, height / 2, 0]}>
      <meshStandardMaterial color="#2f72eb" emissive="#164aa5" emissiveIntensity={0.14} transparent opacity={opacity} roughness={0.78} />
    </RoundedBox>
    <mesh position={[0, height + 0.16, 0]}>
      <boxGeometry args={[width + 0.28, 0.28, depth + 0.28]} />
      <meshBasicMaterial color="#4b86ed" transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, height + 0.33, 0]}>
      <boxGeometry args={[width * 0.86, 0.08, depth * 0.78]} />
      <meshBasicMaterial color="#75a5f5" transparent opacity={opacity * 0.76} />
    </mesh>
  </group>
}

function RoofWing({ position, size, color, opacity }: { position: [number, number, number]; size: [number, number]; color: string; opacity: number }) {
  return <group position={position}>
    <mesh>
      <boxGeometry args={[size[0], 0.22, size[1]]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, -0.12, size[1] / 2 - 0.1]}>
      <boxGeometry args={[size[0], 0.22, 0.22]} />
      <meshBasicMaterial color="#155ee8" transparent opacity={opacity} />
    </mesh>
    <mesh position={[-size[0] / 2 + 0.1, -0.12, 0]}>
      <boxGeometry args={[0.22, 0.22, size[1]]} />
      <meshBasicMaterial color="#155ee8" transparent opacity={opacity} />
    </mesh>
  </group>
}

function DockDoor({ x, z = 15.08 }: { x: number; z?: number }) {
  return <group position={[x, 2.2, z]}>
    <group>
      <mesh position={[-1.57, 0, 0]}><boxGeometry args={[0.16, 4.1, 0.13]} /><meshBasicMaterial color="#0e73ff" /></mesh>
      <mesh position={[1.57, 0, 0]}><boxGeometry args={[0.16, 4.1, 0.13]} /><meshBasicMaterial color="#0e73ff" /></mesh>
      <mesh position={[0, 1.97, 0]}><boxGeometry args={[3.3, 0.16, 0.13]} /><meshBasicMaterial color="#0e73ff" /></mesh>
      <mesh position={[0, -1.97, 0]}><boxGeometry args={[3.3, 0.16, 0.13]} /><meshBasicMaterial color="#0e73ff" /></mesh>
    </group>
    <mesh position={[0, -0.06, -0.08]}><boxGeometry args={[2.55, 3.25, 0.08]} /><meshStandardMaterial color="#d4a364" roughness={0.8} /></mesh>
    <mesh position={[0, 1.72, -0.17]}><boxGeometry args={[2.6, 0.11, 0.08]} /><meshStandardMaterial color="#f4c674" /></mesh>
  </group>
}

function RoofDetails({ opacity, color }: { opacity: number; color: string }) {
  return <group>
    <group position={[-3, 5.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><circleGeometry args={[1.35, 32]} /><meshBasicMaterial color="#f5f8ff" transparent opacity={opacity} /></mesh>
      <mesh position={[0, 0, 0.02]}><ringGeometry args={[1.0, 1.08, 32]} /><meshBasicMaterial color={color} transparent opacity={opacity} /></mesh>
      <Text position={[0, 0, 0.04]} fontSize={0.72} color={color} anchorX="center" anchorY="middle" fillOpacity={opacity}>W</Text>
    </group>
    {[-9, -3, 3, 9].map((x) => <group key={x} position={[x, 5.67, -7]}><mesh castShadow><boxGeometry args={[2.4, 0.38, 1.2]} /><meshStandardMaterial color="#b8c7df" transparent opacity={opacity} roughness={0.72} /></mesh><mesh position={[0, 0.23, 0]}><boxGeometry args={[1.35, 0.12, 0.58]} /><meshStandardMaterial color="#7f94b8" transparent opacity={opacity} /></mesh></group>)}
  </group>
}

function Dock({ z }: { z: number }) {
  return (
    <group position={[9, 0, z]}>
      <RoundedBox args={[0.18, 3.8, 3.4]} radius={0.04} smoothness={2} position={[0, 2, 0]}>
        <meshStandardMaterial color={palette.blue} />
      </RoundedBox>
      <mesh position={[-0.14, 1.9, 0]}>
        <boxGeometry args={[0.05, 3.2, 2.6]} />
        <meshStandardMaterial color="#f3b84a" emissive="#f3b84a" emissiveIntensity={0.12} />
      </mesh>
      <Text position={[0.14, 4.2, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.28} color="#586b86" anchorX="center">DOCK</Text>
    </group>
  )
}

function Yard() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 100]} />
        <meshStandardMaterial color={palette.ground} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13, 0.01, 1]} receiveShadow>
        <planeGeometry args={[32, 58]} />
        <meshStandardMaterial color={palette.road} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.02, -20]} receiveShadow>
        <planeGeometry args={[76, 7]} />
        <meshStandardMaterial color={palette.road} roughness={0.95} />
      </mesh>
      {Array.from({ length: 10 }).map((_, index) => <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[13, 0.03, -24 + index * 5.2]}>
        <planeGeometry args={[0.22, 2.7]} />
        <meshBasicMaterial color="#f6fbff" />
      </mesh>)}
      {[-20, -15, 14, 20].map((x) => <Tree key={x} x={x} z={x % 2 ? -12 : 12} />)}
      {Array.from({ length: 10 }).map((_, index) => <Tree key={`road-tree-${index}`} x={-30 + index * 5.8} z={-18} />)}
      <FenceLine />
      <RackField />
      <YardProps />
    </group>
  )
}

function FenceLine() {
  return <group position={[0, 0, -15.9]}>
    <mesh position={[0, 1.05, 0]}><boxGeometry args={[66, 0.08, 0.08]} /><meshStandardMaterial color="#a5c4c1" transparent opacity={0.78} /></mesh>
    <mesh position={[0, 0.45, 0]}><boxGeometry args={[66, 0.06, 0.06]} /><meshStandardMaterial color="#a5c4c1" transparent opacity={0.65} /></mesh>
    {Array.from({ length: 12 }).map((_, index) => <mesh key={index} position={[-30 + index * 5.6, 0.65, 0]}><cylinderGeometry args={[0.06, 0.08, 1.3, 8]} /><meshStandardMaterial color="#8db1af" /></mesh>)}
  </group>
}

function YardProps() {
  const stacks: [number, number, string][] = [
    [-23, 17, '#ddb16d'], [-20, 19, '#e5b76e'], [-17, 17, '#d9a765'], [-10, 19, '#e2ac63'], [2, 19, '#d5a05d'], [14, 17, '#dfb170'], [18, 10, '#d9a765'], [7, 18, '#2f6ceb'], [-4, -18, '#2f6ceb'],
  ]
  return <group>{stacks.map(([x, z, color], index) => <group key={`${x}-${z}`} position={[x, 0, z]}><Pallet /><mesh position={[0, 1.8, 0]} castShadow><boxGeometry args={[1.5, 1.45, 1.5]} /><meshStandardMaterial color={color} roughness={0.83} /></mesh>{index % 3 === 0 && <mesh position={[1.2, 0.9, 0.1]} castShadow><boxGeometry args={[1.1, 1.5, 1.1]} /><meshStandardMaterial color={color} roughness={0.83} /></mesh>}</group>)}</group>
}

function Tree({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}>
    <mesh position={[0, 1.6, 0]} castShadow><cylinderGeometry args={[0.1, 0.16, 2.7, 8]} /><meshStandardMaterial color="#7e8e84" /></mesh>
    <mesh position={[0, 3.2, 0]} castShadow><sphereGeometry args={[1.05, 12, 8]} /><meshStandardMaterial color="#8cc79b" roughness={0.9} /></mesh>
  </group>
}

function RackField() {
  return <group position={[-7, 0, -2]}>
    {[-8, -4, 0, 4].map((x) => <group key={x} position={[x, 0, 0]}>
      <mesh position={[0, 2.2, 0]} castShadow><boxGeometry args={[2.3, 4.4, 1.2]} /><meshStandardMaterial color="#9db2ca" roughness={0.85} /></mesh>
      {[0.7, 1.65, 2.6, 3.55].map((y, index) => <mesh key={index} position={[0, y, 0.66]}><boxGeometry args={[2.15, 0.08, 0.06]} /><meshStandardMaterial color="#286bea" /></mesh>)}
      {[0.9, 1.7, 2.5].map((y, index) => <mesh key={index} position={[0, y, 0.72]} castShadow><boxGeometry args={[0.75, 0.65, 0.72]} /><meshStandardMaterial color={index % 2 ? '#f1b766' : '#e3a45a'} /></mesh>)}
    </group>)}
  </group>
}

function SiteMarkers() {
  return <group>
    {[[4, 8], [-12, 12], [8, -8], [-2, -10]].map(([x, z], index) => <group key={`${x}-${z}`} position={[x, 0, z]}>
      <mesh position={[0, 1.25, 0]} castShadow><sphereGeometry args={[0.38, 16, 12]} /><meshStandardMaterial color="#2865e8" emissive="#2865e8" emissiveIntensity={0.15} /></mesh>
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.26, 0.72, 16]} /><meshStandardMaterial color="#2865e8" /></mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.42, 0.52, 24]} /><meshBasicMaterial color="#2865e8" transparent opacity={0.32} /></mesh>
      <Text position={[0, 1.8, 0]} fontSize={0.22} color="#2865e8" anchorX="center" outlineWidth={0.015} outlineColor="#ffffff">{index === 0 ? 'R1 · loading' : index === 1 ? 'A-03-02' : 'staged'}</Text>
    </group>)}
  </group>
}

function Entity({ entity }: { entity: WarehouseEntity }) {
  const select = useWarehouseStore((state) => state.select)
  const selectedId = useWarehouseStore((state) => state.selectedId)
  const selected = selectedId === entity.id
  const groupProps = { position: [entity.x, 0, entity.z] as [number, number, number], rotation: [0, entity.heading, 0] as [number, number, number] }
  return <group {...groupProps} onClick={(event) => { event.stopPropagation(); select(entity.id) }}>
    {entity.kind === 'truck' ? <Truck color={entity.color} /> : entity.kind === 'forklift' ? <Forklift color={entity.color} /> : <Pallet />}
    {selected && <SelectionBox color="#286bea" />}
    <group position={[0, entity.kind === 'truck' ? 3.3 : 2.5, 0]}>
      <Text fontSize={0.32} color={selected ? '#286bea' : '#25344d'} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#ffffff">{entity.label}</Text>
      <Text position={[0, -0.34, 0]} fontSize={0.18} color="#1f9a63" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#ffffff">{entity.status}</Text>
    </group>
  </group>
}

function SelectionBox({ color }: { color: string }) {
  return <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[1.5, 1.62, 32]} />
    <meshBasicMaterial color={color} transparent opacity={0.75} />
  </mesh>
}

function Truck({ color }: { color: string }) {
  return <group scale={1.35}>
    <RoundedBox args={[5.4, 1.9, 2.05]} radius={0.12} smoothness={2} position={[-0.8, 1.25, 0]} castShadow><meshStandardMaterial color="#f8fbff" emissive="#dbe7fa" emissiveIntensity={0.12} roughness={0.72} /></RoundedBox>
    <RoundedBox args={[1.7, 1.75, 1.94]} radius={0.12} smoothness={2} position={[2.65, 1.15, 0]} castShadow><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.08} roughness={0.75} /></RoundedBox>
    <mesh position={[-0.8, 1.22, 1.03]}><planeGeometry args={[4.15, 1.18]} /><meshBasicMaterial color="#f6f9fd" /></mesh>
    <mesh position={[-0.8, 1.25, 1.045]}><planeGeometry args={[2.1, 0.24]} /><meshBasicMaterial color={color} /></mesh>
    <mesh position={[-0.8, 1.0, 1.055]}><planeGeometry args={[1.35, 0.16]} /><meshBasicMaterial color="#2c3d5e" /></mesh>
    <Text position={[-0.8, 1.45, 1.07]} rotation={[0, Math.PI, 0]} fontSize={0.34} color={color} anchorX="center" outlineWidth={0.012} outlineColor="#ffffff">WARETRACK</Text>
    {[-1.65, 1.35, 2.45].map((x) => <mesh key={x} position={[x, 0.36, 0.86]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.42, 0.42, 0.18, 16]} /><meshStandardMaterial color="#293344" /></mesh>)}
    {[-1.65, 1.35, 2.45].map((x) => <mesh key={x} position={[x, 0.36, -0.86]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.42, 0.42, 0.18, 16]} /><meshStandardMaterial color="#293344" /></mesh>)}
  </group>
}

function Forklift({ color }: { color: string }) {
  return <group scale={1.18}>
    <RoundedBox args={[1.5, 0.7, 1.05]} radius={0.12} smoothness={2} position={[0, 0.7, 0]} castShadow><meshStandardMaterial color={color} /></RoundedBox>
    <mesh position={[0.7, 1.45, 0]}><boxGeometry args={[0.12, 2.3, 0.12]} /><meshStandardMaterial color="#4c596b" /></mesh>
    <mesh position={[0.86, 0.34, 0]}><boxGeometry args={[1.2, 0.08, 0.14]} /><meshStandardMaterial color="#4c596b" /></mesh>
    <mesh position={[-0.15, 1.22, 0]}><sphereGeometry args={[0.16, 12, 8]} /><meshStandardMaterial color="#efc4a1" /></mesh>
    {[-0.45, 0.48].map((x) => <mesh key={x} position={[x, 0.36, 0.58]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.16, 14]} /><meshStandardMaterial color="#273243" /></mesh>)}
    {[-0.45, 0.48].map((x) => <mesh key={x} position={[x, 0.36, -0.58]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.16, 14]} /><meshStandardMaterial color="#273243" /></mesh>)}
  </group>
}

function Pallet({ color = '#e6ae62' }: { color?: string } = {}) {
  return <group><mesh position={[0, 0.12, 0]} castShadow><boxGeometry args={[1.15, 0.18, 1.15]} /><meshStandardMaterial color="#ba8a52" /></mesh><mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[1, 1.25, 1]} /><meshStandardMaterial color={color} /></mesh></group>
}

function RouteOverlay() {
  const entities = useWarehouseStore((state) => state.entities)
  const selectedId = useWarehouseStore((state) => state.selectedId)
  const entity = entities.find((item) => item.id === selectedId)
  if (!entity || entity.route.length < 2) return null
  const points = entity.route.map(([x, z]) => [x, 0.14, z] as [number, number, number])
  return <Line points={points} color="#286bea" lineWidth={2.5} dashed dashSize={0.5} gapSize={0.24} />
}

export function WarehouseCanvas() {
  const timeOfDay = useWarehouseStore((state) => state.timeOfDay)
  const entities = useWarehouseStore((state) => state.entities)
  const activeSiteCode = useWarehouseStore((state) => state.activeSiteCode)
  const background = timeBackground[timeOfDay]
  const night = timeOfDay === 'Night'
  const siteIndex = Math.max(0, demoSites.findIndex((site) => site.code === activeSiteCode))
  return <Canvas shadows dpr={[1, 1.6]} orthographic camera={{ position: [30, 28, 30], zoom: 10, near: -100, far: 500 }} gl={{ antialias: true }} style={{ background }}>
    <color attach="background" args={[background]} />
    <fog attach="fog" args={[background, 55, 160]} />
    <ambientLight intensity={night ? 0.32 : 0.62} color={night ? '#8094d5' : '#f4f7ff'} />
    <hemisphereLight intensity={night ? 0.42 : 0.85} color={night ? '#9aa7e8' : '#ffffff'} groundColor={night ? '#17213b' : '#aabbd0'} />
    <directionalLight castShadow intensity={night ? 0.32 : 1.15} color={night ? '#8297ef' : '#fff2dc'} position={[-24, 40, 24]} shadow-mapSize={[2048, 2048]} />
    <CameraRig />
    <group position={[-12, 0, 0]}>
      <Yard />
      <WarehouseShell siteIndex={siteIndex} />
      <SiteMarkers />
      <RouteOverlay />
      {entities.map((entity) => <Entity key={entity.id} entity={entity} />)}
    </group>
  </Canvas>
}
