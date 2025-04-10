<template>
  <div class="file-management-page">
    <h1>文件管理</h1>

    <div class="search-container">
      <el-input
        v-model="inputValue"
        placeholder="请输入文件名称"
        size="small"
        class="search-input"
        clearable
        @keyup.enter="searchFiles"
      ></el-input>
      <el-button type="primary" class="search-button" @click="searchFiles">搜索</el-button>
    </div>
    
    <div class="upload-section">
      <h2>上传新文件</h2>
      <form @submit.prevent="uploadFile" class="upload-form">
        <div class="form-group">
          <label for="file">选择文件:</label>
          <div class="file-input-wrapper">
            <el-upload
              ref="upload"
              action=""
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-exceed="handleExceed"
              :before-remove="handleBeforeRemove"
              :limit="1"
              :file-list="fileList"
              class="custom-upload"
              :show-file-list="true"
            >
              <el-button size="small" type="primary">选择文件</el-button>
              <div slot="tip" class="el-upload__tip">
                文件大小不能超过100MB，支持常见的文档、图片、压缩包等格式
              </div>
            </el-upload>
          </div>
          <div v-if="fileError" class="file-error">{{ fileError }}</div>
        </div>
        <div class="form-group">
          <label for="description">描述:</label>
          <el-input
            type="textarea"
            :rows="3"
            v-model="newFile.description"
            placeholder="请输入文件描述（可选）"
          ></el-input>
        </div>
        <el-button 
          type="primary" 
          @click="uploadFile" 
          :loading="isUploading" 
          :disabled="!canUpload || isUploading"
          class="upload-button"
        >
          {{ isUploading ? "文件上传中..." : "上传文件" }}
        </el-button>
      </form>
    </div>
    
    <div class="file-list">
      <h2>上传的文件列表</h2>
      <el-table
        :data="files"
        stripe
        style="width: 100%"
        v-loading="isLoading"
      >
        <el-table-column prop="fileName" label="文件名称" min-width="200">
          <template slot-scope="scope">
            <div class="file-name">
              <i :class="getFileIcon(scope.row.fileType)"></i>
              <span>{{ scope.row.fileName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" min-width="120"></el-table-column>
        <el-table-column label="文件大小" min-width="100">
          <template slot-scope="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="downloads" label="下载次数" min-width="100"></el-table-column>
        <el-table-column label="操作" min-width="120" align="center">
          <template slot-scope="scope">
            <el-button
              @click="handleDownload(scope.row)"
              type="text"
              size="small"
            >
              <i class="el-icon-download"></i> 下载
            </el-button>
            <el-button
              @click="deleteFile(scope.row.id)"
              type="text"
              size="small"
              class="delete-action"
            >
              <i class="el-icon-delete"></i> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="no-data" v-if="files.length === 0 && !isLoading">
        <i class="el-icon-document"></i>
        <p>暂无文件</p>
      </div>
    </div>
    
    <div class="pagination-container">
      <el-pagination
        layout="total, prev, pager, next"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="totoal"
        @current-change="handlePageChange"
      >
      </el-pagination>
    </div>
  </div>
</template>
  
<script>
import axios from "axios";

export default {
  data() {
    return {
      files: [],
      fileList: [],
      newFile: {
        file: null,
        description: "",
      },
      isUploading: false,
      isLoading: false,
      fileError: '',
      totoal: 0,
      currentPage: 1,
      pageSize: 5,
      inputValue: '',
      allowedTypes: [
        // 文档格式
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        // 图片格式
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        // 压缩包
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        // 其他常用格式
        'application/json',
        'text/csv',
        'text/html',
        'text/xml'
      ],
      MAX_SIZE: 100 * 1024 * 1024 // 100MB
    };
  },
  computed: {
    canUpload() {
      return this.newFile.file && !this.fileError;
    }
  },
  mounted() {
    this.fetchFiles();
  },
  methods: {
    async searchFiles() {
      this.currentPage = 1;
      this.fetchFiles();
    },

    async fetchFiles() {
      try {
        this.isLoading = true;
        const response = await axios.get(
          `${this.$baseUrl}/api/files/getAllFiles`,
          {
            params: {
              page: this.currentPage - 1, // 后端接口从0开始计数
              pageSize: this.pageSize,
              keyword: this.inputValue,
            },
          }
        );
        
        if (response.data.code === 200) {
          this.files = response.data.data.pageList || [];
          this.totoal = response.data.data.total || 0;
        } else {
          this.$message.error('获取文件列表失败: ' + response.data.message);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        this.$message.error('获取文件列表失败，请稍后重试');
      } finally {
        this.isLoading = false;
      }
    },
    
    handleFileChange(file) {
      // 检查文件是否已存在
      this.fileList = [file];
      this.fileError = '';
      
      // 检查文件大小
      if (file.size > this.MAX_SIZE) {
        this.fileError = `文件大小超过限制，最大允许${this.formatFileSize(this.MAX_SIZE)}`;
        return false;
      }
      
      // 检查文件类型
      if (!this.allowedTypes.includes(file.raw.type)) {
        this.fileError = '不支持的文件类型';
        return false;
      }
      
      this.newFile.file = file.raw;
      return true;
    },
    
    handleExceed() {
      this.$message.warning('只能上传一个文件');
    },
    
    handleBeforeRemove() {
      this.newFile.file = null;
      this.fileError = '';
      return true;
    },
    
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchFiles();
    },

    async uploadFile() {
      if (!this.newFile.file || this.fileError) {
        this.$message.error('请选择有效文件');
        return;
      }
      
      this.isUploading = true;
      const formData = new FormData();
      formData.append("file", this.newFile.file);
      formData.append("description", this.newFile.description || '');

      try {
        const response = await axios.post(
          `${this.$baseUrl}/api/files/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            }
          }
        );
        
        if (response.data.code === 200) {
          this.$message.success('文件上传成功！');
          this.fetchFiles();
          
          // 重置表单
          this.newFile.file = null;
          this.newFile.description = "";
          this.fileList = [];
          this.fileError = '';
        } else {
          this.$message.error('上传失败: ' + response.data.message);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        this.$message.error('文件上传失败，请稍后重试');
      } finally {
        this.isUploading = false;
      }
    },
    
    async handleDownload(file) {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/files/download/${file.id}`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // 更新下载计数
        this.updateDownloadCount(file.id);
      } catch (error) {
        console.error("Error downloading file:", error);
        this.$message.error('文件下载失败，请稍后重试');
      }
    },
    
    async updateDownloadCount(fileId) {
      try {
        await axios.put(`${this.$baseUrl}/api/files/updateDownloadsCount/${fileId}`);
        // 更新当前列表中的下载计数
        const index = this.files.findIndex(f => f.id === fileId);
        if (index !== -1) {
          this.files[index].downloads += 1;
        }
      } catch (error) {
        console.error("Error updating download count:", error);
      }
    },
    
    async deleteFile(fileId) {
      this.$confirm('确定要删除此文件吗？删除后将无法恢复。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await axios.delete(
            `${this.$baseUrl}/api/files/${fileId}`
          );
          
          if (response.data.code === 200) {
            this.$message.success('文件删除成功！');
            
            // 如果当前页只有这一条数据，且不是第一页，则回到上一页
            if (this.files.length === 1 && this.currentPage > 1) {
              this.currentPage -= 1;
            }
            
            this.fetchFiles();
          } else {
            this.$message.error('删除失败: ' + response.data.message);
          }
        } catch (error) {
          console.error("Error deleting file:", error);
          this.$message.error('文件删除失败，请稍后重试');
        }
      }).catch(() => {});
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
    
    getFileIcon(fileType) {
      const iconMap = {
        'application/pdf': 'el-icon-document',
        'application/msword': 'el-icon-document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'el-icon-document',
        'application/vnd.ms-excel': 'el-icon-tickets',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'el-icon-tickets',
        'application/vnd.ms-powerpoint': 'el-icon-document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'el-icon-document',
        'text/plain': 'el-icon-document',
        'image/jpeg': 'el-icon-picture',
        'image/png': 'el-icon-picture',
        'image/gif': 'el-icon-picture',
        'application/zip': 'el-icon-folder',
        'application/x-rar-compressed': 'el-icon-folder',
        'application/x-7z-compressed': 'el-icon-folder'
      };
      
      return iconMap[fileType] || 'el-icon-document';
    }
  },
};
</script>
  
<style scoped>
.file-management-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2 {
  font-weight: 600;
  color: #1d1d1f;
}

h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

h2 {
  font-size: 24px;
  margin-bottom: 15px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.upload-section {
  background-color: #f5f5f7;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #1d1d1f;
}

.file-input-wrapper {
  margin-bottom: 5px;
}

.file-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.custom-upload {
  width: 100%;
}

.upload-button {
  align-self: flex-start;
  margin-top: 10px;
}

.file-list {
  margin-bottom: 20px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name i {
  font-size: 16px;
  color: #409EFF;
}

.delete-action {
  color: #f56c6c;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 10px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 7px;
}
</style>