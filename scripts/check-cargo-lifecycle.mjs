import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const checks = [
  ['入库货车创建真实托盘对象', /cargoPallets=t\.cargo\.map/.test(source)],
  ['叉车从货车对象接货', /t\.g\.remove\(cargo\).*f\.g\.userData\.carriage\.add\(cargo\)/s.test(source)],
  ['暂存区不自动删除托盘', !/staging\.forEach\(s=>\{if\(!s\.pallet\)return;s\.t\+=dt;[\s\S]{0,260}world\.remove\(s\.pallet\)/.test(source)],
  ['大货车出库装车流程存在', /function tryLoadOutbound\(f\)/.test(source)],
  ['叉车交接点位于墙外月台', /truckCargoWorldX\(t,cargo\)-FORK_REACH/.test(source) && /const DOCK_SAFE_X=2\.25/.test(source)],
  ['叉车沿月台门洞轴向进出', /const pickupZ=t\.z\+cargo\.position\.z/.test(source) && /go\(pickupX,pickupZ\)/.test(source) && /const dropZ=truckCargoTargetZ/.test(source) && /go\(dropX,dropZ\)\.turn\(0\)/.test(source) && /mv\(MAINX,bayZ,true/.test(source)],
  ['装车时月台门保持开启', /b\.truck\.state==='loading'/.test(source) && /const want=b\.truck&&\(b\.truck\.state==='unloading'\|\|b\.truck\.state==='loading'/.test(source)],
  ['月台门开启时露出实体门洞', /const threshold=box\(/.test(source) && /b\.door\.visible=!openDoor/.test(source) && /b\.threshold\.visible=openDoor/.test(source)],
  ['门洞之间保留实体墙段', /walls\.frontSegments=\[\]/.test(source) && /box\(0\.35,4\.8,b-a/.test(source) && !/box\(0\.35,0\.9,b-a/.test(source)],
  ['叉车移动受墙体与门洞约束', /function forkliftPathClear\(/.test(source) && /DOOR_CENTER_CLEARANCE/.test(source) && /o\.kind==='fl'&&!forkliftPathClear/.test(source)],
  ['叉车实体包络不穿墙', /function forkliftFootprintClear\(/.test(source) && /FORKLIFT_LOCAL_X_MAX=1\.92/.test(source) && /DOOR_FOOTPRINT_HALF_WIDTH/.test(source) && /wallIntersections=forklifts\.filter\(f=>!forkliftFootprintClear/.test(source)],
  ['叉车之间保持碰撞间距', /function forkliftTrafficClear\(/.test(source) && /forkliftTrafficClear\(o,o\.x,o\.z\)/.test(source) && /o\.trafficBlocked=true/.test(source)],
  ['叉车交通死锁可安全让行', /function yieldForklift\(/.test(source) && /trafficBlockSec>1\.5/.test(source) && /驶入避让位/.test(source) && /trafficYieldUntil/.test(source) && /p\.userData\.cargoState='staged'/.test(source)],
  ['托盘保留可追溯来源', /originType:'待绑定'/.test(source) && /originType='入库货车'/.test(source) && /originType='出库暂存位'/.test(source) && /originId/.test(source)],
  ['轻量站点叉车复用托盘对象', /t\.cargoPallets=Array\.from\(\{length:n\}/.test(source) && /pallet\.parent!==carriage/.test(source) && !/function liteForklift\([\s\S]*?makePallet\(pick\(SKU_KEYS\)\)/.test(source)],
  ['轻量站点叉车保持局部坐标', /const door=\[1\.9,zl\(b\.z\)\], yard=\[9\.2,zl\(b\.z\)\]/.test(source) && /f\.x-2\.4,f\.z-hz/.test(source) && /o\.x\+\(o\.lite\?\.ox\|\|0\)/.test(source)],
  ['取货前验证货车与叉齿接触', /function truckDockReady\(/.test(source) && /function truckCargoPickupReady\(/.test(source) && /if\(!truckCargoPickupReady\(f,t,cargo\)\)/.test(source)],
  ['装车前验证货车车厢接触', /function truckCargoDropReady\(/.test(source) && /if\(!truckCargoDropReady\(f,t,targetIndex\)\)/.test(source) && /未对准 .*车厢落货位/.test(source)],
  ['拣选与装车前验证托盘接触', /function slotPickupReady\(/.test(source) && /function stagingPickupReady\(/.test(source) && /forkContactReady\(f,s\.pallet\.position\.x,s\.pallet\.position\.z,\.42\)/.test(source) && /forkContactReady\(f,st\.pallet\.position\.x,st\.pallet\.position\.z,\.42\)/.test(source) && /if\(!slotPickupReady\(f,s\)\)/.test(source) && /if\(!stagingPickupReady\(f,st\)\)/.test(source)],
  ['交接失败会释放任务占用', /t\.type===\"装车\"\)\{[\s\S]{0,180}t\.truck\.busyBy=null;t\.stage\.claimed=false/.test(source) && /abortTask\(f\)/.test(source)],
  ['车厢托盘保持可见', /box\(8,1\.0,0\.16/.test(source) && /new THREE\.PlaneGeometry\(7\.6,\.8\)/.test(source)],
  ['叉车返库保持门洞开启', /forkliftInDoor=forklifts\.some/.test(source) && /\.mv\(DOCK_SAFE_X, t\.bay\.z, true/.test(source)],
];

const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error('FAIL cargo lifecycle:', failed.join('、'));
  process.exit(1);
}
console.log('PASS cargo lifecycle:', checks.map(([name]) => name).join('、'));
