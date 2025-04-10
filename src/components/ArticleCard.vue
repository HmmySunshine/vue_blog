<template>
    <div
      :class="['article-item', `article-size-${size}`]"
      @click="$emit('article-click', article.id)"
    >
      <div class="article-cover">
        <template v-if="article.coverImage">
          <img :src="article.coverImage" :alt="article.title" />
        </template>
        <template v-else>
          <div
            class="default-cover"
            :class="[`gradient-${(article.id % 4) + 1}`, size]"
          >
            <span class="cover-text">{{ getInitialCharacter(article.title) }}</span>
          </div>
        </template>
        <div class="article-category-tag">
          {{ article.category ? article.category.name : "未分类" }}
        </div>
      </div>
      <div class="article-content">
        <h2 class="article-title">{{ article.title }}</h2>
        <div v-if="shouldShowExcerpt" class="article-summary" v-html="getFormattedSummary(article.summary)"></div>
        <div class="article-meta">
          <div class="meta-left">
            <span class="publish-date">
              <i class="el-icon-date"></i>
              {{ formatDateArray(article.createTime) }}
            </span>
            <span class="view-count">
              <i class="el-icon-view"></i>
              {{ article.views }}
            </span>
          </div>
          <div class="meta-right">
            <div class="tag-list">
              <el-tag
                v-for="tag in article.tagsSet"
                :key="tag.id"
                size="mini"
                effect="plain"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import marked from "marked";
  import { formatDateArray } from "@/utils/format";
  export default {
    name: "ArticleCard",
    props: {
      article: {
        type: Object,
        required: true
      },
      size: {
        type: String,
        required: true
      }
    },
    computed: {
      shouldShowExcerpt() {
        return this.size !== "small";
      }
    },
    methods: {
      formatDateArray(dateArray) {
        return formatDateArray(dateArray);
      },
      getInitialCharacter(title) {
        return title ? title.charAt(0) : "?";
      },
      getFormattedSummary(summary) {
        if (!summary) return "";
        const truncatedSummary =
          summary.length > 100 ? summary.substring(0, 100) + "..." : summary;
        return marked(truncatedSummary);
      }
    }
  };
  </script>
  
  <style scoped>
  .article-item {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    position: relative;
  }
  
  .article-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .article-cover {
    position: relative;
    padding-top: 56.25%; /* 16:9 比例 */
    overflow: hidden;
  }
  
  .article-cover img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .article-item:hover .article-cover img {
    transform: scale(1.05);
  }
  
  .article-category-tag {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(45deg, #3498db, #2ecc71);
    border: none;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
  }
  
  .article-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .article-title {
    font-family: "Source Han Sans CN", sans-serif;
    font-weight: 600;
    margin: 1rem 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .article-summary {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .article-meta {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #999;
  }
  
  .meta-left {
    display: flex;
    gap: 1rem;
  }
  
  .meta-left i {
    margin-right: 0.3rem;
  }
  
  .tag-list {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .el-tag {
    margin: 0;
    font-size: 0.75rem;
  }
  
  /* 大尺寸文章 */
  .article-size-large {
    grid-column: span 8;
    grid-row: span 2;
  }
  
  .article-size-large .article-cover {
    padding-top: 50%;
  }
  
  .article-size-large .article-title {
    font-size: 1.8rem;
  }
  
  /* 中等尺寸文章 */
  .article-size-medium {
    grid-column: span 6;
  }
  
  .article-size-medium .article-cover {
    padding-top: 56.25%;
  }
  
  /* 小尺寸文章 */
  .article-size-small {
    grid-column: span 4;
  }
  
  .article-size-small .article-cover {
    padding-top: 75%;
  }
  
  .article-size-small .article-title {
    font-size: 1rem;
  }
  
  .default-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .cover-text {
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    font-weight: bold;
  }
  
  /* 大尺寸文章的封面文字 */
  .article-size-large .cover-text {
    font-size: 4rem;
  }
  
  /* 中等尺寸文章的封面文字 */
  .article-size-medium .cover-text {
    font-size: 3rem;
  }
  
  /* 小尺寸文章的封面文字 */
  .article-size-small .cover-text {
    font-size: 2rem;
  }
  
  /* 渐变背景样式 */
  .gradient-1 {
    background: linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 99%, #FAD0C4 100%);
  }
  
  .gradient-2 {
    background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
  }
  
  .gradient-3 {
    background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
  }
  
  .gradient-4 {
    background: linear-gradient(to top, #37ecba 0%, #72afd3 100%);
  }
  
  /* 悬停效果 */
  .default-cover:hover {
    transform: scale(1.05);
  }
  
  .article-summary :deep(p) {
    margin: 0;
    line-height: 1.6;
  }
  
  .article-summary :deep(pre) {
    background: #f6f8fa;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }
  
  .article-summary :deep(code) {
    font-family: Monaco, Consolas, "Courier New", monospace;
    font-size: 0.9em;
  }
  </style>