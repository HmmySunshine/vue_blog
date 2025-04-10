<template>
  <div class="admin-layout">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "AdminLayout"
};
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}
</style>