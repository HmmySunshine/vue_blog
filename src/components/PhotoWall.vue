<template>
  <div class="photo-wall-container">
    <div class="photo-grid">
      <PhotoCard
        v-for="photo in displayedPhotos"
        :key="photo.id"
        :photo="photo"
        @preview="showPreview"
      />
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
import { getPhotoList } from "@/api/photo";
import PhotoCard from "@/components/PhotoCard.vue";

export default {
  name: "PhotoWall",
  components: {
    PhotoCard
  },
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
        const { photos, total } = await getPhotoList(this.currentPage, this.pageSize);
        this.photos = photos;
        this.total = total;
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
    }
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
}
</style>