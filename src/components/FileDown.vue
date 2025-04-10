<template>
  <div class="file-download-page">
    <el-card class="page-header">
      <h1>文件下载中心</h1>
    </el-card>

    <el-input
      v-model="searchKeyword"
      placeholder="输入文件名搜索"
      prefix-icon="el-icon-search"
      clearable
      @clear="handleSearch"
      @input="handleSearch"
      class="search-bar"
    ></el-input>

    <el-card class="file-list-container">
      <div class="file-list-header">
        <div class="file-name-col">名称</div>
        <div class="file-size-col">大小</div>
        <div class="file-date-col">修改时间</div>
        <div class="file-actions-col">操作</div>
      </div>
      
      <div class="file-list">
        <FileItem
          v-for="file in filteredFiles"
          :key="file.id"
          :file="file"
          @download="downloadFile"
        />
      </div>
    </el-card>

    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { getFileList, downloadFile, updateDownloadsCount } from "@/api/file";
import FileItem from "@/components/FileItem.vue";

export default {
  name: "FileDown",
  components: {
    FileItem
  },
  data() {
    return {
      files: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchKeyword: "",
    };
  },
  computed: {
    filteredFiles() {
      if (!this.searchKeyword) {
        return this.files;
      }
      return this.files.filter((file) =>
        file.fileName.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    },
  },
  mounted() {
    this.fetchFiles();
  },
  methods: {
    async fetchFiles() {
      try {
        const { files, total } = await getFileList({
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword,
        });
        
        this.files = files;
        this.total = total;
      } catch (error) {
        console.error("获取文件列表失败:", error);
        this.$message.error("获取文件列表失败，请稍后再试");
      }
    },
    async downloadFile(file) {
      const token = localStorage.getItem("token");
      if (!token) {
        // 使用 Element UI 的 MessageBox 显示更友好的提示
        this.$confirm('下载文件需要登录, 是否立即登录?', '提示', {
          confirmButtonText: '去登录',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          // 保存当前页面路径
          localStorage.setItem('redirectPath', this.$route.fullPath);
          this.$router.push('/login');
        }).catch(() => {});
        return;
      }

      try {
        const response = await downloadFile(file.id);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        this.$message.success("文件下载成功");
        await this.upDateDownloadsCount(file.id);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.$message.error("登录已过期，请重新登录");
          this.$router.push("/login");
          return;
        }
        this.$message.error("文件下载失败，请稍后重试");
      }
    },
    async upDateDownloadsCount(fileId) {
      try {
        const response = await updateDownloadsCount(fileId);
        if (response.data.code === 200) {
          const fileIndex = this.files.findIndex((file) => file.id === fileId);
          if (fileIndex !== -1) {
            this.files[fileIndex].downloads += 1;
          }
        }
      } catch (error) {
        console.error("Error updating downloads count:", error);
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchFiles();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchFiles();
    },
    handleSearch() {
      this.currentPage = 1;
      this.fetchFiles();
    },
  },
};
</script>

<style scoped>
.file-download-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 500px;
}

.file-list-container {
  margin-bottom: 20px;
}

.file-list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 100px;
  padding: 12px 20px;
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.file-list {
  display: flex;
  flex-direction: column;
}

.pagination-container {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .file-list-header {
    grid-template-columns: 2fr 1fr 1fr 80px;
    font-size: 14px;
    padding: 12px 10px;
  }

  .search-bar {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .file-date-col {
    display: none;
  }

  .file-list-header {
    grid-template-columns: 2fr 1fr 80px;
  }
}
</style>