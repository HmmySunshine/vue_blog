<template>
    <div class="article-page-layout">
      <div class="article-list">
        <h1>文章列表</h1>
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="viewArticle(article.id)"
        >
          <div class="article-header">
            <h2 class="article-title">{{ article.title }}</h2>
            <div class="article-meta">
              <span class="article-category">{{ article.category.name }}</span>
              <span class="article-date">发布于:{{ formatDate(article.createTime) }}</span>
            </div>
          </div>
          <div class="article-summary" v-html="article.summary"></div>
          <div class="article-footer">
            <div class="article-tags">
              <span
                v-for="tag in article.tagsSet"
                :key="tag.id"
                class="article-tag"
              >{{ tag.name }}</span>
            </div>
            <div class="article-stats">
              <span class="article-views"><i class="fas fa-eye"></i> {{ article.views }}</span>
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
              <span class="article-rank" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
              <span class="article-title">{{ article.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        articles: [],
        currentPage: 1,
        total: 0,
        pageSize: 10,
        stats: {
          totalVisits: 1729768,
          todayVisits: 155,
          topReads: 321695
        },
        popularArticles: [
          { id: 1, title: '【穆屏壁纸❤️】第十三期✨' },
          { id: 2, title: '女明星-迪丽热巴2' },
          { id: 3, title: '11月热门好看的壁纸分享' },
          { id: 4, title: '山水风景图' },
          { id: 5, title: '黑白风格动漫女孩' },
          { id: 6, title: '个人收藏壁纸' },
          { id: 7, title: 'Mac电脑壁纸' }
        ]
      };
    },
    mounted() {
      this.fetchArticles();
    },
    methods: {
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
        return num.toLocaleString()
      },
    },
  };
  </script>
  
  <style scoped>
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
  
  .popular-articles .rank-1 { color: #ff6b6b; }
  .popular-articles .rank-2 { color: #ff9f43; }
  .popular-articles .rank-3 { color: #ffd93d; }
  
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
  </style>