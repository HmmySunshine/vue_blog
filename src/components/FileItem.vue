<template>
    <div class="file-item">
      <div class="file-name-col">
        <i :class="fileIcon"></i>
        <span class="file-name">{{ file.fileName }}</span>
      </div>
      <div class="file-size-col">{{ formattedSize }}</div>
      <div class="file-date-col">{{ formattedDate }}</div>
      <div class="file-actions-col">
        <el-button 
          type="primary" 
          size="small"
          icon="el-icon-download" 
          @click="$emit('download', file)"
        >
          下载
        </el-button>
      </div>
    </div>
  </template>
  
  <script>
  import { formatFileSize, formatDateTime } from '@/utils/format';
  import { getFileIcon } from '@/utils/file';
  
  export default {
    name: "FileItem",
    props: {
      file: {
        type: Object,
        required: true
      }
    },
    computed: {
      fileIcon() {
        return getFileIcon(this.file.fileType);
      },
      formattedSize() {
        return formatFileSize(this.file.fileSize);
      },
      formattedDate() {
        return formatDateTime(this.file.uploadedAt);
      }
    }
  };
  </script>
  
  <style scoped>
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
  
  @media (max-width: 768px) {
    .file-item {
      grid-template-columns: 2fr 1fr 1fr 80px;
      font-size: 14px;
      padding: 12px 10px;
    }
  
    .file-name-col i {
      font-size: 16px;
    }
  }
  
  @media (max-width: 576px) {
    .file-date-col {
      display: none;
    }
  
    .file-item {
      grid-template-columns: 2fr 1fr 80px;
    }
  }
  </style>