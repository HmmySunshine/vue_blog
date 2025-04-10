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
          <div v-for="file in filteredFiles" :key="file.id" class="file-item">
            <div class="file-name-col">
              <i :class="getFileIcon(file.fileType)"></i>
              <span class="file-name">{{ file.fileName }}</span>
            </div>
            <div class="file-size-col">{{ formatFileSize(file.fileSize) }}</div>
            <div class="file-date-col">{{ formatDate(file.uploadedAt) }}</div>
            <div class="file-actions-col">
              <el-button 
                type="primary" 
                size="small"
                icon="el-icon-download" 
                @click="downloadFile(file)"
              >
                下载
              </el-button>
            </div>
          </div>
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
  import axios from "axios";
  
  export default {
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
          // 移除登录检查,允许未登录用户查看文件列表
          const response = await axios.get(
            `${this.$baseUrl}/api/files/getAllFiles`,
            {
              params: {
                page: this.currentPage,
                pageSize: this.pageSize,
                keyword: this.searchKeyword,
              },
              timeout: 5000,
            }
          );
  
          if (response.data.code === 200 && response.data.data) {
            this.files = response.data.data.pageList;
            this.total = response.data.data.total;
          }
        } catch (error) {
          console.error("获取文件列表失败:", error);
          this.$message.error("获取文件列表失败，请稍后再试");
        }
      },
      getFileIcon(fileType) {
        const iconMap = {
          "application/pdf": "fas fa-file-pdf",
          "application/zip": "fas fa-file-archive",
          "image/jpeg": "fas fa-file-image",
          "image/png": "fas fa-file-image",
          "text/plain": "fas fa-file-alt",
          "application/msword": "fas fa-file-word",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "fas fa-file-word",
          "application/vnd.ms-excel": "fas fa-file-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            "fas fa-file-excel",
          "application/vnd.ms-powerpoint": "fas fa-file-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            "fas fa-file-powerpoint",
        };
        return iconMap[fileType] || "fas fa-file";
      },
      formatFileSize(size) {
        const units = ["B", "KB", "MB", "GB"];
        let i = 0;
        while (size >= 1024 && i < units.length - 1) {
          size /= 1024;
          i++;
        }
        return `${size.toFixed(2)} ${units[i]}`;
      },
      formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const seconds = ("0" + date.getSeconds()).slice(-2);
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
          const response = await axios.get(
            `${this.$baseUrl}/api/files/download/${file.id}`,
            {
              responseType: "blob",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
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
        const token = localStorage.getItem("token");
        try {
          const response = await axios.put(
            `${this.$baseUrl}/api/files/updateDownloadsCount/${fileId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.code === 200) {
            const fileIndex = this.files.findIndex((file) => file.id === fileId);
            if (fileIndex !== -1) {
              this.files[fileIndex].downloads += 1;
            }
          } else {
            console.error("Unexpected response structure:", response.data);
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
  
  .file-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 100px;
    padding: 12px 20px;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    transition: background-color 0.3s;
  }
  
  .file-item:hover {
    background-color: #f5f7fa;
  }
  
  .file-name-col {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .file-name-col i {
    font-size: 20px;
    color: #409EFF;
  }
  
  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .file-size-col,
  .file-date-col {
    color: #606266;
  }
  
  .file-actions-col {
    text-align: right;
  }
  
  .pagination-container {
    text-align: center;
    margin-top: 20px;
  }
  
  @media (max-width: 768px) {
    .file-list-header,
    .file-item {
      grid-template-columns: 2fr 1fr 1fr 80px;
      font-size: 14px;
      padding: 12px 10px;
    }
  
    .file-name-col i {
      font-size: 16px;
    }
  
    .search-bar {
      max-width: 100%;
    }
  }
  
  @media (max-width: 576px) {
    .file-date-col {
      display: none;
    }
  
    .file-list-header,
    .file-item {
      grid-template-columns: 2fr 1fr 80px;
    }
  }

  /* 可以添加一些视觉提示,表明需要登录才能下载 */
  .file-actions-col .el-button {
    position: relative;
  }
  
  .file-actions-col .el-button:not(:hover)::after {
    content: '登录后下载';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .file-actions-col .el-button:hover::after {
    opacity: 1;
  }
  </style>