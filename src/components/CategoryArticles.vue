<template>
  <div class="category-articles">
    <div class="category-header">
      <h1>
        <i :class="getCategoryIcon(currentCategory)"></i>
        {{ currentCategory || '未分类文章' }}
      </h1>
      <p>共 {{ total }} 篇文章</p>
    </div>

    <div class="articles-grid">
      <div v-for="article in articles" :key="article.id" class="article-card" @click="viewArticle(article.id)">
        <div class="article-meta">
          <span class="publish-date">
            <i class="el-icon-date"></i>
            {{ formatDate(article.createTime) }}
          </span>
          <span class="view-count">
            <i class="el-icon-view"></i>
            {{ article.views }} 阅读
          </span>
        </div>
        <h2 class="article-title">{{ article.title }}</h2>
        <p class="article-summary">{{ article.summary }}</p>
        <div class="article-tags" v-if="article.tags && article.tags.length">
          <el-tag v-for="tag in article.tags" :key="tag" size="small">{{ tag }}</el-tag>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="total > 0"
      :current-page.sync="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CategoryArticles',
  props: {
    categoryId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      articles: [],
      currentCategory: '',
      total: 0,
      currentPage: 1,
      pageSize: 10
    }
  },
  methods: {
    async fetchArticles() {
      try {
        // 添加更多调试信息
        console.log('Props categoryId:', this.categoryId);
        console.log('Route params:', this.$route.params);
        
        // 优先使用路由参数，因为 props 可能不会正确传递
        const categoryId = this.$route.params.categoryId || this.categoryId;
        console.log('最终使用的 categoryId:', categoryId);
        
        if (!categoryId) {
          throw new Error('无效的分类ID');
        }

        let url = `${this.$baseUrl}/api/articles/category/${categoryId}`;
        console.log('请求URL:', url);

        const response = await axios.get(url, {
          params: {
            page: this.currentPage - 1,
            pageSize: this.pageSize
          }
        });

        if (response.data.code === 200) {
          const { data } = response.data;
          console.log('API响应数据:', data);

          this.articles = data.articles || [];
          this.total = data.total || 0;

          if (categoryId === 'uncategorized') {
            this.currentCategory = '未分类文章';
          } else if (this.articles.length > 0 && this.articles[0].category) {
            this.currentCategory = this.articles[0].category.name;
          }
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        this.$message.error(error.message || '获取文章失败');
      }
    },
    formatDate(dateArray) {
      if (!Array.isArray(dateArray)) return '';
      const [year, month, day] = dateArray;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    },
    viewArticle(id) {
      this.$router.push(`/article/${id}`);
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchArticles();
    },
    getCategoryIcon(name) {
      const iconMap = {
        Linux: "fab fa-linux",
        算法Java: "fab fa-java",
        数据结构: "fas fa-project-diagram",
        操作系统: "fas fa-desktop",
        LeetCode题解: "fas fa-code",
        IDEA配置参数: "fas fa-tools",
        Vue: "fab fa-vuejs",
        前端开发:"fab fa-html5",
        后端开发:"fab fa-java",
        工具和环境:"fas fa-cogs",
        编程语言: "fas fa-code",
        React: "fab fa-react",
        Python: "fab fa-python",
        Docker: "fab fa-docker",
        Git: "fab fa-git-alt",
        前端: "fas fa-code",
        后端: "fas fa-server",
        数据库: "fas fa-database",
        网络: "fas fa-network-wired",
        安全: "fas fa-shield-alt",
        工具: "fas fa-tools",
        教程: "fas fa-graduation-cap",
        笔记: "fas fa-sticky-note",
        其他: "fas fa-folder",
      };
      if (!name) return 'fas fa-question-circle';
      return iconMap[name] || 'fas fa-folder';
    },
  },
  // 修改生命周期钩子
  created() {
    console.log('组件创建时的路由参数:', this.$route.params);
    this.fetchArticles();
  },
  // 优化 watch
  watch: {
    '$route.params.categoryId': {
      immediate: true,
      handler(newVal) {
        console.log('路由参数变化:', newVal);
        if (newVal) {
          this.currentPage = 1;
          this.fetchArticles();
        }
      }
    },
    categoryId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.currentPage = 1;
          this.fetchArticles();
        }
      }
    }
  }
}
</script>

<style scoped>
.category-articles {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.category-header {
  text-align: center;
  margin-bottom: 3rem;
}

.category-header h1 {
  font-size: 2rem;
  color: #409EFF;
  margin-bottom: 0.5rem;
}

.category-header p {
  color: #666;
}

.articles-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.article-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.article-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.article-title {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #333;
}

.article-summary {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.el-tag {
  margin: 0;
}
</style>