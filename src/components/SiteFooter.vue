<template>
  <footer class="site-footer">
    <a 
      href="https://beian.miit.gov.cn" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="beian-link"
    >
      闽ICP备2025086821号-1
    </a>
  </footer>
</template>

<script>
export default {
  name: 'SiteFooter'
}
</script>

<style scoped>
.site-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 0;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-top: 1px solid #eee;
  z-index: 1000;
}

.beian-link {
  color: #666;
  text-decoration: none;
  font-size: 12px;
  transition: color 0.3s ease;
}

.beian-link:hover {
  color: #333;
}
</style>