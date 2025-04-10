<template>
  <div class="tag-articles">
    <div class="tag-header">
      <h1>
        <i class="fas fa-tag"></i>
        {{ currentTag }}
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
  name: 'TagArticles',
  data() {
    return {
      articles: [],
      currentTag: '',
      total: 0,
      currentPage: 1,
      pageSize: 10
    }
  },
  methods: {
    async fetchArticles() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/articles/tag/${this.$route.params.tagId}`, {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize
          }
        });
        if (response.data.code === 200) {
          this.articles = response.data.data.content;
          this.total = response.data.data.totalElements;
          if (response.data.data.tagName) {
            this.currentTag = response.data.data.tagName;
          }
          
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        this.$message.error('获取文章失败');
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
    }
  },
  created() {
    this.fetchArticles();
  },
  watch: {
    '$route.params.tagId'() {
      this.currentPage = 1;
      this.fetchArticles();
    }
  }
}
</script>

<style scoped>
.tag-articles {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tag-header {
  text-align: center;
  margin-bottom: 3rem;
}

.tag-header h1 {
  font-size: 2rem;
  color: #409EFF;
  margin-bottom: 0.5rem;
}

.tag-header p {
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
}
</style>