<template>
  <div class="search-result-item" @click="$emit('click', result.objectID)">
    <h3 v-html="result._highlightResult.title.value"></h3>
    <div 
      v-html="formattedSummary" 
      class="summary markdown-content"
    ></div>
    <div class="meta-info">
      <span class="category">{{ result.categoryName }}</span>
      <span class="date">{{ formattedDate }}</span>
    </div>
    <div class="tags">
      <span v-for="(tag, index) in result.tags" :key="index" class="tag">
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script>
import marked from 'marked';

export default {
  props: {
    result: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedSummary() {
      if (!this.result._highlightResult?.summary?.value) return '';
      
      const processedSummary = this.result._highlightResult.summary.value.replace(
        /<em>(.*?)<\/em>/g, 
        '<span class="highlight">$1</span>'
      );
      return marked(processedSummary);
    },
    formattedDate() {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(this.result.createTime).toLocaleDateString("zh-CN", options);
    }
  }
}
</script>

<style scoped>
.search-result-item {
  width: 100%;
  padding: 24px;
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
  cursor: pointer;
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

/* Markdown 样式和响应式样式保留... */
</style>