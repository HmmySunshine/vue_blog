<template>
  <div class="timeline-container">
    <h1 class="timeline-title">
      <i class="el-icon-time"></i>
      时光轴 | 文章历程
    </h1>
    <el-timeline>
      <el-timeline-item
        v-for="article in articles"
        :key="article.id"
        :timestamp="formatDate(article.createTime)"
        :type="getRandomType()"
        placement="top"
        class="timeline-item"
      >
        <el-card 
          class="timeline-card" 
          shadow="hover"
          @click.native.prevent="viewArticle(article.id)"
        >
          <div class="article-header">
            <h3 class="article-title">{{ article.title }}</h3>
            <div class="article-meta">
              <span class="article-category" v-if="article.category">
                <i class="el-icon-folder"></i>
                {{ article.category.name }}
              </span>
              <span class="article-views">
                <i class="el-icon-view"></i>
                {{ article.views }} 阅读
              </span>
            </div>
          </div>
          <!-- 只显示简短摘要 -->
          <div class="article-brief" v-if="article.summary">
            <!-- 使用v-html指令渲染解析后的HTML -->
            <div v-html="getFormattedSummary(article.summary)"></div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import axios from "axios";
import marked from 'marked'; // 导入marked

export default {
  data() {
    return {
      articles: [],
    };
  },
  methods: {
    async fetchArticles() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/articles`);
        if (response.data.code === 200) {
          this.articles = response.data.data.articles;
        }
      } catch (error) {
        console.error("获取文章失败:", error);
        this.$message.error("获取文章失败，请稍后重试");
      }
    },
    formatDate(dateArray) {
      if (!Array.isArray(dateArray) || dateArray.length < 5) {
        return "无效日期";
      }
      const [year, month, day, hour, minute] = dateArray;
      return `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
    },
    getRandomType() {
      const types = ['primary', 'success', 'warning', 'danger', 'info'];
      return types[Math.floor(Math.random() * types.length)];
    },
    truncateSummary(summary) {
      return summary.length > 100 ? summary.substring(0, 100) + '...' : summary;
    },
    async viewArticle(id) {
      try {
        // 先检查文章是否存在
        const response = await axios.get(`${this.$baseUrl}/api/articles/${id}`);
        if (response.data.code === 200) {
          await this.$router.push({
            path: `/article/${id}`
          });
        } else {
          this.$message.error('文章不存在');
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        this.$message.error('获取文章失败，请稍后重试');
      }
    },
    // 获取更简短的摘要
    getFormattedSummary(summary) {
      if (!summary) return '';
      // 先截取摘要
      const truncatedSummary = summary.length > 50 ? summary.substring(0, 50) + '...' : summary;
      // 使用marked转换为HTML
      return marked(truncatedSummary);
    },
    
    getBrief(summary) {
      // 这个方法可以移除了,使用上面的getFormattedSummary替代
      return this.getFormattedSummary(summary);
    }
  },
  mounted() {
    this.fetchArticles();
  },
};
</script>

<style scoped>
.timeline-container {
  max-width: 1000px; /* 增加容器宽度 */
  margin: 20px auto;
  padding: 40px; /* 增加内边距 */
  background-color: #ffffff;
  border-radius: 12px; /* 增加圆角 */
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.timeline-title {
  text-align: center;
  color: #409eff;
  margin-bottom: 40px;
  font-size: 2em;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.timeline-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  padding: 20px; /* 增加卡片内边距 */
  margin: 10px 0; /* 增加卡片间距 */
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.timeline-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* 添加点击反馈效果 */
.timeline-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-card:active::after {
  opacity: 1;
}

.article-header {
  margin-bottom: 15px;
}

.article-title {
  margin: 0 0 15px 0; /* 增加标题下方间距 */
  color: #303133;
  font-size: 1.4em; /* 增大标题字号 */
  line-height: 1.4;
}

.article-meta {
  color: #909399;
  font-size: 1em; /* 增大元信息字号 */
  display: flex;
  align-items: center;
  gap: 20px; /* 增加元素间距 */
  margin-bottom: 15px;
}

.article-category {
  background-color: #f0f2f5;
  padding: 4px 12px; /* 增加分类标签内边距 */
  border-radius: 16px;
  font-size: 0.9em;
}

.article-summary {
  color: #606266;
  margin: 15px 0;
  line-height: 1.6;
  font-size: 0.95em;
}

.article-footer {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.el-timeline-item {
  margin-bottom: 20px;
}

.el-timeline-item:hover .el-timeline-item__node {
  transform: scale(1.2);
}

.el-timeline-item__node {
  width: 16px !important;
  height: 16px !important;
  transition: transform 0.3s ease;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #409EFF;
}

.el-timeline-item__wrapper:hover .el-timeline-item__node {
  transform: scale(1.2);
  background-color: #409EFF;
}

.article-brief {
  color: #666;
  font-size: 1em; /* 增大摘要字号 */
  margin-top: 15px;
  line-height: 1.8; /* 增加行高 */
  padding: 10px 0; /* 增加上下内边距 */
}

/* 添加markdown内容的样式 */
.article-brief :deep(p) {
  margin: 0;
  line-height: 1.6;
}

.article-brief :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.article-brief :deep(code) {
  font-family: Monaco, Consolas, "Courier New", monospace;
  font-size: 0.9em;
}

/* 添加响应式布局 */
@media screen and (max-width: 1024px) {
  .timeline-container {
    max-width: 90%;
    padding: 30px;
  }
}

@media screen and (max-width: 768px) {
  .timeline-container {
    padding: 20px;
    margin: 10px;
  }
  
  .timeline-title {
    font-size: 1.5em;
  }

  .article-title {
    font-size: 1.2em;
  }

  .article-brief {
    font-size: 0.9em;
  }
}
</style>

