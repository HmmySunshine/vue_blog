<template>
  <div class="photo-wall-container">
    <div class="photo-grid">
      <div
        v-for="photo in displayedPhotos"
        :key="photo.id"
        class="photo-item"
        @click="showPreview(photo)"
      >
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
            <span class="photo-date">{{ formatDate(photo.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      :visible.sync="previewVisible"
      width="80%"
      custom-class="preview-dialog"
      :append-to-body="true"
    >
      <img :src="previewImage" alt="Preview" class="preview-image" />
    </el-dialog>
  </div>
</template>
  
  <script>
import axios from "axios";

export default {
  name: "PhotoWall",
  data() {
    return {
      previewVisible: false,
      previewImage: "",
      photos: [],
      currentPage: 1,
      pageSize: 9, // Fixed to 9 for the 3x3 grid
      total: 0,
    };
  },
  computed: {
    displayedPhotos() {
      return this.photos.slice(0, 9); // Ensure we only show 9 photos
    },
  },
  mounted() {
    this.fetchPhotos();
  },
  methods: {
    async fetchPhotos() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/photos`, {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize,
          },
        });

        if (response.data.code === 200) {
          this.photos = response.data.data.pageList;
          this.total = response.data.data.total;
        }
      } catch (error) {
        console.error("获取照片失败:", error);
        this.$message.error("获取照片失败，请稍后重试");
      }
    },
    showPreview(photo) {
      this.previewImage = photo.httpUrl;
      this.previewVisible = true;
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchPhotos();
    },
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
  },
};
</script>
  
  <style scoped>
.photo-wall-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px 0;
}

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

.pagination-container {
  text-align: center;
  margin-top: 30px;
  padding: 20px 0;
}

.preview-dialog {
  background: rgba(0, 0, 0, 0.9);
  border-radius: 16px;
}

.preview-dialog ::v-deep .el-dialog__header {
  display: none;
}

.preview-dialog ::v-deep .el-dialog__body {
  padding: 0;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}

@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .photo-grid {
    grid-template-columns: 1fr;
  }

  .photo-item {
    aspect-ratio: 4/3;
  }
}
</style>