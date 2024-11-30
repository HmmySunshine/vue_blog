<template>
  <div id="admin-app">
    <nav class="admin-sidebar">
      <div class="admin-sidebar-brand">博客后台管理</div>
      <div class="admin-sidebar-menu">
        <a
          @click="setActiveView('dashboard')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'dashboard' }"
        >
          <i class="fas fa-tachometer-alt"></i> 仪表盘
        </a>
        <a
          @click="setActiveView('publishArticle')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'publishArticle' }"
        >
          <i class="fas fa-bullhorn"></i> 发布文章
        </a>
        <a
          @click="setActiveView('articleManagement')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'articleManagement' }"
        >
          <i class="fas fa-book"></i> 文章管理
        </a>
        <a
          @click="setActiveView('tagManagement')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'tagManagement' }"
        >
          <i class="fas fa-tags"></i> 标签管理
        </a>
        <a
          @click="setActiveView('categoryManagement')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'categoryManagement' }"
        >
          <i class="fas fa-th-large"></i> 分类管理
        </a>
        <a
          @click="setActiveView('timelineManagement')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'timelineManagement' }"
        >
          <i class="fas fa-clock"></i> 时光轴管理
        </a>
        <a
          @click="setActiveView('alistManagement')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'alistManagement' }"
        >
          <i class="fas fa-file"></i> Alist管理
        </a>
        <a
          @click="setActiveView('chatSettings')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'chatSettings' }"
        >
          <i class="fas fa-comments"></i> AI聊天室设置
        </a>
        <a
          @click="setActiveView('photoWallManagement')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'photoWallManagement' }"
        >
          <i class="fas fa-images"></i> 照片墙管理
        </a>
        <a
          @click="setActiveView('systemSettings')"
          class="admin-navbar-item"
          :class="{ active: activeView === 'systemSettings' }"
        >
          <i class="fas fa-cog"></i> 系统设置
        </a>
        <a @click="logout" class="admin-navbar-item">
          <i class="fas fa-sign-out-alt"></i> 回到博客首页
        </a>
      </div>
    </nav>
    <div class="admin-main-content">
      <template v-if="activeView === 'dashboard'">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>文章总数</h3>
            <div class="stat-number">{{ totalArticles }}</div>
          </div>
          <div class="stat-card">
            <h3>总访问量</h3>
            <div class="stat-number">{{ totalVisits }}</div>
          </div>
          <div class="stat-card">
            <h3>评论总数</h3>
            <div class="stat-number">{{ totalComments }}</div>
          </div>
          <div class="stat-card">
            <h3>分类总数</h3>
            <div class="stat-number">{{ totalCategories }}</div>
          </div>
        </div>
        <div class="chart-grid">
          <div class="chart-card">
            <h3>访问统计</h3>
            <canvas ref="visitsChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>分类统计</h3>
            <canvas ref="categoriesChart"></canvas>
          </div>
        </div>
      </template>
      <ArticleEditor v-else-if="activeView === 'publishArticle'" />
      <ArticleManagement v-else-if="activeView === 'articleManagement'" />
      <TagManagement v-else-if="activeView === 'tagManagement'" />
      <CategoryManagement v-else-if="activeView === 'categoryManagement'" />
      <FileManagement v-else-if="activeView === 'alistManagement'" />
      <PhotoWallManagement v-else-if="activeView === 'photoWallManagement'" />
      <TestManagement v-else-if="activeView === 'systemSettings'" />
      <div v-else class="placeholder-content">
        {{ activeView }} 功能正在开发中...
      </div>
    </div>
  </div>
</template>
  
  <script>
import Chart from "chart.js/auto";
import ArticleEditor from "./ArticleEditor.vue";
import ArticleManagement from "./ArticleManagement.vue";
import TagManagement from "./TagManagement.vue";
import CategoryManagement from "./CategoryManagement.vue";
import FileManagement from "./FileManagement.vue";
import PhotoWallManagement from "./PhotoWallManagement.vue";
import TestManagement from "./TestManagement.vue";
export default {
  name: "AdminDashboard",
  components: {
    ArticleEditor,
    ArticleManagement,
    TagManagement,
    CategoryManagement,
    FileManagement,
    PhotoWallManagement,
    TestManagement,
  },
  data() {
    return {
      activeView: "dashboard",
      totalArticles: 150,
      totalVisits: 10000,
      totalComments: 500,
      totalCategories: 8,
      visitsChart: null,
      categoriesChart: null,
      visitData: Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 100) + 50
      ),
      categoryData: [30, 25, 20, 15, 5, 5],
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.activeView === "dashboard") {
        this.createVisitsChart();
        this.createCategoriesChart();
      }
      window.addEventListener("resize", this.resizeCharts);
    });
  },
  beforeDestroy() {
    if (this.visitsChart) {
      this.visitsChart.destroy();
    }
    if (this.categoriesChart) {
      this.categoriesChart.destroy();
    }
    window.removeEventListener("resize", this.resizeCharts);
  },
  methods: {
    setActiveView(view) {
      this.activeView = view;
      if (view === "dashboard") {
        this.$nextTick(() => {
          this.createVisitsChart();
          this.createCategoriesChart();
        });
      }
    },
    createVisitsChart() {
      const ctx = this.$refs.visitsChart.getContext("2d");
      if (this.visitsChart) {
        this.visitsChart.destroy();
      }
      this.visitsChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: "访问量",
              data: this.visitData,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          animation: {
            duration: 0,
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },
    createCategoriesChart() {
      const ctx = this.$refs.categoriesChart.getContext("2d");
      if (this.categoriesChart) {
        this.categoriesChart.destroy();
      }
      this.categoriesChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Java", "Python", "前端", "PHP", "Go", "其他"],
          datasets: [
            {
              data: this.categoryData,
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 206, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
                "rgba(153, 102, 255, 0.8)",
                "rgba(255, 159, 64, 0.8)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          animation: {
            duration: 0,
          },
        },
      });
    },
    resizeCharts() {
      if (this.visitsChart) {
        this.visitsChart.resize();
      }
      if (this.categoriesChart) {
        this.categoriesChart.resize();
      }
    },
    logout() {
      
      this.$router.push("/");
    },
  },
  watch: {
    activeView(newView) {
      if (newView === "dashboard") {
        this.$nextTick(() => {
          this.createVisitsChart();
          this.createCategoriesChart();
        });
      }
    },
  },
};
</script>
  
  <style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#admin-app {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.admin-sidebar {
  width: 250px;
  background-color: #343a40;
  color: white;
  padding: 1rem;
  overflow-y: auto;
  flex-shrink: 0;
  height: 100%;
}

.admin-sidebar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
}

.admin-sidebar-menu {
  display: flex;
  flex-direction: column;
}

.admin-navbar-item {
  margin-bottom: 0.5rem;
  text-decoration: none;
  color: #f8f9fa;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.admin-navbar-item:hover,
.admin-navbar-item.active {
  background-color: #495057;
}

.admin-navbar-item i {
  margin-right: 0.5rem;
  width: 20px;
  text-align: center;
}

.admin-main-content {
  flex-grow: 1;
  padding: 0;
  overflow-y: auto;
  background-color: #f8f9fa;
  height: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
  margin: 0;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #666;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 0 1rem 1rem 1rem;
  margin: 0;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #333;
}

.placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
  color: #666;
  padding: 1rem;
}

canvas {
  width: 100% !important;
  height: auto !important;
  max-height: 400px;
}
</style>