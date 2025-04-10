<template>
  <div id="admin-app">
    <nav class="admin-sidebar">
      <div class="admin-sidebar-brand">博客后台管理</div>
      <el-menu
        class="admin-sidebar-menu"
        :default-active="activeView"
        @select="setActiveView"
        background-color="#ffffff"
        text-color="#333"
        active-text-color="#409EFF"
        unique-opened
      >
        <el-menu-item index="dashboard">
            
          <i class="fas fa-tachometer-alt"></i>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="publishArticle">
          <i class="fas fa-bullhorn"></i>
          <span>发布文章</span>
        </el-menu-item>
        <el-menu-item index="articleManagement">
          <i class="fas fa-book"></i>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="tagManagement">
          <i class="fas fa-tags"></i>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="categoryManagement">
          <i class="fas fa-th-large"></i>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="alistManagement">
          <i class="fas fa-file"></i>
          <span>Alist管理</span>
        </el-menu-item>
        <el-menu-item index="photoWallManagement">
          <i class="fas fa-images"></i>
          <span>照片墙管理</span>
        </el-menu-item>
        <el-menu-item index="systemSettings">
          <i class="fas fa-cog"></i>
          <span>系统设置</span>
        </el-menu-item>
        <el-menu-item index="home" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
          <span>回到博客首页</span>
        </el-menu-item>
      </el-menu>
    </nav>
    <div class="admin-main-content">
      <template v-if="activeView === 'dashboard'">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="stat-info">
              <h3>文章总数</h3>
              <div class="stat-number">{{ totalArticles }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-eye"></i>
            </div>
            <div class="stat-info">
              <h3>总访问量</h3>
              <div class="stat-number">{{ totalVisits }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-comments"></i>
            </div>
            <div class="stat-info">
              <h3>评论总数</h3>
              <div class="stat-number">{{ totalComments }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-folder"></i>
            </div>
            <div class="stat-info">
              <h3>分类总数</h3>
              <div class="stat-number">{{ totalCategories }}</div>
            </div>
          </div>
        </div>
        
        <div class="charts-container">
          <div class="chart-row">
            <div class="chart-card">
              <h3>文章分类占比</h3>
              <v-chart :options="categoryOptions" autoresize />
            </div>
            <div class="chart-card">
              <h3>热门文章 TOP5</h3>
              <v-chart :options="hotArticlesOptions" autoresize />
            </div>
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
import axios from 'axios';
import ECharts from 'vue-echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/title';
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
    'v-chart': ECharts
  },
  data() {
    return {
      activeView: "dashboard",
      totalArticles: 0,
      totalVisits: 0,
      totalComments: 0,
      totalCategories: 0,
      categoryOptions: {
        tooltip: { 
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)' 
        },
        legend: { 
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { 
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { 
            show: true,
            formatter: '{b}: {c}'
          },
          data: []
        }]
      },
      hotArticlesOptions: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            interval: 0,
            formatter: function (value) {
              if (value.length > 8) {
                return value.substring(0, 8) + '...';
              }
              return value;
            }
          }
        },
        series: [{
          name: '访问量',
          type: 'bar',
          data: [],
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }
    };
  },
  methods: {
    setActiveView(index) {
      this.activeView = index;
      console.log(this.activeView);
    },
    logout() {
      this.$router.push('/');
    },
    async fetchDashboardData() {
      try {
        // 获取文章总数
        const articlesResponse = await axios.get(`${this.$baseUrl}/api/articles/counts`);
        if (articlesResponse.data.code === 200) {
          this.totalArticles = articlesResponse.data.data;
        }

        // 获取访问量
        const visitsResponse = await axios.get(`${this.$baseUrl}/api/totalVisitCount`);
        if (visitsResponse.data.code === 200) {
          this.totalVisits = visitsResponse.data.data;
        }

        // 获取评论数
        const commentsResponse = await axios.get(`${this.$baseUrl}/api/comments/counts`);
        if (commentsResponse.data.code === 200) {
          this.totalComments = commentsResponse.data.data;
        }

        // 获取分类数
        const categoriesResponse = await axios.get(`${this.$baseUrl}/api/categories/total`);
        if (categoriesResponse.data.code === 200) {
          this.totalCategories = categoriesResponse.data.data;
        }

        // 获取分类数据和名称
        const categoriesListResponse = await axios.get(`${this.$baseUrl}/api/categories`);
        if (categoriesListResponse.data.code === 200) {
          
          const categoryCountsResponse = await axios.get(`${this.$baseUrl}/api/categories/counts`);
          const categoryData = categoryCountsResponse.data.data;
          
          const categoryDistribution = await Promise.all(
            Object.entries(categoryData).map(async ([id, count]) => {
              const categoryNameResponse = await axios.get(`${this.$baseUrl}/api/categories/name/${id}`);
              let name = categoryNameResponse.data.code === 200 ? categoryNameResponse.data.data : `分类${id}`;
              if (name == null) name = "未分类"
              return { value: count, name: name };
            })
          );
          
          this.categoryOptions.series[0].data = categoryDistribution;
        }

        // 获取热门文章数据
        const statsResponse = await axios.get(`${this.$baseUrl}/api/stats`);
        if (statsResponse.data) {
          // 获取前5篇热门文章并排序
          const top5Articles = statsResponse.data.popularArticles
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);
            
          this.hotArticlesOptions.yAxis.data = top5Articles.map(article => article.title);
          this.hotArticlesOptions.series[0].data = top5Articles.map(article => article.views);
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        this.$message.error('获取数据失败');
      }
    }
  },
  mounted() {
    this.fetchDashboardData();
  }
};
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#admin-app {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.admin-sidebar {
  width: 250px;
  background-color: #ffffff;
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

.admin-sidebar .el-menu {
  border-right: none;
}

.admin-sidebar .el-menu-item {
  color: #333;
}

.admin-sidebar .el-menu-item:hover,
.admin-sidebar .el-menu-item.is-active {
  background-color: #f5f5f5;
}

.admin-sidebar .el-menu-item i {
  color: #409EFF;
  margin-right: 0.5rem;
}

.admin-main-content {
  flex-grow: 1;
  padding: 0;
  background-color: #f8f9fa;
  height: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-card .stat-icon {
  font-size: 24px;
  margin-right: 1rem;
}

.stat-card .stat-number {
  font-size: 24px;
  font-weight: bold;
}

.charts-container {
  padding: 1rem;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 400px;
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
  color: #666;
}
</style>
