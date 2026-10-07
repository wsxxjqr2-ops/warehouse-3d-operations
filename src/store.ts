import { create } from 'zustand'
import { initialEntities, type WarehouseEntity } from './model'

type Speed = 1 | 3 | 8
type TimeOfDay = 'Dawn' | 'Day' | 'Dusk' | 'Night'
type ShellMode = 'Cutaway' | 'Roof'
export type SiteCode = 'WH-01' | 'WH-04' | 'WH-02' | 'WH-03' | 'WH-05'

type WarehouseState = {
  entities: WarehouseEntity[]
  selectedId: string
  speed: Speed
  timeOfDay: TimeOfDay
  shellMode: ShellMode
  paused: boolean
  demoTime: number
  activeSiteCode: SiteCode
  select: (id: string) => void
  setSpeed: (speed: Speed) => void
  setTimeOfDay: (timeOfDay: TimeOfDay) => void
  setShellMode: (shellMode: ShellMode) => void
  togglePaused: () => void
  tick: (delta: number) => void
  setActiveSite: (siteCode: SiteCode) => void
}

const moveEntity = (entity: WarehouseEntity, delta: number, speed: Speed) => {
  const next = { ...entity }
  const target = next.route[next.routeIndex + 1]
  if (!target) return next
  const dx = target[0] - next.x
  const dz = target[1] - next.z
  const distance = Math.hypot(dx, dz)
  const step = next.speed * speed * delta
  next.heading = Math.atan2(dx, dz)
  if (distance <= step) {
    next.x = target[0]
    next.z = target[1]
    next.routeIndex += 1
    if (next.routeIndex >= next.route.length - 1) next.routeIndex = -1
  } else {
    next.x += (dx / distance) * step
    next.z += (dz / distance) * step
  }
  return next
}

let demoAccumulator = 0
const initialPaused = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('play') !== '1'
  : true
const initialDemoTime = typeof window !== 'undefined'
  ? Number(new URLSearchParams(window.location.search).get('t') ?? 0) || 0
  : 0
const validSiteCodes: SiteCode[] = ['WH-01', 'WH-04', 'WH-02', 'WH-03', 'WH-05']
const initialSiteCode = typeof window !== 'undefined'
  ? (validSiteCodes.includes(new URLSearchParams(window.location.search).get('site') as SiteCode)
    ? new URLSearchParams(window.location.search).get('site') as SiteCode
    : 'WH-01')
  : 'WH-01'

export const useWarehouseStore = create<WarehouseState>((set) => ({
  entities: initialEntities,
  selectedId: 'SITE-WH01',
  speed: 1,
  timeOfDay: 'Day',
  shellMode: 'Roof',
  paused: initialPaused,
  demoTime: initialDemoTime,
  activeSiteCode: initialSiteCode,
  select: (selectedId) => set({ selectedId }),
  setSpeed: (speed) => set({ speed }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setShellMode: (shellMode) => set({ shellMode }),
  togglePaused: () => set((state) => ({ paused: !state.paused })),
  setActiveSite: (activeSiteCode) => set({ activeSiteCode, selectedId: 'SITE-WH01' }),
  tick: (delta) => set((state) => {
    if (state.paused) return state
    demoAccumulator += delta
    const demoStep = demoAccumulator >= 0.1 ? demoAccumulator : 0
    if (demoStep) demoAccumulator = 0
    return { demoTime: state.demoTime + demoStep, entities: state.entities.map((entity) => moveEntity(entity, delta, state.speed)) }
  }),
}))

export const selectedEntity = (state: WarehouseState) => state.entities.find((entity) => entity.id === state.selectedId)
