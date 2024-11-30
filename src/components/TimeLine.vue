<template>
    <div class="timeline-container">
      <h1 class="timeline-title">时光轴 | TimeLine</h1>
      <el-timeline>
        <el-timeline-item
          v-for="article in articles"
          :key="article.id"
          :timestamp="formatDate(article.createTime)"
          placement="top"
          class="timeline-item"
        >
          <el-popover
            placement="right"
            width="300"
            trigger="hover"
            :open-delay="300"
            :close-delay="200"
          >
            <el-card class="article-card">
              <h4>{{ article.title }}</h4>
              <p>发布于: {{ formatDate(article.createTime) }}</p>
              <el-button type="text" @click="viewArticle(article.id)">查看文章</el-button>
            </el-card>
            <div slot="reference" class="timeline-content">
              {{ article.title }}
            </div>
          </el-popover>
        </el-timeline-item>
      </el-timeline>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
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
      viewArticle(articleId) {
        // Add your article viewing logic here.  For example, navigate to a new route.
        console.log(`Viewing article with ID: ${articleId}`);
        // this.$router.push(`/article/${articleId}`);
      }
    },
    mounted() {
      this.fetchArticles();
    },
  };
  </script>
  
  <style scoped>
  .timeline-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
  }
  
  .timeline-title {
    text-align: center;
    color: #409eff;
    margin-bottom: 30px;
  }
  
  .timeline-item {
    cursor: pointer;
  }
  
  .timeline-content {
    padding: 10px;
    background-color: #f0f9ff;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .timeline-content:hover {
    background-color: #e6f7ff;
  }
  
  .article-card {
    margin-bottom: 0;
  }
  
  .article-card h4 {
    margin-top: 0;
    color: #409eff;
  }
  
  .article-card p {
    color: #606266;
    font-size: 14px;
  }
  </style>
  
  