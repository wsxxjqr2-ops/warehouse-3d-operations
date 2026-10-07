(function () {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  let applied = false;

  function addOperationsBadge() {
    const bar = $('.bar');
    if (!bar || $('#opsMode')) return;
    const badge = document.createElement('div');
    badge.className = 'ops-mode';
    badge.id = 'opsMode';
    badge.innerHTML = '<i aria-hidden="true"></i><span>运营控制台</span>';
    bar.insertBefore(badge, $('#siteChip') || bar.firstElementChild);
  }

  function addOperationsSummary() {
    const left = $('.leftcol');
    if (!left || $('#opsSummary')) return;
    const card = document.createElement('section');
    card.className = 'ops-card glass';
    card.id = 'opsSummary';
    card.innerHTML = '<h3><span>场区控制</span><span class="pill ok">实时 · 演示数据</span></h3>' +
      '<div class="ops-grid">' +
      '<div class="ops-metric"><label>未完成订单</label><b id="opsOrders">—</b></div>' +
      '<div class="ops-metric"><label>月台负荷</label><b id="opsDocks">—</b></div>' +
      '<div class="ops-metric"><label>叉车车队</label><b id="opsForklifts">—</b></div>' +
      '<div class="ops-metric"><label>容量使用</label><b id="opsCapacity">—</b></div>' +
      '</div>' +
      '<p class="ops-note"><strong>现场运营视图。</strong> 车辆移动、库存和路线状态由本地演示数据驱动。点击车辆、托盘或月台查看实时状态。</p>';
    left.appendChild(card);
  }

  function syncOperationsSummary() {
    for (const [target, source] of [['#opsOrders', '#cOrd'], ['#opsDocks', '#cDock'], ['#opsForklifts', '#cFl'], ['#opsCapacity', '#kOcc']]) {
      const el = $(target);
      const value = ($(source)?.textContent || '—').trim();
      if (el && el.textContent !== value) el.textContent = value;
    }
  }

  function applyIndustrialSkin() {
    if (applied || !$('#hud') || $('#hud').hidden) return;
    applied = true;
    document.body.classList.add('industrial');
    const brand = $('#brand');
    if (brand) brand.onclick = (event) => event.preventDefault();
    // 上游的游戏入口隐藏，三维现场和运营面板继续运行。
    ['#townBtn', '#buildBtn', '#lvlChip', '#scoreChip', '#comboChip', '#soundBtn', '#shift', '#missions', '#incident', '#acts', '#modal'].forEach((selector) => {
      const el = $(selector);
      if (el) el.hidden = true;
    });
    addOperationsBadge();
    addOperationsSummary();
    syncOperationsSummary();
    setInterval(() => {
      syncOperationsSummary();
      if ($('#modal')) $('#modal').hidden = true;
    }, 500);
  }

  function waitForBoot() {
    if ($('#hud') && !$('#hud').hidden) applyIndustrialSkin();
    else setTimeout(waitForBoot, 100);
  }
  waitForBoot();
})();
