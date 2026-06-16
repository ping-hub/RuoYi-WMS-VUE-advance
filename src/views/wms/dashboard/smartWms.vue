<template>
  <div class="board-container" ref="boardContainerRef">
    <img src="@/assets/images/board-bg.png?v=2" class="board-bg-layer" alt="background" />
    
    <div class="board-content-wrapper">
      <img src="@/assets/images/fullscreen.png" alt="全屏" class="fullscreen-img" @click="toggleFullscreen" />
      
      <div class="header-container">
        <div class="main-title">
          <h1 class="title-text">智慧仓储管理系统</h1>
        </div>
        <div class="header-right">
          <span class="time-stamp">{{ nowTime }}</span>
          <span class="warning-text">
            <svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896z m0 39.127273a408.872727 408.872727 0 1 0 0 817.745454 408.872727 408.872727 0 0 0 0-817.745454z m0 195.490909a39.127273 39.127273 0 0 1 39.127273 39.127273v273.890909a39.127273 39.127273 0 0 1-78.254546 0V337.745455a39.127273 39.127273 0 0 1 39.127273-39.127273z m0 430.4a39.127273 39.127273 0 1 1 0 78.254545 39.127273 39.127273 0 0 1 0-78.254545z" fill="#ff4d4f"></path></svg>
            当前无异常报警
          </span>
        </div>
      </div>
      
      <div class="board-content flex-between">
        <div class="content-left flex-column-between">
          <div class="content-box box-inventory">
            <div class="box-title">库存总量</div>
            <div class="box-content stat-grid">
              <div class="stat-item">
                <div class="stat-icon icon-1"></div>
                <div class="stat-info">
                  <div class="stat-label">积存托盘</div>
                  <div class="stat-value">82</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon icon-2"></div>
                <div class="stat-info">
                  <div class="stat-label">今日出入库量</div>
                  <div class="stat-value">67</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon icon-3"></div>
                <div class="stat-info">
                  <div class="stat-label">拣货完成率</div>
                  <div class="stat-value">359</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon icon-4"></div>
                <div class="stat-info">
                  <div class="stat-label">拣货完成量</div>
                  <div class="stat-value">596</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="content-box box-inout">
            <div class="box-title">今日出入库量</div>
            <div class="box-content" ref="inOutChartRef"></div>
          </div>
          
          <div class="content-box box-utilization">
            <div class="box-title">货位利用率</div>
            <div class="box-content" ref="utilizationChartRef"></div>
          </div>
        </div>
        
        <div class="content-middle">
          <div class="warehouse-static-content">
            <div class="center-stats-overlay">
              <div class="center-stat-item">
                <div class="stat-label">
                  <svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M896 768V192H128v576l384 192 384-192zM192 256h640v502.976l-320 160L192 758.976V256z m0 0" fill="#00e7ff"></path></svg>
                  当前库存
                </div>
                <div class="stat-value">12000<span class="unit">件</span></div>
              </div>
              <div class="center-stat-item">
                <div class="stat-label">
                  <svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M832 128v768h-640v-768h640zM256 512h512V192h-512v320zM256 768h512v-128h-512v128zM256 384h128v128h-128v-128zM64 832h896v64h-896v-64z" fill="#00e7ff"></path></svg>
                  今日入库
                </div>
                <div class="stat-value">3500<span class="unit">件</span></div>
              </div>
              <div class="center-stat-item">
                <div class="stat-label">
                  <svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M768 896h-512v-768h512v768zM448 128v-64h128v64h-128zM320 896v64h384v-64h-384zM640 576h-256v-128h256v128zM512 512h-64v-192h-128v192h-64v128h256v-128z" fill="#00e7ff"></path></svg>
                  今日出库
                </div>
                <div class="stat-value">2800<span class="unit">件</span></div>
              </div>
            </div>
            
            <div class="float-tag tag-1">
              <div class="tag-line">当前库存: <span class="tag-val">1200</span></div>
              <div class="tag-line">今日入库: <span class="tag-val">350</span></div>
            </div>
            <div class="float-tag tag-2">
              <div class="tag-line">当前库存: <span class="tag-val">3000</span></div>
              <div class="tag-line">今日入库: <span class="tag-val">600</span></div>
            </div>
            <div class="float-tag tag-3">
              <div class="tag-line">今日入库: <span class="tag-val">2500</span></div>
              <div class="tag-line">今日出库: <span class="tag-val">2000</span></div>
            </div>
            <div class="float-tag tag-4">
              <div class="tag-line">今日入库: <span class="tag-val">2800</span></div>
              <div class="tag-line">今日出库: <span class="tag-val">2000</span></div>
            </div>
          </div>
        </div>
        
        <div class="content-right flex-column-between">
          <div class="content-box box-warning">
            <div class="box-title">预警信息</div>
            <div class="box-content warning-list">
              <div class="warning-header">
                <span>区域</span>
                <span>状态</span>
              </div>
              <div class="warning-item">
                <div class="warning-name">A区</div>
                <div class="warning-bar-wrapper">
                  <div class="warning-bar-bg">
                    <div class="warning-bar" style="width: 85%; background: linear-gradient(90deg, #ff4d4d, #ff7043); box-shadow: 0 0 15px rgba(255,77,77,0.5);"></div>
                  </div>
                </div>
                <div class="warning-num">2850</div>
                <div class="warning-rate">
                  85%
                  <span class="rate-chart-mock">⬆</span>
                </div>
              </div>
              <div class="warning-item">
                <div class="warning-name">B区</div>
                <div class="warning-bar-wrapper">
                  <div class="warning-bar-bg">
                    <div class="warning-bar" style="width: 72%; background: linear-gradient(90deg, #ff9800, #ffc107); box-shadow: 0 0 15px rgba(255,152,0,0.5);"></div>
                  </div>
                </div>
                <div class="warning-num">1460</div>
                <div class="warning-rate">
                  72%
                  <span class="rate-chart-mock">➡</span>
                </div>
              </div>
              <div class="warning-item">
                <div class="warning-name">C区</div>
                <div class="warning-bar-wrapper">
                  <div class="warning-bar-bg">
                    <div class="warning-bar" style="width: 45%; background: linear-gradient(90deg, #2571e9, #00e7ff); box-shadow: 0 0 15px rgba(0,231,255,0.5);"></div>
                  </div>
                </div>
                <div class="warning-num">890</div>
                <div class="warning-rate">
                  45%
                  <span class="rate-chart-mock">⬇</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="content-box box-distribution">
            <div class="box-title">区域库分布</div>
            <div class="box-content" ref="distributionChartRef"></div>
          </div>
          
          <div class="content-box box-efficiency">
            <div class="box-title">订单处理时效</div>
            <div class="box-content" ref="efficiencyChartRef"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import * as echarts from 'echarts';

const { proxy } = getCurrentInstance();

const nowTime = ref('');
let timer = null;

const updateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  nowTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const inOutChartRef = ref(null);
const utilizationChartRef = ref(null);
const distributionChartRef = ref(null);
const efficiencyChartRef = ref(null);

let inOutChart = null;
let utilizationChart = null;
let distributionChart = null;
let efficiencyChart = null;

const boardContainerRef = ref(null);

const toggleFullscreen = () => {
  const el = boardContainerRef.value;
  if (!document.fullscreenElement) {
    el?.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
};
    
const initCharts = () => {
  inOutChart = echarts.init(inOutChartRef.value);
  inOutChart.setOption({
    backgroundColor: 'transparent',
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#a0c4e8'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#a0c4e8'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '入库',
        type: 'bar',
        data: [120, 200, 150, 80, 70, 110, 130],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#00e7ff' },
              { offset: 1, color: '#2571e9' }
            ]
          }
        },
        barWidth: '50%'
      },
      {
        name: '出库',
        type: 'bar',
        data: [100, 180, 130, 90, 80, 100, 120],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#7c4dff' },
              { offset: 1, color: '#2571e9' }
            ]
          }
        },
        barWidth: '50%'
      }
    ]
  });

  utilizationChart = echarts.init(utilizationChartRef.value);
  utilizationChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#a0c4e8'
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#a0c4e8'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '利用率',
        type: 'bar',
        data: [85, 72, 90, 65, 80, 75],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#00e7ff' },
              { offset: 1, color: '#2571e9' }
            ]
          }
        },
        barWidth: '40%'
      }
    ]
  });

  distributionChart = echarts.init(distributionChartRef.value);
  distributionChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '0%',
      left: 'center',
      textStyle: {
        color: '#a0c4e8'
      }
    },
    series: [
      {
        name: '区域库分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(0, 20, 40, 0.6)',
          borderWidth: 2
        },
        label: {
          show: true,
          color: '#a0c4e8'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        data: [
          { value: 335, name: 'A区', itemStyle: { color: '#00e7ff' } },
          { value: 310, name: 'B区', itemStyle: { color: '#2571e9' } },
          { value: 234, name: 'C区', itemStyle: { color: '#7c4dff' } },
          { value: 135, name: 'D区', itemStyle: { color: '#ff7043' } }
        ]
      }
    ]
  });

  efficiencyChart = echarts.init(efficiencyChartRef.value);
  efficiencyChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#a0c4e8'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#a0c4e8'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 231, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '处理时间(分钟)',
        type: 'line',
        smooth: true,
        data: [15, 18, 12, 20, 16, 14, 17],
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 231, 255, 0.5)' },
              { offset: 1, color: 'rgba(0, 231, 255, 0)' }
            ]
          }
        },
        itemStyle: {
          color: '#00e7ff'
        },
        lineStyle: {
          width: 2,
          color: '#00e7ff'
        }
      }
    ]
  });
};

const handleResize = () => {
  inOutChart?.resize();
  utilizationChart?.resize();
  distributionChart?.resize();
  efficiencyChart?.resize();
};

const handleFullscreenChange = () => {
  setTimeout(handleResize, 200);
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  setTimeout(() => {
    initCharts();
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  }, 100);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  inOutChart?.dispose();
  utilizationChart?.dispose();
  distributionChart?.dispose();
  efficiencyChart?.dispose();
});

</script>

<style scoped>
.flex-between {
  display: flex;
  justify-content: space-between;
}

.flex-column-between {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.board-container {
  width: 100%;
  height: calc(100vh - 84px);
  color: #fff;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #001226 0%, #020d1a 50%, #000810 100%);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.board-container:fullscreen {
  height: 100vh;
}

.board-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(0, 231, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(37, 113, 233, 0.05) 0%, transparent 50%);
  z-index: 1;
  pointer-events: none;
}

.board-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
  filter: contrast(1.1) saturate(1.1);
}

.board-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 0 30px;
  box-sizing: border-box;
}

.header-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00e7ff, #2571e9, #00e7ff, transparent);
}

.header-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  position: relative;
}

.main-title {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.title-text {
  font-size: 34px;
  font-weight: bold;
  color: #00e7ff;
  margin: 0;
  white-space: nowrap;
  background: linear-gradient(135deg, #00e7ff 0%, #4dd0e1 30%, #7c4dff 60%, #00e7ff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 5s ease-in-out infinite;
  letter-spacing: 12px;
  text-shadow: 0 0 30px rgba(0, 231, 255, 0.4);
  position: relative;
}

@keyframes shine {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.title-text::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 150%;
  background: radial-gradient(circle, rgba(0, 231, 255, 0.15) 0%, transparent 70%);
  z-index: -1;
  pointer-events: none;
}

.header-right {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 12px;
  background: rgba(0, 30, 60, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(0, 231, 255, 0.15);
  backdrop-filter: blur(5px);
}

.time-stamp {
  font-size: 14px;
  color: #00e7ff;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 0 15px rgba(0, 231, 255, 0.3);
  font-family: 'Microsoft YaHei', sans-serif;
  white-space: nowrap;
}

.warning-text {
  font-size: 13px;
  color: #ff7043;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  white-space: nowrap;
}

.board-content {
  flex: 1;
  display: flex;
  gap: 20px;
}

.fullscreen-img {
  position: absolute;
  left: 15px;
  top: 15px;
  cursor: pointer;
  z-index: 100;
  background: linear-gradient(135deg, rgba(0, 231, 255, 0.15) 0%, rgba(37, 113, 233, 0.08) 100%);
  border: 1px solid rgba(0, 231, 255, 0.35);
  border-radius: 8px;
  padding: 8px;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
  object-fit: contain;
  box-shadow: 0 0 15px rgba(0, 231, 255, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.fullscreen-img:hover {
  border-color: rgba(0, 231, 255, 0.55);
  box-shadow: 0 0 25px rgba(0, 231, 255, 0.35);
  transform: scale(1.1);
}

.content-left, .content-right {
  width: 25%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 2;
}

.content-middle {
  width: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  box-sizing: border-box;
}

.warehouse-static-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
}

.center-stats-overlay {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 40px;
  gap: 20px;
}

.center-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: linear-gradient(135deg, rgba(0, 231, 255, 0.12) 0%, rgba(37, 113, 233, 0.08) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 231, 255, 0.45);
  box-shadow: 0 0 20px rgba(0, 231, 255, 0.25), inset 0 0 30px rgba(0, 231, 255, 0.1);
  border-radius: 8px;
  min-height: 100px;
  transition: all 0.3s ease;
}

.center-stat-item:hover {
  border-color: rgba(0, 231, 255, 0.6);
  box-shadow: 0 0 30px rgba(0, 231, 255, 0.35), inset 0 0 40px rgba(0, 231, 255, 0.15);
  transform: translateY(-3px);
}

.center-stat-item .stat-label {
  font-size: 14px;
  color: #a0c4e8;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 5px;
}

.center-stat-item .stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #00e7ff;
  text-shadow: 0 0 10px rgba(0, 231, 255, 0.5);
}

.center-stat-item .unit {
  font-size: 14px;
  color: #a0c4e8;
  margin-left: 5px;
  font-weight: normal;
}

.float-tag {
  position: absolute;
  background: rgba(0, 30, 60, 0.85);
  padding: 12px 16px;
  font-size: 13px;
  color: #fff;
  border: 1px solid rgba(0, 231, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 231, 255, 0.2), inset 0 0 20px rgba(0, 231, 255, 0.08);
  z-index: 10;
  border-radius: 6px;
  backdrop-filter: blur(12px);
}

.tag-line {
  line-height: 1.6;
}

.tag-val {
  color: #00e7ff;
  font-weight: bold;
}

.tag-1 { top: 30%; left: 10%; }
.tag-2 { top: 50%; left: 5%; }
.tag-3 { top: 25%; right: 10%; }
.tag-4 { top: 55%; right: 5%; }

.content-box {
  background-color: rgba(0, 20, 40, 0.6);
  padding: 20px;
  margin-bottom: 18px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 231, 255, 0.25);
  box-shadow: 0 0 25px rgba(0, 231, 255, 0.12), inset 0 0 40px rgba(0, 231, 255, 0.08);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.content-box:hover {
  border-color: rgba(0, 231, 255, 0.4);
  box-shadow: 0 0 35px rgba(0, 231, 255, 0.18), inset 0 0 50px rgba(0, 231, 255, 0.12);
  transform: translateY(-2px);
}

.content-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 100%;
  background: linear-gradient(to bottom, #00e7ff, #2571e9);
  border-radius: 8px 0 0 8px;
}

.content-box::after {
  content: '';
  position: absolute;
  top: 0;
  left: 8px;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, #00e7ff, transparent);
}

.content-box:last-child {
  margin-bottom: 0;
}

.box-inventory { height: 28%; }
.box-inout { height: 34%; }
.box-utilization { height: 34%; }

.box-warning { height: 33%; }
.box-distribution { height: 32%; }
.box-efficiency { height: 32%; }

.box-title {
  height: 30px;
  display: flex;
  align-items: center;
  color: #00e7ff;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 14px;
  text-shadow: 0 0 12px rgba(0, 231, 255, 0.4);
  letter-spacing: 3px;
  padding-left: 12px;
  position: relative;
}

.box-content {
  height: calc(100% - 44px);
  width: 100%;
}

.stat-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
}

.stat-item {
  width: 48%;
  height: 45%;
  display: flex;
  align-items: center;
  margin-bottom: 2%;
  background: linear-gradient(135deg, rgba(0, 231, 255, 0.1) 0%, rgba(37, 113, 233, 0.05) 100%);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 231, 255, 0.15);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: linear-gradient(135deg, rgba(0, 231, 255, 0.15) 0%, rgba(37, 113, 233, 0.08) 100%);
  border-color: rgba(0, 231, 255, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  margin-right: 12px;
  background: linear-gradient(135deg, rgba(0, 231, 255, 0.2) 0%, rgba(37, 113, 233, 0.1) 100%);
  border: 1px solid rgba(0, 231, 255, 0.3);
  position: relative;
  box-shadow: 0 0 15px rgba(0, 231, 255, 0.2), inset 0 0 10px rgba(0, 231, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #00e7ff 0%, #2571e9 100%);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  box-shadow: 0 0 10px rgba(0, 231, 255, 0.5);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #a0c4e8;
  margin-bottom: 6px;
  font-weight: 500;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #00e7ff;
  text-shadow: 0 0 15px rgba(0, 231, 255, 0.5);
}

.warning-list {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.warning-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #a0c4e8;
  padding: 0 10px;
  margin-bottom: 12px;
  font-weight: 600;
}

.warning-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 231, 255, 0.03) 100%);
  padding: 12px 10px;
  border-radius: 8px;
  border: 1px solid rgba(0, 231, 255, 0.1);
  transition: all 0.3s ease;
}

.warning-item:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 231, 255, 0.06) 100%);
  border-color: rgba(0, 231, 255, 0.25);
  transform: translateX(3px);
}

.warning-name {
  width: 70px;
  color: #fff;
  font-weight: 500;
}

.warning-bar-wrapper {
  flex: 1;
  margin: 0 12px;
  display: flex;
  align-items: center;
  position: relative;
}

.warning-bar-bg {
  flex: 1;
  height: 10px;
  background: rgba(0, 231, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-right: 10px;
}

.warning-bar {
  height: 100%;
  border-radius: 5px;
  position: relative;
}

.warning-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
  border-radius: 5px 5px 0 0;
}

.warning-num {
  width: 45px;
  text-align: right;
  font-weight: bold;
  color: #00e7ff;
  text-shadow: 0 0 8px rgba(0, 231, 255, 0.3);
}

.warning-rate {
  width: 65px;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #a0c4e8;
  font-weight: 500;
}

.rate-chart-mock {
  margin-left: 6px;
  font-size: 10px;
  letter-spacing: -1px;
}
</style>
