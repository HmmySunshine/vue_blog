<template>
    <div class="article-management">
      <div class="management-header">
        <h2 class="page-title">文章管理</h2>
      </div>
      
      <el-table
        :data="articles"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column 
          prop="title" 
          label="文章标题" 
          min-width="400"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-link 
              :href="scope.row.url" 
              type="primary" 
              :underline="false"
              class="article-title-link"
            >
              {{ scope.row.title }}
            </el-link>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="createTime" 
          label="发布时间" 
          width="160"
          align="center"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="views" 
          label="浏览量" 
          width="120"
          align="center"
        ></el-table-column>
        
        <el-table-column 
          prop="category.name" 
          label="所属分类" 
          width="140"
          align="center"
        ></el-table-column>
        
        <el-table-column 
          label="操作" 
          width="280"
          align="center"
        >
          <template slot-scope="scope">
            <el-button-group>
              <el-button 
                size="medium" 
                type="primary"
                plain
                @click="editArticle(scope.row)"
              >编辑</el-button>
              <el-button 
                size="medium" 
                type="danger"
                plain
                @click="deleteArticle(scope.row.id)"
              >删除</el-button>
              <el-button 
                size="medium" 
                type="info"
                plain
                @click="previewArticle(scope.row)"
              >预览</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
  
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalArticles"
          background
        >
        </el-pagination>
      </div>
  
      <!-- 编辑对话框 -->
      <el-dialog
        title="编辑文章"
        :visible.sync="showEditDialog"
        width="80%"
        :before-close="closeEditDialog"
        custom-class="edit-dialog"
      >
        <el-form :model="editForm" label-width="100px" size="medium">
          <el-form-item label="标题">
            <el-input v-model="editForm.title"></el-input>
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="editForm.category.id" placeholder="请选择分类" style="width: 100%">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="内容">
            <el-input 
              type="textarea" 
              v-model="editForm.content" 
              :rows="15"
              resize="none"
            ></el-input>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="editForm.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择文章标签"
              style="width: 100%"
            >
              <el-option
                v-for="tag in existingTags"
                :key="tag.text"
                :label="tag.text"
                :value="tag.text"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeEditDialog" size="medium">取消</el-button>
          <el-button type="primary" @click="submitEdit" size="medium">确定</el-button>
        </span>
      </el-dialog>
  
      <!-- 预览对话框 -->
      <el-dialog
        title="文章预览"
        :visible.sync="showPreviewDialog"
        width="80%"
        custom-class="preview-dialog"
      >
        <div class="preview-content">
          <h2 class="preview-title">{{ previewArticleData && previewArticleData.title }}</h2>
          <div class="preview-body" v-html="previewArticleData && previewArticleData.contentHtml"></div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closePreviewDialog" size="medium">关闭</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import { Message, MessageBox } from 'element-ui';
  import marked from 'marked';
  
  export default {
    name: "ArticleManagement",
    data() {
      return {
        articles: [],
        categories: [],
        currentPage: 1,
        pageSize: 10,
        totalArticles: 0,
        showEditDialog: false,
        showPreviewDialog: false,
        editForm: {
          id: null,
          title: "",
          category: { id: null, name: "" },
          content: "",
          tags: [],
        },
        previewArticleData: null,
        existingTags: [],
        loading: false,
      };
    },
    mounted() {
      this.fetchArticles();
      this.fetchCategories();
      this.fetchTags();
    },
    methods: {
      async fetchArticles() {
        this.loading = true;
        try {
          const response = await axios.get(`${this.$baseUrl}/api/articles`, {
            params: { page: this.currentPage - 1, pageSize: this.pageSize },
          });
          this.articles = response.data.data.articles;
          this.totalArticles = response.data.data.total;
        } catch (error) {
          Message.error("获取文章失败");
          console.error("获取文章失败:", error);
        } finally {
          this.loading = false;
        }
      },
      async fetchCategories() {
        try {
          const response = await axios.get(`${this.$baseUrl}/api/categories`);
          this.categories = response.data.data.categories.map((category) => ({
            id: category.id,
            name: category.name,
          }));
        } catch (error) {
          Message.error("获取分类失败");
          console.error("获取分类失败:", error);
        }
      },
      async fetchTags() {
        try {
          const response = await axios.get(`${this.$baseUrl}/api/tags`);
          this.existingTags = response.data.data.pageList.map((tag) => ({
            text: tag.name,
          }));
        } catch (error) {
          Message.error("获取标签失败");
          console.error("获取标签失败:", error);
        }
      },
      formatDate(dateArray) {
        if (dateArray && dateArray.length === 6) {
          const date = new Date(
            dateArray[0],
            dateArray[1] - 1,
            dateArray[2],
            dateArray[3],
            dateArray[4],
            dateArray[5]
          );
          return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).replace(/\//g, "-");
        }
        return "Invalid Date";
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.fetchArticles();
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.fetchArticles();
      },
      async editArticle(article) {
        try {
          const response = await axios.get(`${this.$baseUrl}/api/articles/${article.id}/tags`);
          const tags = response.data.data.map((tag) => tag.name);
          this.editForm = {
            id: article.id,
            title: article.title,
            category: { id: article.category.id, name: article.category.name },
            content: article.content,
            tags: tags,
          };
          this.showEditDialog = true;
        } catch (error) {
          Message.error("获取文章标签失败");
          console.error("获取文章标签失败:", error);
        }
      },
      async deleteArticle(id) {
        try {
          await MessageBox.confirm('确定要删除这篇文章吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
          await axios.delete(`${this.$baseUrl}/api/articles/${id}`);
          Message.success('删除成功');
          await this.fetchArticles();
        } catch (error) {
          if (error !== 'cancel') {
            Message.error("删除文章失败");
            console.error("删除文章失败:", error);
          }
        }
      },
      previewArticle(article) {
        const contentHtml = marked(article.content);
        this.previewArticleData = { ...article, contentHtml };
        this.showPreviewDialog = true;
      },
      closePreviewDialog() {
        this.showPreviewDialog = false;
      },
      async submitEdit() {
        try {
          await axios.put(`${this.$baseUrl}/api/articles/${this.editForm.id}`, {
            ...this.editForm,
            category: this.categories.find((cat) => cat.id === this.editForm.category.id),
            tags: this.editForm.tags,
          });
          this.showEditDialog = false;
          Message.success('更新成功');
          await this.fetchArticles();
        } catch (error) {
          Message.error("更新文章失败");
          console.error("更新文章失败:", error);
        }
      },
      closeEditDialog() {
        this.showEditDialog = false;
      },
    },
  };
  </script>
  
  <style scoped>
  .article-management {
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }
  
  .management-header {
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
  
  .article-title-link {
    font-size: 14px;
  }
  
  .article-title-link:hover {
    color: #409EFF;
  }
  
  .pagination-container {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
  
  /* 编辑对话框样式 */
  .edit-dialog {
    margin-top: 5vh !important;
  }
  
  .edit-dialog :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
  
  /* 预览对话框样式 */
  .preview-dialog {
    margin-top: 5vh !important;
  }
  
  .preview-content {
    padding: 20px;
  }
  
  .preview-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .preview-body {
    font-size: 16px;
    line-height: 1.8;
    color: #303133;
  }
  
  /* 调整表格内容的样式 */
  :deep(.el-table) {
    font-size: 14px;
  }
  
  :deep(.el-table th) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
  
  :deep(.el-button-group) {
    display: flex;
    gap: 8px;
  }
  
  :deep(.el-button-group .el-button) {
    margin-left: 0 !important;
  }
  
  /* 响应式调整 */
  @media screen and (max-width: 768px) {
    .article-management {
      padding: 16px;
    }
    
    .page-title {
      font-size: 20px;
    }
    
    :deep(.el-dialog) {
      width: 90% !important;
    }
  }
  </style>