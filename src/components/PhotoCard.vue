<template>
  <div class="photo-item" @click="$emit('preview', photo)">
    <div class="photo-card">
      <el-image
        :src="photo.httpUrl"
        :alt="photo.description"
        fit="cover"
        lazy
      >
        <div slot="placeholder" class="image-placeholder">
          <i class="el-icon-picture-outline"></i>
        </div>
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
      <div class="photo-info">
        <h3>{{ photo.title }}</h3>
        <p>{{ photo.description }}</p>
        <span class="photo-date">{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/utils/format';

export default {
  name: "PhotoCard",
  props: {
    photo: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedDate() {
      return formatDate(this.photo.createdAt);
    }
  }
};
</script>

<style scoped>
.photo-item {
  aspect-ratio: 1;
  perspective: 1000px;
}

.photo-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.photo-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.el-image {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.photo-card:hover .el-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(245, 247, 250, 0.6);
  color: #909399;
}

.photo-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.photo-card:hover .photo-info {
  opacity: 1;
  transform: translateY(0);
}

.photo-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.photo-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.photo-date {
  font-size: 12px;
  opacity: 0.7;
}
</style>