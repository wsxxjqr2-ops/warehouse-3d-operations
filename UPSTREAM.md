# WareTrack 上游基线与工业软件适配

这个独立项目复用作者公开 WareTrack 的 3D 现场系统代码，并在其上加了一层工业软件操作台皮肤。仓库、道路、码头、货架、托盘、卡车、叉车、路线、高亮、站点布局和实体运动保持上游实现；对外 UI 已中文化，并移除了游戏层的 SCORE、任务奖励、星级、关卡、解锁、Town/Build 购买和 Autopilot/Hands-on 玩法，改为现场运营、库存、码头、车队、订单和事件查看。

- 上游仓库：[siddik-web/waretrack](https://github.com/siddik-web/waretrack)
- 上游在线运行：[WareTrack Logistics](https://siddik-web.github.io/waretrack/)
- 原始来源快照：[`upstream/waretrack-index.html`](./upstream/waretrack-index.html)
- 当前运行入口：[`index.html`](./index.html)
- 工业软件适配层：[`industrial-ui.js`](./industrial-ui.js)、[`industrial-ui.css`](./industrial-ui.css)
- 上游固定来源提交：`f2bd7329e95629bb09e761929c7ddbf3abfa6183`
- 同步时间：2026-10-06（Asia/Shanghai）

`archive/react-prototype/` 保存早期用于视觉探路的 React + R3F 手工原型。当前页面不是视频播放器，也不是游戏 UI；演示数据仍在浏览器本地生成，用来驱动现场状态展示。
