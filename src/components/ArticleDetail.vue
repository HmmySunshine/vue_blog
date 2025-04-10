<template>
  <div class="article-container">
    <!-- Article Header -->
    <div class="article-header">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-meta">
        <el-tag size="small" type="primary">{{
          article.category?.name
        }}</el-tag>
        <span class="article-time">
          <i class="el-icon-time"></i>
          {{ formatDate2(article.createTime) }}
        </span>
      </div>
    </div>

    <!-- Article Content -->
    <div class="article-content markdown-content" v-html="formattedContent"></div>

    <!-- Comments Section -->
    <div class="comments-section">
      <h3>评论区</h3>

      <!-- Comment Form -->
      <div v-if="isLoggedIn" class="comment-form">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
        ></el-input>
        <el-button
          type="primary"
          @click="submitComment"
          :loading="submitting"
          class="submit-btn"
        >
          发表评论
        </el-button>
      </div>
      <el-alert
        v-else
        title="请登录后发表评论"
        type="info"
        :closable="false"
        show-icon
      >
        <el-button type="text" @click="goToLogin">立即登录</el-button>
      </el-alert>

      <!-- Comments List -->
      <div class="comments-list">
        <div v-if="comments.length === 0" class="no-comments">
          暂无评论，来做第一个评论的人吧！
        </div>
        <el-card
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-header">
            <span class="username">用户名: {{ comment.username }}</span>
            <span class="comment-time"
              >评论时间: {{ formatDate1(comment.createdAt) }}</span
            >
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </el-card>

        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="pageSize"
          layout="sizes, prev, pager, next"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>
  
  <script>
import axios from "axios";
import marked from 'marked'; // 导入 marked

export default {
  data() {
    return {
      article: {},
      comments: [],
      newComment: "",
      submitting: false,
      isLoggedIn: false, // 这里应该根据你的登录状态管理来设置
      total: 0,
      pageSize: 5,
      currentPage: 1,
    };
  },
  computed: {
    formattedContent() {
      return this.article.content ? marked(this.article.content) : '';
    }
  },
  mounted() {
    this.fetchArticleDetail();
    this.fetchComments();
    this.checkLoginStatus();
  },
  methods: {
    async fetchArticleDetail() {
      try {
        const articleId = this.$route.params.id;
        const response = await axios.get(
          `${this.$baseUrl}/api/articles/${articleId}`
        );
        if (response.data.code === 200) {
          this.article = response.data.data;
        }
      } catch (error) {
        this.$message.error("获取文章详情失败");
        console.error("Error fetching article detail:", error);
      }
    },
    async fetchComments() {
      try {
        const articleId = this.$route.params.id;
        const response = await axios.get(
          `${this.$baseUrl}/api/comments/${articleId}`,
          {
            params: {
              //当前页码
              page: this.currentPage,
              //每页显示条数
              pageSize: this.pageSize,
            },
          }
        );

        if (response.data.code === 200) {
          this.comments = response.data.data.pageList;
          this.total = response.data.data.total;
        }
      } catch (error) {
        this.$message.error("获取评论失败");
        console.error("Error fetching comments:", error);
      }
    },
    async submitComment() {
      if (!this.newComment.trim()) {
        this.$message.warning("评论内容不能为空");
        return;
      }

      this.submitting = true;
      try {
        const response = await axios.post(
          `${this.$baseUrl}/api/comments`,
          {
            userId: localStorage.getItem("userId"),
            articleId: this.$route.params.id,
            content: this.newComment,
          }
        );

        if (response.data.code === 200) {
          this.$message.success("评论发表成功");
          this.newComment = "";
          await this.fetchComments(); // 重新获取评论列表
        }
      } catch (error) {
        this.$message.error("评论发表失败");
        console.error("Error submitting comment:", error);
      } finally {
        this.submitting = false;
      }
    },
    checkLoginStatus() {
      // 这里应该根据你的登录状态管理来实现
      const token = localStorage.getItem("token");
      this.isLoggedIn = !!token;
    },
    goToLogin() {
      this.$router.push("/login");
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchComments();
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.fetchComments();
    },
    formatDate1(timestamp) {
      if (typeof timestamp !== "number") {
        return "无效日期";
      }
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      const second = date.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    formatDate2(dateArray) {
      if (!Array.isArray(dateArray) || dateArray.length !== 6) {
        return "无效日期";
      }
      const [year, month, day, hour, minute, second] = dateArray;
      return `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
    },
  },
};
</script>
  
  <style scoped>
.article-container {
  max-width: 1200px; /* 增加最大宽度 */
  margin: 0 auto;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 60px; /* 为底部备案信息留出空间 */
}

.article-header {
  margin-bottom: 40px;
  text-align: center;
}

.article-title {
  font-size: 2.5em; /* 增大标题字号 */
  color: #2c3e50;
  margin-bottom: 20px;
  line-height: 1.4;
}

.article-meta {
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 1.1em; /* 增大元信息字号 */
}

.article-time {
  font-size: 1em;
  color: #909399;
}

.article-content {
  line-height: 2;
  color: #2c3e50;
  margin-bottom: 60px;
  font-size: 1.1em; /* 增大正文字号 */
  padding: 0 20px; /* 添加内边距 */
}

.comments-section {
  margin-top: 60px;
  padding-top: 30px;
  border-top: 2px solid #eee;
  width: 100%; /* 确保评论区占满容器宽度 */
}

.comments-section h3 {
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 1.8em;
}

.comment-form {
  margin-bottom: 40px;
  width: 100%;
}

.comment-form .el-input {
  margin-bottom: 15px;
}

.submit-btn {
  margin-top: 15px;
  padding: 10px 25px;
}

.comments-list {
  margin-top: 30px;
  width: 100%;
}

.comment-item {
  margin-bottom: 20px;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.username {
  font-weight: bold;
  color: #409eff;
  font-size: 1.1em;
}

.comment-time {
  color: #909399;
  font-size: 0.95em;
}

.comment-content {
  color: #2c3e50;
  line-height: 1.8;
  padding: 15px;
  font-size: 1.1em;
}

.no-comments {
  text-align: center;
  color: #909399;
  padding: 30px;
  font-size: 1.1em;
}

/* 确保文章内容中的图片不会溢出容器并且居中显示 */
:deep(.article-content img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 20px auto;
}

/* 添加响应式布局 */
@media (max-width: 1200px) {
  .article-container {
    max-width: 95%;
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .article-container {
    padding: 15px;
  }
  
  .article-title {
    font-size: 2em;
  }
  
  .article-content {
    padding: 0 10px;
  }
}

/* 添加 Markdown 样式 */
.markdown-content :deep(h1) {
  font-size: 2em;
  margin: 1.5em 0 1em;
  border-bottom: 2px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  margin: 1.5em 0 1em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
  margin: 1em 0;
}

.markdown-content :deep(p) {
  margin: 1em 0;
  line-height: 1.8;
}

.markdown-content :deep(blockquote) {
  margin: 1em 0;
  padding: 0.5em 1em;
  color: #666;
  border-left: 4px solid #42b983;
  background-color: #f8f8f8;
}

.markdown-content :deep(code) {
  background-color: #f8f8f8;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: #f8f8f8;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-content :deep(a) {
  color: #42b983;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 0.6em 1em;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f6f8fa;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5em auto;
  border-radius: 5px;
}

/* 代码高亮主题 */
.markdown-content :deep(pre) {
  background: #2d2d2d;
  color: #ccc;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  color: #ccc;
  background: transparent;
  padding: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .markdown-content :deep(h1) {
    font-size: 1.8em;
  }

  .markdown-content :deep(h2) {
    font-size: 1.4em;
  }

  .markdown-content :deep(h3) {
    font-size: 1.2em;
  }
  
  .markdown-content :deep(pre) {
    padding: 0.8em;
  }
}
</style>