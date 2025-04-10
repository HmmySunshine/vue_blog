<template>
  <div class="article-page-layout">
    <div class="article-list">
      <h1 class="page-title">文章专栏</h1>
      <div class="magazine-grid">
        <div
          v-for="(article, index) in articles"
          :key="article.id"
          :class="['article-item', `article-size-${getArticleSize(index)}`]"
          @click="viewArticle(article.id)"
        >
          <div class="article-cover">
            <template v-if="article.coverImage">
              <img :src="article.coverImage" :alt="article.title" />
            </template>
            <template v-else>
              <div 
                class="default-cover" 
                :class="[`gradient-${(article.id % 4) + 1}`, getArticleSize(index)]"
              >
                <span class="cover-text">{{ getInitialCharacter(article.title) }}</span>
              </div>
            </template>
            <div class="article-category-tag">
              {{ article.category ? article.category.name : "未分类" }}
            </div>
          </div>
          <div class="article-content">
            <h2 class="article-title">{{ article.title }}</h2>
            <div class="article-summary" v-html="getFormattedSummary(article.summary)"></div>
            <div class="article-meta">
              <div class="meta-left">
                <span class="publish-date">
                  <i class="el-icon-date"></i>
                  {{ formatDate(article.createTime) }}
                </span>
                <span class="view-count">
                  <i class="el-icon-view"></i>
                  {{ article.views }}
                </span>
              </div>
              <div class="meta-right">
                <div class="tag-list">
                  <el-tag
                    v-for="tag in article.tagsSet"
                    :key="tag.id"
                    size="mini"
                    effect="plain"
                  >
                    {{ tag.name }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-size="pageSize"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
    <div class="sidebar-widget">
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

      <div class="popular-articles">
        <h3 class="section-title">文章阅读排行榜</h3>
        <div class="article-list">
          <div
            v-for="(article, index) in popularArticles"
            :key="index"
            class="article-item"
            @click="viewArticle(article.id)"
          >
            <span class="article-rank" :class="`rank-${index + 1}`">{{
              index + 1
            }}</span>
            <span class="article-title">{{ article.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import marked from 'marked';

export default {
  data() {
    return {
      articles: [],
      currentPage: 1,
      total: 0,
      pageSize: 10,
      //默认给写值防止意外
      stats: {
        totalVisits: 1729768,
        todayVisits: 155,
        topReads: 321695,
      },
      popularArticles: [
        { id: 1, title: "【穆屏壁纸❤️】第十三期✨" },
        { id: 2, title: "女明星-迪丽热巴2" },
        { id: 3, title: "11月热门好看的壁纸分享" },
        { id: 4, title: "山水风景图" },
        { id: 5, title: "黑白风格动漫女孩" },
        { id: 6, title: "个人收藏壁纸" },
        { id: 7, title: "Mac电脑壁纸" },
      ],
    };
  },
  mounted() {
    this.fetchArticles();
    this.fetchStats();
  },
  methods: {
    async fetchStats() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/stats`);
        const { totalVisits, todayVisits, popularArticles } = response.data;
        this.stats = {
          totalVisits,
          todayVisits,
          topReads: Math.max(
            ...popularArticles.map((article) => article.views)
          ),
        };
        this.popularArticles = popularArticles;
      } catch (error) {
        console.log("实时统计数据失败", error);
      }
    },
    async fetchArticles() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/articles`, {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize,
          },
        });
        this.articles = response.data.data.articles;
        this.total = response.data.data.total;
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchArticles();
    },
    formatDate(dateArray) {
      const [year, month, day, hour, minute] = dateArray;
      return `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
    },
    viewArticle(id) {
      this.$router.push(`/article/${id}`);
    },
    formatNumber(num) {
      return num.toLocaleString();
    },
    getArticleSize(index) {
      // 创建不同大小的文章卡片
      const pattern = ["large", "medium", "medium", "small", "small", "medium"];
      return pattern[index % pattern.length];
    },
    shouldShowExcerpt(index) {
      // 控制是否显示摘要
      return this.getArticleSize(index) !== "small";
    },
    getInitialCharacter(title) {
      return title ? title.charAt(0) : '?';
    },
    getFormattedSummary(summary) {
      if (!summary) return '';
      const truncatedSummary = summary.length > 100 ? summary.substring(0, 100) + '...' : summary;
      return marked(truncatedSummary);
    }
  },
};
</script>

<style scoped>
.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #409eff, #36d1dc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.magazine-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.article-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
}

.article-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.article-cover {
  position: relative;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.article-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-item:hover .article-cover img {
  transform: scale(1.05);
}

.article-category-tag {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(45deg, #3498db, #2ecc71);
  border: none;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.article-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-title {
  font-family: "Source Han Sans CN", sans-serif;
  font-weight: 600;
  margin: 1rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-excerpt {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
}

.meta-left {
  display: flex;
  gap: 1rem;
}

.meta-left i {
  margin-right: 0.3rem;
}

.tag-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.el-tag {
  margin: 0;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .magazine-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }
}

.article-page-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  gap: 24px;
  align-items: flex-start;
}

.article-list {
  flex: 1;
  max-width: 800px;
}

.article-card {
  background-color: rgba(255, 255, 255, 0.6);
  opacity: 0.9;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.article-card:hover {
  transform: translateY(-3px);
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.5);
}

.article-header {
  margin-bottom: 16px;
}

.article-title {
  font-size: 1.5rem;
  color: #1d1d1f;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: -0.5px;
  transition: color 0.3s ease;
}

.article-card:hover .article-title {
  color: #0066cc;
}

.article-meta {
  font-size: 0.9rem;
  color: #86868b;
  display: flex;
  align-items: center;
  gap: 12px;
}

.article-category {
  background-color: rgba(0, 102, 204, 0.1);
  color: #0066cc;
  padding: 4px 12px;
  border-radius: 100px;
  font-weight: 500;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.article-category:hover {
  background-color: rgba(0, 102, 204, 0.2);
}

.article-summary {
  color: #484848;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.article-tag {
  background-color: rgba(88, 86, 214, 0.1);
  color: #5856d6;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.article-tag:hover {
  background-color: rgba(88, 86, 214, 0.2);
}

.article-stats {
  color: #86868b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-views i {
  color: #0066cc;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* Updated sidebar styles to match the light theme */
.sidebar-widget {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

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

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.popular-articles .article-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.popular-articles .article-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.popular-articles .article-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.popular-articles .article-rank {
  font-size: 14px;
  font-weight: 600;
  min-width: 20px;
}

.popular-articles .rank-1 {
  color: #ff6b6b;
}
.popular-articles .rank-2 {
  color: #ff9f43;
}
.popular-articles .rank-3 {
  color: #ffd93d;
}

.popular-articles .article-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .article-page-layout {
    flex-direction: column;
  }

  .sidebar-widget {
    width: 100%;
    position: static;
  }
}

@media (max-width: 768px) {
  .article-page-layout {
    padding: 16px;
  }

  .article-card {
    padding: 16px;
  }

  .article-title {
    font-size: 1.25rem;
  }
}

/* 大尺寸文章 - 横跨 8 列 */
.article-size-large {
  grid-column: span 8;
  grid-row: span 2;
}

.article-size-large .article-cover {
  padding-top: 50%;
}

.article-size-large .article-title {
  font-size: 1.8rem;
}

/* 中等尺寸文章 - 横跨 6 列 */
.article-size-medium {
  grid-column: span 6;
}

.article-size-medium .article-cover {
  padding-top: 56.25%;
}

/* 小尺寸文章 - 横跨 4 列 */
.article-size-small {
  grid-column: span 4;
}

.article-size-small .article-cover {
  padding-top: 75%;
}

.article-size-small .article-title {
  font-size: 1rem;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .article-size-large {
    grid-column: span 12;
  }

  .article-size-medium {
    grid-column: span 6;
  }

  .article-size-small {
    grid-column: span 6;
  }
}

@media (max-width: 768px) {
  .magazine-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .article-size-large,
  .article-size-medium,
  .article-size-small {
    grid-column: span 1;
  }

  .article-size-large .article-title {
    font-size: 1.4rem;
  }
}

.default-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.cover-text {
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: bold;
}

/* 大尺寸文章的封面文字 */
.article-size-large .cover-text {
  font-size: 4rem;
}

/* 中等尺寸文章的封面文字 */
.article-size-medium .cover-text {
  font-size: 3rem;
}

/* 小尺寸文章的封面文字 */
.article-size-small .cover-text {
  font-size: 2rem;
}

/* 渐变背景样式 */
.gradient-1 {
  background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 99%, #FAD0C4 100%);
}

.gradient-2 {
  background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
}

.gradient-3 {
  background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
}

.gradient-4 {
  background: linear-gradient(to top, #37ecba 0%, #72afd3 100%);
}

/* 悬停效果 */
.default-cover:hover {
  transform: scale(1.05);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .article-size-large .cover-text {
    font-size: 3rem;
  }
  
  .article-size-medium .cover-text {
    font-size: 2.5rem;
  }
  
  .article-size-small .cover-text {
    font-size: 1.8rem;
  }
}

.article-summary :deep(p) {
  margin: 0;
  line-height: 1.6;
}

.article-summary :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.article-summary :deep(code) {
  font-family: Monaco, Consolas, "Courier New", monospace;
  font-size: 0.9em;
}
</style>