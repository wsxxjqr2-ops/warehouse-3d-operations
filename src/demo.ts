export type DemoSite = {
  code: string
  name: string
  address: string
  fullness: string
  fullnessValue: string
  docked: string
  stock: string
  stockDelta: string
  trucks: string
  trucksDelta: string
  inbound: string
  onTime: string
  shipment: string
  shipmentBrand: string
  destination: string
}

export const demoSites: DemoSite[] = [
  { code: 'WH-01', name: 'Riverside Hub', address: '12 Riverside Dr · Newark, NJ', fullness: '78% full', fullnessValue: '78%', docked: '1/2 docked', stock: '1,412', stockDelta: '↑ 15', trucks: '1', trucksDelta: '↑ 1', inbound: '1 inbound', onTime: '96.6%', shipment: 'TRK-2051', shipmentBrand: 'WARETRACK', destination: 'Philadelphia, PA' },
  { code: 'WH-04', name: 'Southfield Cross-Dock', address: '48 Southfield Ave · Chicago, IL', fullness: '38% full', fullnessValue: '38%', docked: '2/4 docked', stock: '610', stockDelta: '↑ 20', trucks: '2', trucksDelta: '↑ 2', inbound: '2 inbound', onTime: '96.2%', shipment: 'TRK-2205', shipmentBrand: 'WARETRACK', destination: 'Cleveland, OH' },
  { code: 'WH-02', name: 'Northgate DC', address: '702 Northgate Rd · Dallas, TX', fullness: '79% full', fullnessValue: '79%', docked: '2/4 docked', stock: '3,310', stockDelta: '↑ 35', trucks: '3', trucksDelta: '↑ 2', inbound: '3 inbound', onTime: '98.2%', shipment: 'TRK-2104', shipmentBrand: 'NORDLINE', destination: 'Austin, TX' },
  { code: 'WH-03', name: 'Eastport Cold Chain', address: '6 Harbor Pkwy · Boston, MA', fullness: '71% full', fullnessValue: '71%', docked: '2/3 docked', stock: '990', stockDelta: '↑ 20', trucks: '3', trucksDelta: '↑ 1', inbound: '1 inbound', onTime: '96.0%', shipment: 'TRK-2603', shipmentBrand: 'BLUEPEAK', destination: 'Hartford, CT' },
  { code: 'WH-05', name: 'Westgate Robotics Hub', address: '90 Westgate Blvd · Seattle, WA', fullness: '72% full', fullnessValue: '72%', docked: '2/4 docked', stock: '1,730', stockDelta: '↑ 25', trucks: '4', trucksDelta: '↑ 2', inbound: '4 inbound', onTime: '95.9%', shipment: 'TRK-2339', shipmentBrand: 'CARGOVIVA', destination: 'Tacoma, WA' },
]

export const tourSegments = [
  { start: 0, end: 10, siteIndex: 0 },
  { start: 10, end: 22, siteIndex: 1 },
  { start: 22, end: 32, siteIndex: 2 },
  { start: 32, end: 42, siteIndex: 3 },
  { start: 42, end: 53, siteIndex: 1 },
  { start: 53, end: 65, siteIndex: 4 },
  { start: 65, end: 72, siteIndex: 0 },
] as const

export const tourDuration = 72

export function siteIndexAt(time: number) {
  const normalized = ((time % tourDuration) + tourDuration) % tourDuration
  return tourSegments.find((segment) => normalized >= segment.start && normalized < segment.end)?.siteIndex ?? 0
}
