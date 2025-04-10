<template>
  <div class="tags-container">
    <div class="tags-header">
      <h1>标签云</h1>
      <p>共计 {{ total }} 个标签</p>
    </div>
    
    <div class="tags-cloud">
      <router-link
        v-for="tag in tags"
        :key="tag.id"
        :to="{ name: 'tagArticles', params: { tagId: tag.id }}"
        class="tag-item"
        :style="getRandomStyle(getTagCount(tag.id))"
      >
        {{ tag.name }}
        <span class="tag-count">{{ getTagCount(tag.id) }}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TagsView',
  data() {
    return {
      tags: [],
      total: 0,
      tagCounts: {}, // 添加标签文章计数
      colors: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
    }
  },
  methods: {
    async fetchTags() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/tags/all`);
        if (response.data.code === 200) {
          // 直接使用返回的数组数据
          this.tags = response.data.data;
          this.total = this.tags.length;
          
          // 确保在组件仍然挂载时才获取标签计数
          if (this.$_isDestroyed) return;
          await this.fetchTagCounts();
        }
      } catch (error) {
        if (!this.$_isDestroyed) {
          console.error('获取标签失败:', error);
          this.$message.error('获取标签失败');
        }
      }
    },
    async fetchTagCounts() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/tags/counts`);
        if (response.data.code === 200 && !this.$_isDestroyed) {
          this.tagCounts = response.data.data;
        }
      } catch (error) {
        if (!this.$_isDestroyed) {
          console.error('获取标签文章数量失败:', error);
        }
      }
    },
    getTagCount(tagId) {
      return this.tagCounts[tagId] || 0;
    },
    getRandomStyle(count) {
      // 根据文章数量调整标签大小
      const baseSize = 1;
      const sizeIncrement = count > 0 ? Math.log(count) * 0.2 : 0;
      return {
        backgroundColor: this.colors[Math.floor(Math.random() * this.colors.length)],
        fontSize: `${baseSize + sizeIncrement}rem`
      }
    }
  },
  beforeDestroy() {
    // 添加标记以防止组件销毁后继续处理异步操作
    this.$_isDestroyed = true;
  },
  mounted() {
    this.$_isDestroyed = false;
    this.fetchTags();
  }
}
</script>

<style scoped>
.tags-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tags-header {
  text-align: center;
  margin-bottom: 3rem;
}

.tags-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #409EFF, #36D1DC);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.tag-item {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.tag-count {
  font-size: 0.8em;
  margin-left: 5px;
  opacity: 0.8;
}
</style>