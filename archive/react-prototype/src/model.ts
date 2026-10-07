export type EntityKind = 'truck' | 'forklift' | 'pallet'

export type WarehouseEntity = {
  id: string
  kind: EntityKind
  label: string
  status: string
  x: number
  z: number
  heading: number
  color: string
  route: [number, number][]
  routeIndex: number
  speed: number
  detail: Record<string, string>
}

const truckRoute: [number, number][] = [[12, 18], [8, 18], [8, 16], [14, 16], [19, 12], [21, 5]]
const truckRouteTwo: [number, number][] = [[-15, 18], [-10, 18], [-8, 16], [-4, 18], [2, 18]]
const forkliftRoute: [number, number][] = [[-21, 16], [-21, 12], [-19, 12], [-19, 7], [-22, 7], [-22, 13]]

export const initialEntities: WarehouseEntity[] = [
  {
    id: 'TRK-2051', kind: 'truck', label: 'TRK-2051', status: 'Loading', x: 12, z: 18, heading: Math.PI, color: '#2f5be0', route: truckRoute, routeIndex: 0, speed: 0.65,
    detail: { driver: 'Noah Tanaka', shipment: '#SHP-83865', customer: 'Nimbus Home', destination: 'Providence, RI', eta: 'Done in 10 min', bay: 'R1 · WH-01', cargo: '5 / 11 pallets' },
  },
  {
    id: 'TRK-2208', kind: 'truck', label: 'TRK-2207', status: 'En route', x: -15, z: 18, heading: 0, color: '#15a6a6', route: truckRouteTwo, routeIndex: 0, speed: 0.45,
    detail: { driver: 'Maya Singh', shipment: '#SHP-83902', customer: 'Harbor Market', destination: 'Boston, MA', eta: 'Ready in 18 min', bay: 'S1 · WH-01', cargo: '2 / 8 pallets' },
  },
  {
    id: 'FL-01', kind: 'forklift', label: 'FL-01', status: 'Loading', x: -21, z: 16, heading: Math.PI / 2, color: '#f6b73c', route: forkliftRoute, routeIndex: 0, speed: 1.35,
    detail: { operator: 'R. Chen', task: 'Put-away → A-03-02', battery: '86%', load: 'LED panels · 1 pallet', distance: '2.4 km today' },
  },
  {
    id: 'FL-02', kind: 'forklift', label: 'FL-02', status: 'Charging', x: -18, z: 16, heading: 0, color: '#f6b73c', route: [[-18, 16], [-21, 16]], routeIndex: 0, speed: 0.35,
    detail: { operator: 'S. Ito', task: 'Battery charging', battery: '42%', load: 'Empty', distance: '1.1 km today' },
  },
]

export const routeFor = (entity: WarehouseEntity | undefined): [number, number][] => entity?.route ?? []
