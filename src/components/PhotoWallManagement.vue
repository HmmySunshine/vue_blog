<template>
    <div class="photo-wall-admin">
      <el-card class="page-header">
        <h1>照片墙管理</h1>
      </el-card>
  
      <el-form :inline="true" :model="searchForm" class="demo-form-inline mb-4">
        <el-form-item label="标题">
          <el-input
            v-model="searchForm.title"
            placeholder="搜索标题"
            prefix-icon="el-icon-search"
          ></el-input>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.createdAt"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
  
      <el-row :gutter="20" class="mb-4">
        <el-col :span="24">
          <el-button type="primary" icon="el-icon-plus" @click="showUploadDialog">上传新照片</el-button>
        </el-col>
      </el-row>
  
      <el-table 
        v-loading="loading"
        :data="photos" 
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column label="预览图" width="120">
          <template slot-scope="scope">
            <el-image 
              style="width: 100px; height: 100px"
              :src="scope.row.httpUrl" 
              :preview-src-list="[scope.row.httpUrl]">
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="isWide" label="宽幅" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isWide ? 'success' : 'info'">
              {{ scope.row.isWide ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
  
      <el-dialog title="上传新照片" :visible.sync="uploadDialogVisible">
        <el-form :model="newPhoto" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="newPhoto.title"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input type="textarea" v-model="newPhoto.description"></el-input>
          </el-form-item>
          <el-form-item label="是否宽幅">
            <el-switch v-model="newPhoto.isWide"></el-switch>
          </el-form-item>
          <el-form-item label="照片">
            <el-upload
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
            >
              <el-button size="small" type="primary">选择文件</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitUpload">确 定</el-button>
        </span>
      </el-dialog>
  
      <el-dialog title="编辑照片" :visible.sync="editDialogVisible">
        <el-form v-if="editingPhoto" :model="editingPhoto" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="editingPhoto.title"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input type="textarea" v-model="editingPhoto.description"></el-input>
          </el-form-item>
          <el-form-item label="是否宽幅">
            <el-switch v-model="editingPhoto.isWide"></el-switch>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit">确 定</el-button>
        </span>
      </el-dialog>
     

      
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'PhotoWallAdmin',
    data() {
      return {
        photos: [],
        uploadDialogVisible: false,
        editDialogVisible: false,
        loading: false,
        searchForm: {
          title: '',
          createdAt: ''
        },
        newPhoto: {
          title: '',
          description: '',
          isWide: false,
          file: null
        },
        editingPhoto: null,
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    },
    methods: {
      async fetchPhotos() {
        this.loading = true;
        try {
          const response = await axios.get(`${this.$baseUrl}/api/photos`, {
            params: {
              page: this.currentPage,
              pageSize: this.pageSize,
              title: this.searchForm.title,
              createdAt: this.searchForm.createdAt
            }
          });
          this.photos = response.data.data.pageList;
          this.total = response.data.data.total;
        } catch (error) {
          console.error('Error fetching photos:', error);
          this.$message.error('获取照片列表失败');
        } finally {
          this.loading = false;
        }
      },
      showUploadDialog() {
        this.uploadDialogVisible = true;
      },
      handleFileChange(file) {
        this.newPhoto.file = file.raw;
      },
      beforeUpload(file) {
        console.log('beforeUpload  is called'); 
        const isImage = file.type.startsWith('image/');
        const isLt5M = file.size / 1024 / 1024 < 5;
  
        if (!isImage) {
          this.$message.error('只能上传图片文件!');
        }
        if (!isLt5M) {
          this.$message.error('图片大小不能超过 5MB!');
        }
        return isImage && isLt5M;
      },
      async submitUpload() {
       

        if (!this.newPhoto.title) {
          this.$message.error('请输入照片标题');
          return;
        }
        if (!this.newPhoto.description) {
          this.$message.error('请输入照片描述');
          return;
        }


        if (!this.newPhoto.file) {
          this.$message.error('请选择一张图片');
          return;
        }
        if (!this.beforeUpload(this.newPhoto.file)) {
          return;
        }
        const formData = new FormData();
        formData.append('title', this.newPhoto.title);
        formData.append('description', this.newPhoto.description);
        formData.append('isWide', this.newPhoto.isWide);
        formData.append('file', this.newPhoto.file);
  
        try {
          await axios.post(`${this.$baseUrl}/api/photos`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          this.$message.success('照片上传成功');
          this.uploadDialogVisible = false;
          this.resetNewPhoto();
          this.fetchPhotos();
        } catch (error) {
          console.error('Error uploading photo:', error);
          this.$message.error('照片上传失败');
        }
      },
      resetNewPhoto() {
        this.newPhoto = {
          title: '',
          description: '',
          isWide: false,
          file: null
        };
      },
      handleEdit(photo) {
        this.editingPhoto = { ...photo };
        this.editDialogVisible = true;
      },
      async submitEdit() {
        if (this.editingPhoto) {
          try {
            await axios.put(`${this.$baseUrl}/api/photos/${this.editingPhoto.id}`, this.editingPhoto);
            this.$message.success('照片信息更新成功');
            this.editDialogVisible = false;
            this.editingPhoto = null;
            this.fetchPhotos();
          } catch (error) {
            console.error('Error updating photo:', error);
            this.$message.error('照片信息更新失败');
          }
        }
      },
      async handleDelete(photo) {
        try {
          await this.$confirm('确定要删除这张照片吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
          
          await axios.delete(`${this.$baseUrl}/api/photos/${photo.id}`);
          this.$message.success('照片删除成功');
          this.fetchPhotos();
        } catch (error) {
          if (error !== 'cancel') {
            console.error('Error deleting photo:', error);
            this.$message.error('照片删除失败');
          }
        }
      },
      handleSearch() {
        this.currentPage = 1;
        this.fetchPhotos();
      },
      resetSearch() {
        this.searchForm = {
          title: '',
          createdAt: ''
        };
        this.handleSearch();
      },
      formatDate(date) {
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.fetchPhotos();
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.fetchPhotos();
      }
    },
    mounted() {
      this.fetchPhotos();
    }
  }
  </script>
  
  <style scoped>
  .photo-wall-admin {
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
  
  .mb-4 {
    margin-bottom: 16px;
  }
  
  .demo-form-inline {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  
  .el-form-item {
    margin-right: 10px;
    margin-bottom: 10px;
  }
  
  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }
  </style>