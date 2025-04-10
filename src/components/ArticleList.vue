<template>
    <div class="article-page-layout">
      <div class="article-list">
        <h1 class="page-title">文章专栏</h1>
        <div class="magazine-grid">
          <ArticleCard
            v-for="(article, index) in articles"
            :key="article.id"
            :article="article"
            :size="getArticleSize(index)"
            @article-click="viewArticle"
          />
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
        <StatsPanel :stats="stats" />
        <PopularArticles :articles="popularArticles" @article-click="viewArticle" />
      </div>
    </div>
  </template>
  
  <script>
  import { getArticleList, getStats } from "@/api/article";
  import ArticleCard from "@/components/ArticleCard.vue";
  import StatsPanel from "@/components/StatsPanel.vue";
  import PopularArticles from "@/components/PopularArticles.vue";
  
  export default {
    name: "ArticleList",
    components: {
      ArticleCard,
      StatsPanel,
      PopularArticles
    },
    data() {
      return {
        articles: [],
        currentPage: 1,
        total: 0,
        pageSize: 10,
        //默认给写值防止意外
        stats: {
          totalVisits: 0,
          todayVisits: 0,
          topReads: 0,
        },
        popularArticles: []
      };
    },
    mounted() {
      this.fetchArticles();
      this.fetchStats();
    },
    methods: {
      async fetchStats() {
        try {
          const statsData = await getStats();
          this.stats = {
            totalVisits: statsData.totalVisits,
            todayVisits: statsData.todayVisits,
            topReads: statsData.topReads
          };
          this.popularArticles = statsData.popularArticles;
        } catch (error) {
          console.log("实时统计数据失败", error);
        }
      },
      async fetchArticles() {
        try {
          const { articles, total } = await getArticleList(
            this.currentPage, 
            this.pageSize
          );
          this.articles = articles;
          this.total = total;
        } catch (error) {
          console.error("Error fetching articles:", error);
        }
      },
      handleCurrentChange(newPage) {
        this.currentPage = newPage;
        this.fetchArticles();
      },
      viewArticle(id) {
        this.$router.push(`/article/${id}`);
      },
      getArticleSize(index) {
        // 创建不同大小的文章卡片
        const pattern = ["large", "medium", "medium", "small", "small", "medium"];
        return pattern[index % pattern.length];
      }
    }
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
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
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
  
  /* 响应式调整 */
  @media (max-width: 1200px) {
    .magazine-grid {
      grid-template-columns: repeat(12, 1fr);
    }
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
    .magazine-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  
    .article-page-layout {
      padding: 16px;
    }
  
    .page-title {
      font-size: 2rem;
    }
  }
  </style>