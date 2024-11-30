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
    <div class="article-content" v-html="article.content"></div>

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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-header {
  margin-bottom: 30px;
  text-align: center;
}

.article-title {
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 15px;
}

.article-meta {
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.article-time {
  font-size: 0.9em;
  color: #909399;
}

.article-content {
  line-height: 1.8;
  color: #2c3e50;
  margin-bottom: 40px;
}

.comments-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eeeeee;
}

.comments-section h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.comment-form {
  margin-bottom: 30px;
}

.submit-btn {
  margin-top: 10px;
}

.comments-list {
  margin-top: 20px;
}

.comment-item {
  margin-bottom: 15px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
  color: #409eff;
}

.comment-time {
  color: #909399;
  font-size: 0.9em;
}

.comment-content {
  color: #2c3e50;
  line-height: 1.6;
}

.no-comments {
  text-align: center;
  color: #909399;
  padding: 20px;
}

/* 确保文章内容中的图片不会溢出容器 */
:deep(.article-content img) {
  max-width: 100%;
  height: auto;
}
</style>