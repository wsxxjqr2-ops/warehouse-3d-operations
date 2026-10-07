# Video reference analysis

Source: `/Users/xxjqr/Downloads/Dilum Sanjaya - Industrial software doesn’t have to feel like industrial software  Ma... [2106424641959186432].mp4`

- Duration: 72.24 s
- Video stream: H.264, 3456 × 1990, 57.89 fps
- Normalized review frames: `/tmp/waretrack-local-frames/frame-001.jpg` through `frame-072.jpg`, one frame per second, 864 × 498
- Contact sheets: `/tmp/waretrack-local-sheets/sheet-1.jpg`, `sheet-17.jpg`, `sheet-33.jpg`, `sheet-49.jpg`, `sheet-65.jpg`
- Durable two-frames-per-second review sheets: [`reference/segment-00-10.jpg`](./reference/segment-00-10.jpg), [`reference/segment-10-20.jpg`](./reference/segment-10-20.jpg), [`reference/segment-20-30.jpg`](./reference/segment-20-30.jpg), [`reference/segment-30-40.jpg`](./reference/segment-30-40.jpg), [`reference/segment-40-50.jpg`](./reference/segment-40-50.jpg), [`reference/segment-50-60.jpg`](./reference/segment-50-60.jpg), [`reference/segment-60-72.jpg`](./reference/segment-60-72.jpg)

## Persistent composition

The UI is a fixed operations shell over a moving 3D map.

1. A rounded top navigation bar spans the viewport. It contains the WareTrack brand, a search field, a site selector, live clock, notifications, and the current operator.
2. Three compact KPI cards sit below the header on the left: stock on hand, trucks on site, and on-time delivery.
3. A right-side inspector card changes between depot, truck, forklift, and shipment details.
4. A narrow vertical map toolbar sits immediately left of the inspector.
5. The bottom-left shipment tracking card stays persistent and uses five milestone nodes plus a shipment summary.
6. The bottom-right fleet card stays persistent and switches between docks, forklifts, and trucks.
7. The 3D map uses a pale blue ground plane, saturated blue warehouse roofs and trims, white walls, pale roads, simple green trees, bright pallets, blue map pins, and white/blue delivery trucks.

## Timeline by second

| Seconds | Reference state | Implementation cue |
| --- | --- | --- |
| 0–5 | Riverside Hub close view. Blue warehouse roof, multiple loading doors, two forklifts on the left, pallets around the building, two trucks in the foreground. Inspector shows depot inventory. | `demoSites[0]`, camera cue 0 |
| 6–10 | Camera pulls toward the road and tracks a truck leaving the hub. Inspector changes to FL-01 / safety state. | camera cue 1, entity click state |
| 11–21 | Southfield Cross-Dock. Camera sweeps along a long loading wall; forklifts and trucks move between doors. | `demoSites[1]`, camera cue 2 |
| 22–32 | Northgate DC. Close passes over dock doors, trucks, blue pallets, and a forklift. Depot KPI values change. | `demoSites[2]`, camera cue 3 |
| 33–41 | Eastport Cold Chain. Camera rises over the roof, then drops toward trucks and a route overlay. | `demoSites[3]`, camera cue 3/4 |
| 42–52 | Southfield / cross-dock return. Route line and selected truck inspector remain visible while the camera orbits the yard. | selected entity + route overlay |
| 53–64 | Westgate Robotics Hub. Wider aerial view with robots/vehicles and a large white roof. | `demoSites[4]`, camera cue 4 |
| 65–72 | Riverside Hub returns for the closing shot. | `demoSites[0]`, camera cue 0 |

## Visual gaps tracked during implementation

- The reference uses a much denser asset field: more trucks, forklifts, pallet stacks, map pins, dock doors, and warehouse details than the first prototype.
- The reference inspector is narrower and usually shows depot data at the beginning of a site segment; the first prototype incorrectly opened a truck Inspector and rendered a left-side action column.
- The reference camera continuously moves between close, side, and aerial views. The standalone frontend now interpolates through seven camera cues on the full 72-second segment schedule, including the second Southfield pass.
- The first prototype used a small white warehouse and too much empty map. The current scene uses a larger saturated-blue warehouse, roof vents, four dock doors, external pallet stacks, visible forklifts, and foreground trucks.
- The latest pass adds source-shaped site overlays: a three-block Riverside cluster with three yellow forklifts, a Southfield sawtooth canopy, a long Northgate dock block, an Eastport cold-chain roof with five cooling units, and a taller Westgate robotics block. These are visual approximations of the observed silhouettes and still need camera-specific placement tuning.
