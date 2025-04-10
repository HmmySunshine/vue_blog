<template>
  <div class="file-management-page">
    <h1>文件管理</h1>

    <div class="search-container">
      <el-input
        v-model="inputValue"
        placeholder="请输入文件名称"
        size="small"
        class="search-input"
        
      ></el-input>
      <el-button type="primary" class="search-button" @click="searchFiles"
        >搜索</el-button
      >
    </div>
    <div class="upload-section">
      <h2>上传新文件</h2>
      <form @submit.prevent="uploadFile" class="upload-form">
        <div class="form-group">
          <label for="file">选择文件:</label>
          <input
            type="file"
            id="file"
            ref="fileInput"
            required
            @change="handleFileChange"
          />
        </div>
        <div class="form-group">
          <label for="description">描述:</label>
          <textarea
            id="description"
            v-model="newFile.description"
            rows="3"
          ></textarea>
        </div>
        <button type="submit" class="upload-button" :disabled="isUploading">
          {{ isUploading ? "文件上传中..." : "上传文件" }}
        </button>
      </form>
    </div>
    <div class="file-list">
      <h2>上传的文件列表</h2>
      <table>
        <thead>
          <tr>
            <th>文件名称</th>
            <th>文件类型</th>
            <th>文件大小</th>
            <th>文件下载次数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in files" :key="file.id">
            <td>{{ file.fileName }}</td>
            <td>{{ file.fileType }}</td>
            <td>{{ formatFileSize(file.fileSize) }}</td>
            <td>{{ file.downloads }}</td>
            <td>
              <button @click="deleteFile(file.id)" class="delete-button">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination-container">
      <el-pagination
        small
        layout="prev, pager, next"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="totoal"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        class="centered-pagination"
      >
      </el-pagination>
    </div>
  </div>
</template>
  
  <script>
import axios from "axios";
//   import 'element-ui/lib/theme-chalk/index.css';

export default {
  data() {
    return {
      files: [],
      newFile: {
        file: null,
        description: "",
      },
      isUploading: false,
      totoal: 0,
      currentPage: 1,
      pageSize: 5,
      inputValue: ''
    };
  },
  mounted() {
    this.fetchFiles();
  },
  methods: {
    async searchFiles() {
        this.fetchFiles();
    },

    async fetchFiles() {
      try {
        //const windowsUrl = "http://localhost:8090/api/files/getAllFiles";
        //const linuxUrl = "api/files/getAllFiles";
        const response = await axios.get(
          `${this.$baseUrl}/api/files/getAllFiles`,
          {
            params: {
              page: this.currentPage,
              pageSize: this.pageSize,
              keyword: this.inputValue,
            },
          }
        );
        this.files = response.data.data.pageList; // 假设返回的数据结构中包含一个名为 "files" 的数组
        this.totoal = response.data.data.total;
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    },
    
    handleFileChange(event) {
      this.newFile.file = event.target.files[0];
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchFiles();
    },
    handleSizeChange(size) {
      this.pageSize = size;
      this.fetchFiles();
    },

    async uploadFile() {
      if (!this.newFile.file) return;
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB
      if (this.newFile.file.size > MAX_SIZE) {
        alert("文件大小不能超过 100MB");
        return;
      }
      this.isUploading = true;
      const formData = new FormData();
      formData.append("file", this.newFile.file);
      formData.append("description", this.newFile.description);

      try {
        const response = await axios.post(
          `${this.$baseUrl}/api/files/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.code == 200) {
          alert("文件上传成功！");
          this.fetchFiles();
        }

        this.newFile.file = null;
        this.newFile.description = "";
        this.$refs.fileInput.value = "";
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        this.isUploading = false;
      }
    },
    async deleteFile(fileId) {
      if (!confirm("Are you sure you want to delete this file?")) return;

      try {
        const response = await axios.delete(
          `${this.$baseUrl}/api/files/${fileId}`
        );
        if (response.data.code == 200) {
          alert("文件删除成功！");
          this.fetchFiles();
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
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
  },
};
</script>
  
  <style scoped>
.file-management-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica",
    "Arial", sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1,
h2 {
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
.pagination-container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 20px 0; /* 可根据需要调整 */
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #1d1d1f;
}

input[type="file"],
textarea {
  font-size: 14px;
  padding: 10px;
  border: 1px solid #d2d2d7;
  border-radius: 5px;
  background-color: white;
}

textarea {
  resize: vertical;
}
tbody td {
  color: #1d1d1f; /* 设置表格单元格文字颜色为深色 */
  background-color: white; /* 设置背景为白色，保证对比度 */
}

.upload-button {
  background-color: #0071e3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-self: flex-start;
}

.upload-button:hover:not(:disabled) {
  background-color: #0077ed;
}

.upload-button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #d2d2d7;
}

th {
  font-weight: 600;
  color: #1d1d1f;
  background-color: #f5f5f7;
}

.delete-button {
  background-color: #ff3b30;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #ff453a;
}
.search-container {
  display: flex;
  align-items: center;
  gap: 10px; /* 控制输入框和按钮之间的间距 */
}

.search-input {
  width: 200px; /* 设置输入框的宽度 */
}

.search-button {
  padding: 5px 15px; /* 设置按钮的内边距 */
}
</style>