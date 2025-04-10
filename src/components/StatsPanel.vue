<template>
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-label">总访问量</span>
        <span class="stat-value">{{ formatNumber(stats.totalVisits) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">今日访问量</span>
        <span class="stat-value">{{ formatNumber(stats.todayVisits) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">最高阅读量</span>
        <span class="stat-value">{{ formatNumber(stats.topReads) }}</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "StatsPanel",
    props: {
      stats: {
        type: Object,
        required: true
      }
    },
    methods: {
      formatNumber(num) {
        return num ? num.toLocaleString() : "0";
      }
    }
  };
  </script>
  
  <style scoped>
  .stats-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .stat-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  </style>