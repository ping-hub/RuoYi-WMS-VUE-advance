<template>
  <div class="dashboard-container" ref="containerRef">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">智慧仓储可视化看板</h1>
      <div class="header-time">{{ currentTime }}</div>
      <button v-show="!exporting" class="export-btn" @click="exportImage">导出图片</button>
      <button class="fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏展示'">
        <svg v-if="!isFullscreen" viewBox="0 0 1024 1024" width="14" height="14"><path d="M192 192h192V128H128v256h64V192zM640 128v64h192v192h64V128H640zM192 640h-64v256h256v-64H192V640zM832 832H640v64h256V640h-64v192z" fill="currentColor"/></svg>
        <svg v-else viewBox="0 0 1024 1024" width="14" height="14"><path d="M384 128v64H192v192h-64V128h256zM640 128h256v256h-64V192H640V128zM128 640h64v192h192v64H128V640zM832 640h64v256H640v-64h192V640z" fill="currentColor"/></svg>
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </button>
    </div>

    <!-- 主体内容区 -->
    <div class="dashboard-body">
      <!-- 左侧区域 -->
      <div class="col col-left">
        <!-- 安全运行天数 -->
        <div class="card card-safe-days">
          <div class="card-title">安全运行天数</div>
          <div class="safe-days-value">244</div>
          <div class="safe-days-time">2025/10/15 星期三 09:37</div>
        </div>

        <!-- 待办事项 -->
        <div class="card card-todo">
          <div class="card-title">待办事项（件）</div>
          <div class="todo-content">
            <div class="todo-left">
              <div class="todo-value">2345<span class="todo-unit">件</span></div>
              <div class="progress-bar-wrapper">
                <div class="progress-label">63%</div>
                <div class="progress-bar-bg">
                  <div class="progress-bar" style="width: 63%"></div>
                </div>
              </div>
            </div>
            <div class="todo-right">
              <div class="todo-label">已办理事项（件）</div>
              <div class="todo-done-value">1478<span class="todo-unit">件</span></div>
            </div>
          </div>
        </div>

        <!-- 环境监测 -->
        <div class="card card-env">
          <div class="card-title">环境监测</div>
          <div class="env-content">
            <div class="env-item">
              <div class="env-icon temp-icon">
                <svg viewBox="0 0 1024 1024" width="28" height="28"><path d="M544 64h-64v544h-96l128 192 128-192h-96V64z" fill="#ff4d4f"/><rect x="480" y="128" width="64" height="320" fill="url(#tempGrad)"/><defs><linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff4d4f"/><stop offset="100%" stop-color="#2571e9"/></linearGradient></defs></svg>
              </div>
              <div class="env-info">
                <div class="env-value">26℃</div>
                <div class="env-label">当前温度</div>
              </div>
            </div>
            <div class="env-item">
              <div class="env-icon humid-icon">
                <svg viewBox="0 0 1024 1024" width="28" height="28"><path d="M512 64L320 448c0 106 86 192 192 192s192-86 192-192L512 64z" fill="url(#humidGrad)"/><defs><linearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2571e9"/><stop offset="100%" stop-color="#00e7ff"/></linearGradient></defs></svg>
              </div>
              <div class="env-info">
                <div class="env-value">46%</div>
                <div class="env-label">当前湿度</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 物资来源 -->
        <div class="card card-source">
          <div class="card-title">物资来源</div>
          <div class="chart-wrapper" ref="sourceChartRef"></div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="col col-center">
        <!-- 三大核心指标 -->
        <div class="core-metrics">
          <div class="metric-card">
            <div class="metric-icon">
              <svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M192 192h640v64H192zM192 384h640v64H192zM192 576h640v64H192zM192 768h640v64H192z" fill="#fff"/></svg>
            </div>
            <div class="metric-value">4578</div>
            <div class="metric-label">总类</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M512 64l-64 128H256v64h128l-32 64H256v64h64l-96 192h64l96-192h64v192h128V384h64l96 192h64l-96-192h64v-64h-96l-32-64h128v-64H576L512 64z" fill="#fff"/></svg>
            </div>
            <div class="metric-value">188888</div>
            <div class="metric-label">总价值</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M192 832V320h128v512H192zM384 832V192h128v640H384zM576 832V448h128v384H576zM768 832V256h128v576H768z" fill="#fff"/></svg>
            </div>
            <div class="metric-value">87138</div>
            <div class="metric-label">总数</div>
          </div>
        </div>

        <!-- 物资种类及价值占比 -->
        <div class="card card-category">
          <div class="card-title">物资种类及价值占比</div>
          <div class="category-content">
            <div class="category-chart" ref="categoryChartRef"></div>
            <div class="category-table">
              <table>
                <thead>
                  <tr><th>物资分类</th><th>物料数量</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in tableData" :key="idx" :class="{ 'even-row': idx % 2 === 1 }">
                    <td>{{ row.category }}</td>
                    <td>{{ row.quantity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 出入库情况概览 -->
        <div class="card card-inout">
          <div class="card-title">出入库情况概览</div>
          <div class="chart-wrapper" ref="inoutChartRef"></div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="col col-right">
        <!-- 库存预警 -->
        <div class="card card-stock-warning">
          <div class="card-title">库存预警（条）</div>
          <div class="stock-warning-content">
            <div class="stock-warning-left">
              <div class="gauge-wrapper" ref="stockGaugeRef"></div>
            </div>
            <div class="stock-warning-right">
              <div class="warning-cell" v-for="(item, idx) in warningGridData" :key="idx">
                <div class="warning-cell-label">{{ item.category }}</div>
                <div class="warning-cell-value" :style="{ color: item.color }">{{ item.count }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 保质期预警 -->
        <div class="card card-expiry">
          <div class="card-title">保质期预警（个）</div>
          <div class="expiry-content">
            <div class="expiry-gauge" v-for="(g, idx) in expiryGauges" :key="idx">
              <div class="gauge-circle" :style="{ '--ring-color': g.color }">
                <div class="gauge-ring">
                  <div class="gauge-inner">
                    <span class="gauge-num">{{ g.value }}</span>
                  </div>
                </div>
              </div>
              <div class="gauge-label">{{ g.label }}</div>
            </div>
          </div>
        </div>

        <!-- 质量等级 -->
        <div class="card card-quality">
          <div class="card-title">质量等级（个）</div>
          <div class="chart-wrapper" ref="qualityChartRef"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import html2canvas from 'html2canvas';

const containerRef = ref(null);
const currentTime = ref('');
const exporting = ref(false);
const isFullscreen = ref(false);
let timeTimer = null;

const updateTime = () => {
  const now = new Date();
  const y = now.getFullYear();
  const M = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${y}/${M}/${d} ${h}:${m}:${s}`;
};

// 表格数据
const tableData = ref([
  { category: 'A类', quantity: 299, value: 500 },
  { category: 'B类', quantity: 299, value: 500 },
  { category: 'C类', quantity: 299, value: 500 },
  { category: 'D类', quantity: 299, value: 500 },
  { category: 'E类', quantity: 299, value: 500 },
  { category: 'F类', quantity: 299, value: 500 },
]);

// 库存预警网格数据
const warningGridData = ref([
  { category: 'A类', count: 20, color: '#ff4d4f' },
  { category: 'B类', count: 40, color: '#faad14' },
  { category: 'C类', count: 15, color: '#f97316' },
  { category: 'D类', count: 8,  color: '#00e7ff' },
]);

// 保质期预警数据
const expiryGauges = ref([
  { value: 3456, label: '已到期', color: '#ff4d4f' },
  { value: 1234, label: '本月到期', color: '#faad14' },
  { value: 1238, label: '下月到期', color: '#52c41a' },
]);

// Chart refs
const categoryChartRef = ref(null);
const inoutChartRef = ref(null);
const sourceChartRef = ref(null);
const qualityChartRef = ref(null);
const stockGaugeRef = ref(null);

let charts = [];

// 导出图片
const exportImage = async () => {
  if (exporting.value || !containerRef.value) return;
  exporting.value = true;
  await nextTick();
  try {
    const canvas = await html2canvas(containerRef.value, {
      backgroundColor: '#000810',
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement('a');
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
    link.download = `智慧仓储可视化看板_${ts}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('导出图片失败:', err);
  } finally {
    exporting.value = false;
  }
};

const initCharts = () => {
  // 物资种类环形图
  const categoryChart = echarts.init(categoryChartRef.value);
  categoryChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: {
      bottom: '2%', textStyle: { color: '#a0c4e8', fontSize: 11 },
      itemWidth: 10, itemHeight: 10,
      data: ['A类','B类','C类','D类','E类','F类']
    },
    series: [{
      type: 'pie', radius: ['35%', '65%'], center: ['50%', '45%'],
      label: { show: true, color: '#a0c4e8', fontSize: 10, formatter: '{b}\n{c}' },
      labelLine: { lineStyle: { color: 'rgba(160,196,232,0.4)' } },
      data: [
        { value: 2232, name: 'A类', itemStyle: { color: '#3b82f6' } },
        { value: 2232, name: 'B类', itemStyle: { color: '#f97316' } },
        { value: 1234, name: 'C类', itemStyle: { color: '#22c55e' } },
        { value: 1234, name: 'D类', itemStyle: { color: '#a855f7' } },
        { value: 1234, name: 'E类', itemStyle: { color: '#35e7beff' } },
        { value: 1234, name: 'F类', itemStyle: { color: '#b8bf2cff' } },
      ]
    }]
  });
  charts.push(categoryChart);

  // 出入库折线图
  const inoutChart = echarts.init(inoutChartRef.value);
  inoutChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { data: ['入库', '出库'], textStyle: { color: '#a0c4e8' }, top: 0 },
    grid: { top: '18%', left: '8%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category', data: ['0801','0802','0803','0804','0805','0806','0807'],
      axisLine: { lineStyle: { color: 'rgba(0,231,255,0.3)' } },
      axisLabel: { color: '#a0c4e8' }
    },
    yAxis: {
      type: 'value', max: 1600, interval: 200,
      axisLine: { lineStyle: { color: 'rgba(0,231,255,0.3)' } },
      axisLabel: { color: '#a0c4e8' },
      splitLine: { lineStyle: { color: 'rgba(0,231,255,0.1)' } }
    },
    series: [
      {
        name: '入库', type: 'line', smooth: true,
        data: [800, 1200, 600, 1400, 1000, 800, 1200],
        lineStyle: { color: '#e8d56b', width: 2 },
        itemStyle: { color: '#e8d56b' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(232,213,107,0.3)' }, { offset: 1, color: 'rgba(232,213,107,0)' }] } }
      },
      {
        name: '出库', type: 'line', smooth: true,
        data: [600, 1000, 800, 1200, 700, 900, 1100],
        lineStyle: { color: '#6be8a0', width: 2, type: 'dashed' },
        itemStyle: { color: '#6be8a0' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(107,232,160,0.2)' }, { offset: 1, color: 'rgba(107,232,160,0)' }] } }
      }
    ]
  });
  charts.push(inoutChart);

  // 物资来源环形图
  const sourceChart = echarts.init(sourceChartRef.value);
  sourceChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: { bottom: '2%', textStyle: { color: '#a0c4e8', fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie', radius: ['35%', '65%'], center: ['50%', '42%'],
      label: { show: true, color: '#a0c4e8', fontSize: 10, formatter: '{d}%' },
      data: [
        { value: 4567, name: '自采', itemStyle: { color: '#3b82f6' } },
        { value: 1234, name: '调拨', itemStyle: { color: '#22c55e' } },
        { value: 2000, name: '赠送', itemStyle: { color: '#f97316' } },
      ]
    }]
  });
  charts.push(sourceChart);

  // 质量等级环形图
  const qualityChart = echarts.init(qualityChartRef.value);
  qualityChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: { bottom: '2%', textStyle: { color: '#a0c4e8', fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie', radius: ['35%', '65%'], center: ['50%', '42%'],
      label: { show: true, color: '#a0c4e8', fontSize: 10, formatter: '{b}\n{c}' },
      labelLine: { lineStyle: { color: 'rgba(160,196,232,0.4)' } },
      data: [
        { value: 2232, name: 'A品', itemStyle: { color: '#3b82f6' } },
        { value: 2232, name: 'B品', itemStyle: { color: '#a855f7' } },
        { value: 700, name: 'C品', itemStyle: { color: '#22c55e' } },
        { value: 300, name: 'D品', itemStyle: { color: '#6b7280' } },
      ]
    }]
  });
  charts.push(qualityChart);

  // 库存预警仪表盘
  const stockGauge = echarts.init(stockGaugeRef.value);
  stockGauge.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 220, endAngle: -40,
      min: 0, max: 2000,
      pointer: { show: false },
      progress: { show: true, width: 14, roundCap: true, itemStyle: { color: '#f97316' } },
      axisLine: { lineStyle: { width: 14, color: [[1, 'rgba(0,231,255,0.15)']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        fontSize: 20, fontWeight: 'bold', color: '#00e7ff',
        offsetCenter: [0, 0],
        formatter: '{value}',
        textShadowColor: 'rgba(0,231,255,0.5)', textShadowBlur: 10
      },
      data: [{ value: 1234 }]
    }]
  });
  charts.push(stockGauge);
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    containerRef.value?.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
};

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
  setTimeout(() => charts.forEach(c => c?.resize()), 200);
};

const handleResize = () => { charts.forEach(c => c?.resize()); };

onMounted(() => {
  updateTime();
  timeTimer = setInterval(updateTime, 1000);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  setTimeout(() => {
    initCharts();
    window.addEventListener('resize', handleResize);
  }, 200);
});

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  charts.forEach(c => c?.dispose());
});
</script>


<style scoped>
/* 全局 */
.dashboard-container {
  width: 100%;
  height: calc(100vh - 84px);
  background: linear-gradient(180deg, #001226 0%, #020d1a 50%, #000810 100%);
  color: #fff;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  padding: 0 16px 16px;
}

.dashboard-container:fullscreen {
  height: 100vh;
  padding: 0 24px 24px;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0,231,255,0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(37,113,233,0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* 头部 */
.dashboard-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  z-index: 1;
  border-bottom: 1px solid rgba(0,231,255,0.15);
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00e7ff, #2571e9, #00e7ff, transparent);
}

.header-decoration {
  width: 180px;
  height: 36px;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 36'><path d='M0 0 L160 0 L180 18 L160 36 L0 36 L20 18 Z' fill='none' stroke='%2300e7ff' stroke-width='1.5'/></svg>") no-repeat center;
  background-size: contain;
}

.header-decoration.right { transform: scaleX(-1); }

.dashboard-title {
  font-size: 36px;
  font-weight: bold;
  letter-spacing: 12px;
  margin: 0 24px;
  background: linear-gradient(135deg, #00e7ff 0%, #4dd0e1 30%, #7c4dff 60%, #00e7ff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShine 5s ease-in-out infinite;
  text-shadow: none;
  filter: drop-shadow(0 0 12px rgba(0,231,255,0.3));
}

@keyframes titleShine {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.header-time {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  color: #00e7ff;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0,231,255,0.3);
}

.export-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, rgba(0,231,255,0.15) 0%, rgba(37,113,233,0.1) 100%);
  border: 1px solid rgba(0,231,255,0.35);
  color: #00e7ff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  box-shadow: 0 0 10px rgba(0,231,255,0.15);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.export-btn:hover {
  background: linear-gradient(135deg, rgba(0,231,255,0.25) 0%, rgba(37,113,233,0.18) 100%);
  border-color: rgba(0,231,255,0.6);
  box-shadow: 0 0 18px rgba(0,231,255,0.3);
  color: #fff;
}

.fullscreen-btn {
  position: absolute;
  left: 110px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, rgba(0,231,255,0.15) 0%, rgba(37,113,233,0.1) 100%);
  border: 1px solid rgba(0,231,255,0.35);
  color: #00e7ff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  box-shadow: 0 0 10px rgba(0,231,255,0.15);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.fullscreen-btn:hover {
  background: linear-gradient(135deg, rgba(0,231,255,0.25) 0%, rgba(37,113,233,0.18) 100%);
  border-color: rgba(0,231,255,0.6);
  box-shadow: 0 0 18px rgba(0,231,255,0.3);
  color: #fff;
}

/* 主体布局 */
.dashboard-body {
  flex: 1;
  display: flex;
  gap: 12px;
  padding-top: 12px;
  min-height: 0;
  z-index: 1;
  position: relative;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.col-left { width: 22%; }
.col-center { width: 56%; }
.col-right { width: 22%; }

/* 通用卡片 */
.card {
  background: rgba(0,20,40,0.65);
  border: 1px solid rgba(0,231,255,0.2);
  border-radius: 6px;
  padding: 12px 14px;
  box-shadow: 0 0 15px rgba(0,231,255,0.08), inset 0 0 20px rgba(0,231,255,0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: border-color 0.3s;
}

.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px; height: 100%;
  background: linear-gradient(to bottom, #00e7ff, #2571e9);
  border-radius: 6px 0 0 6px;
}

.card::after {
  content: '';
  position: absolute;
  top: 0; left: 4px; right: 0;
  height: 1px;
  background: linear-gradient(to right, #00e7ff, transparent);
}

.card-title {
  font-size: 13px;
  font-weight: 700;
  color: #00e7ff;
  letter-spacing: 2px;
  padding-left: 10px;
  margin-bottom: 8px;
  flex-shrink: 0;
  text-shadow: 0 0 8px rgba(0,231,255,0.4);
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
  width: 100%;
}

/* 安全运行天数 */
.card-safe-days { flex: 0 0 auto; }

.safe-days-value {
  font-size: 54px;
  font-weight: bold;
  color: #00e7ff;
  text-align: center;
  line-height: 1;
  padding: 6px 0;
  text-shadow: 0 0 20px rgba(0,231,255,0.6), 0 0 40px rgba(0,231,255,0.3);
  font-family: 'Courier New', monospace;
  letter-spacing: 4px;
}

.safe-days-time {
  text-align: center;
  font-size: 11px;
  color: rgba(160,196,232,0.6);
}

/* 待办事项 */
.card-todo { flex: 0 0 auto; }

.todo-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.todo-left { flex: 1; }
.todo-right { flex: 1; }

.todo-value {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 6px;
}

.todo-unit { font-size: 13px; font-weight: normal; color: #a0c4e8; margin-left: 4px; }

.progress-bar-wrapper { margin-top: 4px; }

.progress-label {
  font-size: 11px;
  color: #a0c4e8;
  margin-bottom: 3px;
}

.progress-bar-bg {
  height: 8px;
  background: rgba(0,231,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #f97316, #22c55e);
  box-shadow: 0 0 8px rgba(249,115,22,0.4);
}

.todo-label { font-size: 11px; color: #a0c4e8; margin-bottom: 4px; }

.todo-done-value {
  font-size: 22px;
  font-weight: bold;
  color: #fff;
}

/* 环境监测 */
.card-env { flex: 0 0 auto; }

.env-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.env-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.env-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,231,255,0.08);
  border: 1px solid rgba(0,231,255,0.15);
  flex-shrink: 0;
}

.env-value {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.env-label { font-size: 11px; color: #a0c4e8; }

/* 物资来源 */
.card-source { flex: 1; min-height: 0; }

/* 核心指标 */
.core-metrics {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.metric-card {
  flex: 1;
  background: rgba(0,20,40,0.65);
  border: 1px solid rgba(0,231,255,0.35);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 0 12px rgba(0,231,255,0.12), inset 0 0 15px rgba(0,231,255,0.06);
  transition: border-color 0.3s, transform 0.2s;
}

.metric-card:hover {
  border-color: rgba(0,231,255,0.6);
  transform: translateY(-2px);
}

.metric-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: rgba(0,231,255,0.12);
  border: 1px solid rgba(0,231,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  line-height: 1.2;
}

.metric-label {
  font-size: 11px;
  color: #a0c4e8;
}

/* 物资种类 */
.card-category { flex: 6; min-height: 0; }

.category-content {
  flex: 1;
  display: flex;
  gap: 10px;
  min-height: 0;
}

.category-chart {
  flex: 1;
  min-width: 0;
}

.category-table {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  max-height: 100%;
}

.category-table::-webkit-scrollbar { width: 4px; }
.category-table::-webkit-scrollbar-track { background: rgba(0,231,255,0.05); }
.category-table::-webkit-scrollbar-thumb { background: rgba(0,231,255,0.2); border-radius: 2px; }

.category-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.category-table th {
  color: #a0c4e8;
  font-weight: 600;
  text-align: left;
  padding: 8px 8px;
  border-bottom: 1px solid rgba(0,231,255,0.2);
  position: sticky;
  top: 0;
  background: rgba(0,20,40,0.9);
  font-size: 14px;
}

.category-table td {
  padding: 8px 8px;
  color: rgba(255,255,255,0.9);
  border-bottom: 1px solid rgba(0,231,255,0.06);
  font-size: 14px;
}

.category-table .even-row td {
  background: rgba(0,231,255,0.04);
}

/* 出入库 */
.card-inout { flex: 4; min-height: 0; }

/* 库存预警 */
.card-stock-warning { flex: 1; min-height: 0; }

.stock-warning-content {
  flex: 1;
  display: flex;
  gap: 10px;
  min-height: 0;
}

.stock-warning-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-wrapper {
  width: 100%;
  height: 100%;
  min-height: 80px;
}

.stock-warning-right {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  align-content: center;
}

.warning-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(0,231,255,0.04);
  border: 1px solid rgba(0,231,255,0.1);
  padding: 8px 6px;
  transition: all 0.3s ease;
}

.warning-cell:hover {
  background: rgba(0,231,255,0.08);
  border-color: rgba(0,231,255,0.25);
  transform: scale(1.03);
}

.warning-cell-label {
  font-size: 12px;
  color: #a0c4e8;
  font-weight: 500;
  margin-bottom: 4px;
}

.warning-cell-value {
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 0 8px currentColor;
}

/* 保质期预警 */
.card-expiry { flex: 0 0 auto; }

.expiry-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 4px 0;
}

.expiry-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.gauge-circle {
  width: 72px;
  height: 72px;
  position: relative;
}

.gauge-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid rgba(0,231,255,0.15);
  border-top-color: var(--ring-color);
  border-right-color: var(--ring-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(0,231,255,0.25);
  animation: gaugeRotate 3s linear infinite;
}

@keyframes gaugeRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gauge-inner {
  animation: gaugeCounterRotate 3s linear infinite;
}

@keyframes gaugeCounterRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.gauge-num {
  font-size: 14px;
  font-weight: bold;
  color: #00e7ff;
  text-shadow: 0 0 8px rgba(0,231,255,0.5);
}

.gauge-label {
  font-size: 11px;
  color: #a0c4e8;
}

/* 质量等级 */
.card-quality { flex: 1; min-height: 0; }
</style>
