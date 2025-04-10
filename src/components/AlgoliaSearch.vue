<template>
  <div class="search-container">
    <div class="search-input-container">
      <input
        v-model="query"
        @input="search"
        placeholder="搜索文章可以通过标题，摘要，分类关键字..."
        class="search-input"
      />
      <div class="algolia-attribution">
        <span>通过alogolia Api服务进行搜索(感谢)</span>
        <img src="../assets/Algolia.svg" alt="Algolia" class="algolia-logo" />
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="hits.length" class="search-results">
      <div 
        v-for="hit in hits" 
        :key="hit.objectID" 
        class="search-result-item"
        @click="viewArticle(hit.objectID)"
      >
        <h3 v-html="hit._highlightResult.title.value"></h3>
        <div 
          v-html="getFormattedSummary(hit._highlightResult.summary.value)" 
          class="summary markdown-content"
        ></div>
        <div class="meta-info">
          <span class="category">{{ hit.categoryName }}</span>
          <span class="date">{{ formatDate(hit.createTime) }}</span>
        </div>
        <div class="tags">
          <span v-for="(tag, index) in hit.tags" :key="index" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="hits.length === 0 && !loading && query" class="no-results">
      No results found
    </div>
  </div>
</template>
  
  <script>
import algoliasearch from "algoliasearch";
import marked from 'marked'; // 添加 marked 导入

export default {
  data() {
    return {
      query: "",
      hits: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    search() {
      if (!this.query) {
        this.hits = [];
        return;
      }

      this.loading = true;
      this.error = null;

      const client = algoliasearch(
        "Y66RW22AX0",
        "def7570d0b483c891c0c8fb8ccb14376"
      );
      const index = client.initIndex("articles");

      index
        .search(this.query)
        .then(({ hits }) => {
          this.hits = hits;
        })
        .catch((err) => {
          this.error = "An error occurred: " + err.message;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatDate(date) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(date).toLocaleDateString("en-US", options);
    },
    viewArticle(objectID) {
      this.$router.push(`/article/${objectID}`);
    },
    getFormattedSummary(summary) {
      if (!summary) return '';
      // 处理高亮文本
      const processedSummary = summary.replace(
        /<em>(.*?)<\/em>/g, 
        '<span class="highlight">$1</span>'
      );
      // 转换 Markdown 并返回
      return marked(processedSummary);
    }
  },
};
</script>
  
  <style scoped>
.search-container {
  width: 100%;
  max-width: 1200px; /* 增加最大宽度 */
  margin: 20px auto;
  padding: 0 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.search-input-container {
  position: relative;
  margin-bottom: 45px;
  width: 100%; /* 确保输入框容器占满宽度 */
}

.search-input {
  width: 100%;
  padding: 15px 40px 15px 20px; /* 增加内边距 */
  font-size: 16px;
  border: 1px solid #e0e0e0; /* 添加边框 */
  border-radius: 10px;
  background-color: #ffffff;
  color: #1d1d1f;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.algolia-attribution {
  position: absolute;
  right: 12px;
  bottom: -35px; /* 调整位置 */
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5468ff;
  background-color: white; /* 添加背景色 */
  padding: 4px 8px; /* 添加内边距 */
  border-radius: 4px; /* 添加圆角 */
  z-index: 10; /* 确保显示在搜索结果上方 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 添加轻微阴影 */
}

.algolia-logo {
  height: 16px;
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.search-results {
  position: relative;
  z-index: 1; /* 确保在 Algolia 标识下方 */
  margin-top: 20px;
  width: 100%; /* 确保结果区域占满宽度 */
}

.search-result-item {
  width: 100%; /* 确保每个结果项占满宽度 */
  padding: 24px; /* 增加内边距 */
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
  cursor: pointer; /* 添加鼠标指针样式 */
}

.search-result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #0066cc;
  font-weight: 500;
}

.summary {
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.5;
  margin: 0 0 12px 0;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.category {
  font-size: 13px;
  color: #0066cc;
  background: rgba(0, 102, 204, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.date {
  font-size: 13px;
  color: #86868b;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 12px;
  color: #515154;
  background: #f5f5f7;
  padding: 4px 8px;
  border-radius: 6px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f5f5f7;
  border-top: 2px solid #0066cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error {
  color: #ff3b30;
  text-align: center;
  padding: 20px;
  font-size: 14px;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #86868b;
  font-size: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .search-container {
    padding: 0 15px;
  }

  .search-input {
    font-size: 16px;
    padding: 12px 30px 12px 15px;
  }

  .search-result-item {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .search-container {
    padding: 0 16px;
  }

  .search-input {
    font-size: 14px;
  }

  .search-result-item {
    padding: 16px;
  }
}

/* 添加 Markdown 内容样式 */
.markdown-content {
  color: #1d1d1f;
  line-height: 1.6;
}

.markdown-content :deep(p) {
  margin: 0 0 0.5em 0;
}

.markdown-content :deep(code) {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: Monaco, Consolas, "Courier New", monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-content :deep(ul), 
.markdown-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #6a737d;
}

/* 高亮样式 */
.markdown-content :deep(.highlight) {
  background-color: rgba(84, 104, 255, 0.1);
  color: #5468ff;
  padding: 0 2px;
  border-radius: 2px;
}

/* 自定义滚动条样式 */
.summary::-webkit-scrollbar {
  width: 4px;
}

.summary::-webkit-scrollbar-track {
  background: #f5f5f7;
}

.summary::-webkit-scrollbar-thumb {
  background: #c1c1c4;
  border-radius: 2px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .summary {
    max-height: 150px;
    font-size: 13px;
  }
}
</style>