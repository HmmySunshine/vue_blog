<template>
  <div class="categories-container">
    <div class="categories-header">
      <h1>文章分类</h1>
      <p>共计 {{ total }} 个分类</p>
    </div>

    <div class="categories-grid">
      <!-- 修改未分类卡片，添加 router-link -->
      <router-link
        v-if="hasUncategorized"
        :to="{ name: 'uncategorizedArticles' }"
        class="category-card uncategorized"
      >
        <div class="category-icon">
          <i class="fas fa-question-circle"></i>
        </div>
        <h3>未分类</h3>
        <span class="category-count">{{ getCategoryCount(-1) }} 篇文章</span>
      </router-link>

      <router-link
        v-for="category in categories"
        :key="category.id"
        :to="{
          name: 'CategoryArticles',  // 注意这里要和路由配置中的 name 完全一致
          params: { categoryId: category.id.toString() }  // 确保转换为字符串
        }"
        class="category-card"
      >
        <div class="category-icon">
          <i :class="getCategoryIcon(category.name)"></i>
        </div>
        <h3>{{ category.name }}</h3>
        <span class="category-count">
          <i class="fas fa-file-alt"></i>
          {{ getCategoryCount(category.id) }} 篇文章
        </span>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CategoriesView",
  data() {
    return {
      categories: [],
      total: 0,
      categoryCounts: {}, // 添加新的数据属性
    };
  },
  computed: {
    hasUncategorized() {
      return this.categoryCounts[-1] && this.categoryCounts[-1] > 0;
    },
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/categories`);
        if (response.data.code === 200) {
          // 添加处理逻辑，移除重复的名称后缀
          this.categories = response.data.data.categories.map((category) => ({
            ...category,
            name: category.name.replace(/\s+linux$/i, ""), // 移除末尾的 linux 字样，不区分大小写
          }));
          this.total = response.data.data.total;
          await this.fetchCategoryCounts();
        }
      } catch (error) {
        console.error("获取分类失败:", error);
      }
    },
    // 添加新方法获取分类文章数量
    async fetchCategoryCounts() {
      try {
        const response = await axios.get(
          `${this.$baseUrl}/api/categories/counts`
        );
        if (response.data.code === 200) {
          this.categoryCounts = response.data.data;
        }
      } catch (error) {
        console.error("获取分类文章数量失败:", error);
        this.$message.error("获取文章数量失败");
      }
    },
    // 获取分类文章数量的方法
    getCategoryCount(categoryId) {
      return this.categoryCounts[categoryId] || 0;
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
      return iconMap[name] || "fas fa-folder";
    },
  },
  mounted() {
    this.fetchCategories();
  },
};
</script>

<style scoped>
.categories-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  margin-bottom: 60px; /* 为备案信息预留空间 */
}

.categories-header {
  text-align: center;
  margin-bottom: 3rem;
}

.categories-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #409eff, #36d1dc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  padding: 0;
  margin: 0;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%; /* 确保所有卡片高度一致 */
  box-sizing: border-box;
}

/* 添加媒体查询以确保响应式布局 */
@media (min-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr); /* 电脑端显示3列 */
  }
}

@media (min-width: 1200px) {
  .categories-grid {
    grid-template-columns: repeat(4, 1fr); /* 大屏幕显示4列 */
  }
}

@media (max-width: 767px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr); /* 平板端显示2列 */
    gap: 1rem;
  }

  .categories-container {
    padding: 1rem;
  }

  .category-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: 1fr; /* 手机端显示1列 */
  }
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #409eff;
}

.category-card h3 {
  margin: 0.5rem 0;
  font-size: 1.2rem;
}

.category-count {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.category-count i {
  color: #409eff;
  font-size: 0.8rem;
}

.uncategorized {
  background-color: #f5f7fa;
  border: 2px dashed #dcdfe6;
}

.uncategorized .category-icon {
  color: #909399;
}

.uncategorized:hover {
  background-color: #f0f2f5;
  border-color: #c0c4cc;
}
</style>