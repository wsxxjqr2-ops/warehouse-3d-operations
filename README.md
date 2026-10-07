# WareTrack Operations 3D Frontend

这是独立放在 `~/code/warehouse-3d-frontend` 的中文工业仓库运营前端。它复用作者 WareTrack 的真实 3D 现场实现，让仓库建筑、道路、码头、货架、托盘、卡车、叉车、路线、对象选中和站点布局保持一致；页面上呈现的是工业软件操作台，不是游戏界面，也不是视频时间轴播放器。

当前用本地演示数据驱动库存、订单、码头、车队和运输跟踪（Shipment Tracking）。运营界面的文案、站点名称、库存品名、状态和运输跟踪字段已直接改为中文源码，编码、车辆编号、SKU 编码和地址保留原始业务标识。上游来源以及“工业软件适配层”边界记录在 [UPSTREAM.md](./UPSTREAM.md)。适配层代码是 [industrial-ui.js](./industrial-ui.js) 和 [industrial-ui.css](./industrial-ui.css)。此前的手工 React 探路版本保存在 [archive/react-prototype](./archive/react-prototype)，不再作为运行入口。

## Run

```bash
cd ~/code/warehouse-3d-frontend
npm install
npm run dev
```

打开 `http://127.0.0.1:5173/`。生产构建与预览：

```bash
npm run build
npm run preview
```

## 工业软件验收重点

- 3D 现场：五个站点、仓库建筑、道路、码头、货架、托盘、卡车和叉车
- 运营状态：库存单位、容量、码头负荷、叉车车队、在途车辆、订单队列和事件日志
- 现场操作：站点切换、暂停/速度、对象选中、路线高亮、跟随镜头和 Shipment Tracking
- UI 约束：不出现 SCORE、星级、任务奖励、等级、解锁、Town planner 或游戏式 Autopilot/Hands-on

演示数据只在浏览器本地运行，不连接 `warehouse-agent` 生产服务，也不执行部署。上游原始实现使用 Three.js 与字体 CDN，后续可继续做本地资源缓存和组件拆分。
