<template>
    <div class="popular-articles">
      <h3 class="section-title">文章阅读排行榜</h3>
      <div class="article-list">
        <div
          v-for="(article, index) in articles"
          :key="index"
          class="article-item"
          @click="$emit('article-click', article.id)"
        >
          <span class="article-rank" :class="`rank-${index + 1}`">{{
            index + 1
          }}</span>
          <span class="article-title">{{ article.title }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "PopularArticles",
    props: {
      articles: {
        type: Array,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .popular-articles {
    margin-top: 1rem;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
  }
  
  .article-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .article-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .article-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .article-rank {
    font-size: 14px;
    font-weight: 600;
    min-width: 20px;
  }
  
  .rank-1 {
    color: #ff6b6b;
  }
  .rank-2 {
    color: #ff9f43;
  }
  .rank-3 {
    color: #ffd93d;
  }
  
  .article-title {
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  </style>