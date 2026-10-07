import { useEffect, useMemo, useRef, useState } from 'react'
import { WarehouseCanvas } from './Scene'
import { selectedEntity, useWarehouseStore, type SiteCode } from './store'
import { demoSites } from './demo'
import './styles.css'

const flow = [
  ['Gate & yard', '0 moving in the yard', '6', '⌂'],
  ['Dock & unload', '3/4 receiving doors busy', '20', '▣'],
  ['Receive & QC', '0 waiting for a scan', '2', '⌁'],
  ['Put away', '4/4 reach trucks working', '388', '↓'],
  ['Storage', '65% of 960 locations', '624', '▤'],
  ['Robots to pickers', '10/10 robots carrying pods', '10', '◇'],
  ['Pick', '0/4 stations picking', '2,741', '↗'],
  ['Pack', '14 totes on the line', '2,316', '▥'],
  ['Sort', '0 cartons to the chutes', '0', '⌗'],
  ['Load & ship', '3/4 shipping doors loading', '57', '→'],
]

const depotDetails: Record<string, {
  status: string
  capacity: string
  bays: string
  outbound: string
  putAway: string
  inventory: Array<[string, string, string]>
  forklift: string
  forkliftTask: string
  forkliftProgress: string
}> = {
  'WH-01': {
    status: '1 docked · 1 arriving · 3 staged', capacity: '1,800', bays: '2/2 busy', outbound: '23 trucks', putAway: '15 pallets',
    inventory: [['Cardboard Box (M)', '1,906', 'In Stock'], ['Plastic Container', '297', 'In Stock'], ['Safety Helmet', '212', 'Low Stock'], ['Packing Tape', '4,448', 'In Stock']],
    forklift: 'FL-01', forkliftTask: 'Loading TRK-2051 at Bay 1', forkliftProgress: '75%',
  },
  'WH-02': {
    status: '2 docked · 2 arriving · 5 staged', capacity: '4,200', bays: '4/4 busy', outbound: '21 trucks', putAway: '35 pallets',
    inventory: [['LED Panel 60×60', '1,787', 'In Stock'], ['Office Chair', '174', 'In Stock'], ['Cardboard Box (M)', '993', 'Low Stock'], ['Nitrile Gloves', '5,793', 'In Stock']],
    forklift: 'FL-03', forkliftTask: 'Loading TRK-2217 at Bay 3', forkliftProgress: '78%',
  },
}

type FleetRow = { label: string; shipment: string; status: string; value: string; tone: 'loading' | 'neutral' | 'blue' | 'orange' }
const fleetRowsBySite: Record<string, FleetRow[]> = {
  'WH-01': [
    { label: 'Bay 1', shipment: 'TRK-2051 · WareTrack', status: 'Loading', value: '2/6', tone: 'loading' },
    { label: 'Bay 2', shipment: 'No truck assigned', status: 'Available', value: '—', tone: 'neutral' },
    { label: 'Inbound', shipment: 'TRK-2207 · Bluepeak', status: 'En route', value: '3 min', tone: 'blue' },
  ],
  'WH-04': [
    { label: 'In 1', shipment: 'TRK-2205 · WareTrack', status: 'Unloading', value: '2/6', tone: 'loading' },
    { label: 'In 2', shipment: 'No truck assigned', status: 'Available', value: '—', tone: 'neutral' },
    { label: 'In 3', shipment: 'No truck assigned', status: 'Available', value: '—', tone: 'neutral' },
  ],
  'WH-02': [
    { label: 'Bay 1', shipment: 'TRK-2104 · Nordline', status: 'Unloading', value: '1/5', tone: 'loading' },
    { label: 'Bay 2', shipment: 'TRK-2014 · Nordline', status: 'Loading', value: '1/5', tone: 'loading' },
    { label: 'Bay 3', shipment: 'TRK-2658 · Cargoviva', status: 'Docking', value: 'docking', tone: 'blue' },
    { label: 'Inbound', shipment: 'TRK-2526 · WareTrack', status: 'En route', value: '2 min', tone: 'blue' },
  ],
  'WH-03': [
    { label: 'Bay 2', shipment: 'TRK-2148 · Bluepeak', status: 'Unloading', value: '3/4', tone: 'loading' },
    { label: 'Bay 1', shipment: 'TRK-2471 · Bluepeak', status: 'Unloading', value: '0/4', tone: 'loading' },
    { label: 'Bay 3', shipment: 'TRK-2603 · Bluepeak', status: 'Docking', value: 'docking', tone: 'blue' },
  ],
  'WH-05': [
    { label: 'Bay 1', shipment: 'TRK-2339 · Cargoviva', status: 'Loading', value: '1/5', tone: 'loading' },
    { label: 'Bay 2', shipment: 'TRK-2574 · Nordline', status: 'Loading', value: '0/4', tone: 'loading' },
    { label: 'Bay 3', shipment: 'TRK-2372 · WareTrack', status: 'Docking', value: 'docking', tone: 'blue' },
    { label: 'Inbound', shipment: 'TRK-2412 · Nordline', status: 'At gate', value: '2 min', tone: 'orange' },
  ],
}

const forkliftCountBySite: Record<string, string> = { 'WH-01': '1/2', 'WH-04': '2/5', 'WH-02': '2/4', 'WH-03': '2/3', 'WH-05': '1/3' }

export default function App() {
  const paused = useWarehouseStore((state) => state.paused)
  const speed = useWarehouseStore((state) => state.speed)
  const timeOfDay = useWarehouseStore((state) => state.timeOfDay)
  const shellMode = useWarehouseStore((state) => state.shellMode)
  const selected = useWarehouseStore(selectedEntity)
  const demoTime = useWarehouseStore((state) => state.demoTime)
  const activeSiteCode = useWarehouseStore((state) => state.activeSiteCode)
  const setActiveSite = useWarehouseStore((state) => state.setActiveSite)
  const tick = useWarehouseStore((state) => state.tick)
  const setSpeed = useWarehouseStore((state) => state.setSpeed)
  const setTimeOfDay = useWarehouseStore((state) => state.setTimeOfDay)
  const setShellMode = useWarehouseStore((state) => state.setShellMode)
  const togglePaused = useWarehouseStore((state) => state.togglePaused)
  const [siteMenuOpen, setSiteMenuOpen] = useState(false)
  const previous = useRef(performance.now())

  useEffect(() => {
    let frame = 0
    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - previous.current) / 1000)
      previous.current = now
      tick(delta)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [tick])

  const clock = useMemo(() => {
    const base = new Date()
    base.setHours(9, 40 + Math.floor(demoTime * 0.2), 0, 0)
    return base.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }, [demoTime])
  const siteIndex = demoSites.findIndex((candidate) => candidate.code === activeSiteCode)
  const site = demoSites[siteIndex < 0 ? 0 : siteIndex]

  return <main className="app-shell">
    <WarehouseCanvas />
    <div className="hud">
      <header className="topbar glass">
        <div className="brand"><span className="brand-mark">◆</span><strong>WareTrack</strong></div>
        <div className="search"><span>⌕</span><span className="search-placeholder">Search sites, trucks, forklifts, pallets, shipments...</span><kbd>/</kbd></div>
        <div className="top-spacer" />
        <div className="site-selector">
          <button className="site-chip" aria-label="Select warehouse site" aria-expanded={siteMenuOpen} onClick={() => setSiteMenuOpen((open) => !open)}><b>{site.code}</b><span>{site.name}</span><small>{site.fullness} · {site.docked}</small><span>⌄</span></button>
          {siteMenuOpen && <div className="site-menu glass">{demoSites.map((candidate) => <button key={candidate.code} className={candidate.code === site.code ? 'active' : ''} onClick={() => { setActiveSite(candidate.code as SiteCode); setSiteMenuOpen(false) }}><b>{candidate.code}</b><span>{candidate.name}</span><small>{candidate.fullness} · {candidate.docked}</small></button>)}</div>}
        </div>
        <div className="live-pill"><i />Live · {clock}</div>
        <button className="icon-button" aria-label="Notifications">♧</button>
        <div className="user"><span className="avatar">AC</span><span><b>Alex Chen</b><small>Operations Manager</small></span><span>⌄</span></div>
      </header>

      <section className="kpis">
        {[
          ['Stock on hand', site.stock, site.stockDelta, `pallets · ${site.code}`],
          ['Trucks on site', site.trucks, site.trucksDelta, `${site.inbound} · ${site.code}`],
          ['On-time delivery', site.onTime, '↑ 0.4%', 'last 30 days'],
        ].map(([label, value, delta, sub]) => <div className="kpi glass" key={label}><span className="kpi-icon">{label === 'Stock on hand' ? '◇' : label === 'Trucks on site' ? '▣' : '◷'}</span><div><small>{label}</small><strong>{value} <em>{delta}</em></strong><span>{sub}</span></div></div>)}
      </section>

      <aside className="left-column" aria-hidden="true">
        <section className="panel-card shift-card glass">
          <div className="panel-heading"><span>Shift in progress</span><strong>2 / 3 <span className="stars">★ ★ ★</span></strong></div>
          <p className="muted">Northgate distribution center · 09:41</p>
          <Goal label="Receive pallets" value="36 / 40" progress={90} />
          <Goal label="Ship orders on time" value="22 / 25" progress={88} good />
          <Goal label="Keep utilization above" value="85%" progress={96} good />
        </section>
        <section className="panel-card glass incident-card">
          <div className="incident-title"><span className="warning">!</span><div><b>Safety incident</b><small>Forklift FL-02 needs attention</small></div><span className="close">×</span></div>
          <p>Battery is below the safe operating threshold.</p>
          <div className="button-row"><button className="primary-button">Send to charger</button><button className="secondary-button">Dismiss</button></div>
        </section>
        <section className="panel-card glass action-card">
          <div className="panel-heading"><b>Actions</b><span className="count-badge">3</span><div className="segmented"><button className="active">Autopilot</button><button>Hands-on ×1.25</button></div></div>
          <Action label="TRK-2205 ready to unload" meta="R1 · 5 / 11 pallets" color="blue" />
          <Action label="Order ORD-1042 ready to pick" meta="LED panels · due in 18 min" color="orange" />
          <Action label="Low stock · GLV-100" meta="12 free units remaining" color="red" />
        </section>
      </aside>

      <aside className="right-column">
        <section className="panel-card glass inspector">
          {selected ? <>
            <div className="inspector-header"><span className={`object-icon ${selected.kind}`}>{selected.kind === 'truck' ? '▣' : '♜'}</span><div><small>{selected.kind === 'truck' ? 'Kestrel Logistics' : 'Reach truck · 10.5 m mast'}</small><h2>{selected.id}</h2><span>{selected.detail.driver ?? selected.detail.operator}</span></div><button className="icon-button">⊙</button><button className="icon-button" onClick={() => useWarehouseStore.getState().select('SITE-WH01')}>×</button></div>
            <div className="status-line"><span className="status-chip">{selected.status}</span><span>{selected.kind === 'truck' ? selected.detail.cargo : selected.detail.battery}</span></div>
            <div className="progress-bar"><i style={{ width: selected.kind === 'truck' ? '42%' : '68%' }} /></div>
            <div className="inspector-grid">{Object.entries(selected.detail).slice(1, 7).map(([label, value]) => <div key={label}><small>{label.replace(/_/g, ' ')}</small><b>{value}</b></div>)}</div>
            <div className="inspector-footer"><button className="secondary-button">View history</button><button className="primary-button">Follow with camera</button></div>
          </> : <DefaultInspector site={site} siteIndex={siteIndex} />}
        </section>
      </aside>

      <section className="map-controls glass" aria-label="Map controls">
        <button aria-label="Zoom in" onClick={() => window.dispatchEvent(new CustomEvent('warehouse-camera', { detail: 'zoom-in' }))}>＋</button>
        <button aria-label="Zoom out" onClick={() => window.dispatchEvent(new CustomEvent('warehouse-camera', { detail: 'zoom-out' }))}>−</button>
        <button aria-label="Reset camera" onClick={() => window.dispatchEvent(new CustomEvent('warehouse-camera', { detail: 'reset' }))}>↻</button>
        <button aria-label="Toggle labels" onClick={() => window.dispatchEvent(new CustomEvent('warehouse-camera', { detail: 'toggle-labels' }))}>⌖</button>
        <button aria-label="Center depot" onClick={() => window.dispatchEvent(new CustomEvent('warehouse-camera', { detail: 'center' }))}>⌂</button>
        <button aria-label={paused ? 'Resume simulation' : 'Pause simulation'} onClick={togglePaused}>{paused ? '▶' : 'Ⅱ'}</button>
      </section>

      <section className="view-controls glass">
        <div className="segmented wide">{(['Dawn', 'Day', 'Dusk', 'Night'] as const).map((value) => <button key={value} className={timeOfDay === value ? 'active' : ''} onClick={() => setTimeOfDay(value)}>{value}</button>)}</div>
        <div className="control-divider" />
        <div className="segmented"><button className={shellMode === 'Cutaway' ? 'active' : ''} onClick={() => setShellMode('Cutaway')}>Cutaway</button><button className={shellMode === 'Roof' ? 'active' : ''} onClick={() => setShellMode('Roof')}>Roof</button></div>
        <div className="segmented"><button className={speed === 1 ? 'active' : ''} onClick={() => setSpeed(1)}>1×</button><button className={speed === 3 ? 'active' : ''} onClick={() => setSpeed(3)}>3×</button><button className={speed === 8 ? 'active' : ''} onClick={() => setSpeed(8)}>8×</button></div>
        <button className="pause-button" onClick={togglePaused}>{paused ? '▶' : 'Ⅱ'}</button>
      </section>

      <section className="bottom-left glass tracking"><div className="tracking-title"><b>Shipment Tracking</b><span>{site.shipment} · {site.shipmentBrand}</span></div><div className="tracking-line">{['Order Confirmed', 'Picked', 'Loading 2/6', 'In transit', 'Delivered'].map((label, index) => <div className={index <= 2 ? 'track-step done' : 'track-step'} key={label}><span>{index <= 2 ? '✓' : index + 1}</span><b>{label}</b><small>{index === 0 ? '08:41' : index === 1 ? '09:08' : index === 2 ? '09:53' : index === 3 ? 'ETA 10:18' : 'ETA 10:33'}</small></div>)}<div className="shipment-summary"><b>#SHP-78442</b><span>To: {site.destination}</span><small>{site.code} · Bay 1 · 13 min left</small></div></div></section>
      <section className="bottom-right glass fleet"><div className="fleet-tabs"><b>Docks <span>{site.docked.replace(' docked', '')}</span></b><span>Forklifts <b>{forkliftCountBySite[site.code]}</b></span><span>Trucks <b>{site.trucks}</b></span><span>{site.name}</span></div>{(fleetRowsBySite[site.code] ?? fleetRowsBySite['WH-01']).map((row) => <div className="fleet-row" key={`${site.code}-${row.label}`}><span>{row.label} <small>{site.code}</small></span><b className={row.status === 'Available' ? 'free' : undefined}>{row.shipment}</b><em className={row.tone === 'neutral' ? 'neutral' : row.tone === 'blue' ? 'blue-chip' : row.tone === 'orange' ? 'warm-chip' : undefined}>{row.status}</em><strong>{row.value}</strong></div>)}</section>
      <div className="hint">Drag to orbit · scroll to zoom · click anything</div>
    </div>
  </main>
}

function Goal({ label, value, progress, good = false }: { label: string; value: string; progress: number; good?: boolean }) {
  return <div className="goal"><div><span>{label}</span><b>{value}</b></div><div className="meter"><i className={good ? 'good' : ''} style={{ width: `${progress}%` }} /></div></div>
}

function Action({ label, meta, color }: { label: string; meta: string; color: string }) {
  return <div className="action-row"><span className={`action-dot ${color}`} /><div><b>{label}</b><small>{meta}</small></div><button>Open</button></div>
}

function DepotInspector({ site }: { site: typeof demoSites[number] }) {
  const detail = depotDetails[site.code] ?? depotDetails['WH-01']
  return <div className="depot-inspector">
    <div className="depot-heading"><span className="depot-icon">◆</span><div><small>DEPOT · {site.code}</small><h2>{site.name}</h2><span>{site.address}</span></div><button className="icon-button">＋</button></div>
    <div className="depot-status"><span className="status-chip">Operational</span><span>{detail.status}</span></div>
    <div className="depot-metrics"><div><small>Stock on hand</small><b>{site.stock} / {detail.capacity}</b><i style={{ width: site.fullnessValue }} /></div><div><small>Truck bays</small><b>{detail.bays}</b><i style={{ width: '100%' }} /></div></div>
    <div className="depot-statline"><span>Inventory</span><b>{detail.outbound}</b><b>{detail.putAway}</b></div>
    <div className="inventory-list">{detail.inventory.map(([label, value, state], index) => <div className="inventory-row" key={label}><span className={`inventory-dot dot-${index}`} /><b>{label}</b><strong>{value}</strong><em className={state === 'Low Stock' ? 'low' : ''}>{state}</em></div>)}</div>
    <div className="forklift-line"><span>Forklift fleet</span><b>{detail.forklift}</b><span>{detail.forkliftTask}</span><i style={{ width: detail.forkliftProgress }} /><strong>{detail.forkliftProgress}</strong></div>
  </div>
}

function DefaultInspector({ site, siteIndex }: { site: typeof demoSites[number]; siteIndex: number }) {
  if (siteIndex === 1) return <DockInspector site={site} />
  if (siteIndex === 3) return <ShipmentInspector site={site} />
  if (siteIndex === 4) return <ForkliftInspector site={site} />
  return <DepotInspector site={site} />
}

function DockInspector({ site }: { site: typeof demoSites[number] }) {
  return <div className="depot-inspector compact-inspector">
    <div className="depot-heading"><span className="depot-icon">▣</span><div><small>DOCK BAY · {site.code}</small><h2>In 2</h2><span>Dock door with leveller</span></div><button className="icon-button">⊙</button><button className="icon-button">×</button></div>
    <div className="depot-status"><span className="status-chip warm-chip">Booked</span><span>TRK-2481 due in 3 min</span></div>
    <div className="inspector-grid dock-grid"><div><small>Truck</small><b>TRK-2481 · Cargoviva</b></div><div><small>Rear doors</small><b>2</b></div><div><small>Trucks today</small><b>5</b></div><div><small>Site</small><b>{site.name}</b></div></div>
  </div>
}

function ShipmentInspector({ site }: { site: typeof demoSites[number] }) {
  return <div className="depot-inspector compact-inspector">
    <div className="depot-heading"><span className="depot-icon">▣</span><div><small>BLUEPEAK FOODS</small><h2>{site.shipment}</h2><span>Alex · WH-03</span></div><button className="icon-button">↗</button><button className="icon-button">×</button></div>
    <div className="depot-status"><span className="status-chip blue-status">Docking</span><span>Reversing into Bay 3</span></div>
    <div className="progress-bar"><i style={{ width: '21%' }} /></div>
    <div className="inspector-grid dock-grid"><div><small>Shipment</small><b>#SHP-78472</b></div><div><small>Customer</small><b>Harbor & Co.</b></div><div><small>Destination</small><b>{site.name}</b></div><div><small>ETA</small><b>09:52 (1 min)</b></div><div><small>Speed</small><b>22 km/h</b></div><div><small>Bay</small><b>Bay 3 · {site.code}</b></div></div>
  </div>
}

function ForkliftInspector({ site }: { site: typeof demoSites[number] }) {
  return <div className="depot-inspector compact-inspector">
    <div className="depot-heading"><span className="depot-icon forklift-icon">♜</span><div><small>FORKLIFT · {site.code}</small><h2>FL-15</h2><span>Reach truck · Toyota 8FBE18</span></div><button className="icon-button">⊙</button><button className="icon-button">×</button></div>
    <div className="depot-status"><span className="status-chip">Loading truck</span><span>Loading TRK-2339 at Bay 1</span></div>
    <div className="depot-metrics"><div><small>Battery</small><b>94%</b><i style={{ width: '94%' }} /></div><div><small>Moves today</small><b>34</b><i style={{ width: '72%' }} /></div></div>
    <div className="inspector-grid dock-grid"><div><small>Carrying</small><b>Empty</b></div><div><small>Speed</small><b>4.5 km/h</b></div><div><small>Charger</small><b>C1</b></div><div><small>Site</small><b>{site.name}</b></div></div>
  </div>
}
