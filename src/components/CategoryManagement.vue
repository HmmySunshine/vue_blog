<template>  
    <div class="category-management">  
      <h1 class="page-title">分类管理</h1>  
      <div class="search-form">  
        <el-input  
          v-model="searchQuery"  
          placeholder="搜索分类"  
          class="search-input"  
        ></el-input>  
        <el-button type="primary" @click="fetchCategories" class="search-button">  
          搜索  
        </el-button>  
      </div>  
      <div class="category-form">  
        <el-input  
          v-model="newCategory"  
          placeholder="添加新分类"  
          class="add-input"  
        ></el-input>  
        <el-button type="primary" @click="addCategory" class="add-button">  
          添加  
        </el-button>  
      </div>  
      <div class="category-list">  
        <div class="category-item" v-for="category in categories" :key="category.id">  
          <div class="category-content">  
            <span v-if="!category.editing">{{ category.name }}</span>  
            <el-input  
              v-else  
              v-model="category.editName"  
              size="small"  
              @keyup.enter="updateCategory(category)"  
              class="edit-input"  
            ></el-input>  
          </div>  
          <div class="category-actions">  
            <el-button  
              v-if="!category.editing"  
              type="text"  
              @click="startEditing(category)"  
              class="edit-btn"  
            >  
              编辑  
            </el-button>  
            <el-button  
              v-else  
              type="text"  
              @click="updateCategory(category)"  
              class="save-btn"  
            >  
              保存  
            </el-button>  
            <el-button  
              type="text"  
              @click="deleteCategory(category.id)"  
              class="delete-btn"  
            >  
              删除  
            </el-button>  
          </div>  
        </div>  
      </div>  
      <div class="pagination">  
        <el-pagination  
          
          :current-page="currentPage"  
          :page-size="pageSize"  
          :total="totalItems"  
          layout="prev, pager, next"  
          @current-change="handlePageChange"  
        >  
        </el-pagination>  
      </div>  
      <transition name="fade">  
        <div  
          v-if="responseFlag"  
          class="response-message"  
        >  
          <el-alert  
            :title="responseMsg"  
            type="success"  
            effect="dark"  
            show-icon  
            :closable="false"  
          >  
          </el-alert>  
        </div>  
      </transition>  
    </div>  
  </template>  
  
  <script>  
  import axios from 'axios';  
  
  export default {  
    data() {  
      return {  
        searchQuery: '',  
        newCategory: '',  
        categories: [],  
        totalItems: 0,  
        currentPage: 1,  
        pageSize: 10,  
        responseMsg: '',  
        responseFlag: false,  
      };  
    },  
    created() {  
      this.fetchCategories();  
    },  
    methods: {  
      async fetchCategories() {  
        try {  
          const response = await axios.get(`${this.$baseUrl}/api/categories`, {  
            params: {  
              searchName: this.searchQuery,  
              page: this.currentPage - 1,  
              pageSize: this.pageSize,  
            },  
          });  
          this.categories = response.data.data.categories.map((category) => ({  
            ...category,  
            editing: false,  
            editName: category.name,  
          }));  
          this.totalItems = response.data.data.total;  
        } catch (error) {  
          console.error('获取分类失败:', error);  
          this.showMessage('获取分类失败', 'error');  
        }  
      },  
      async addCategory() {  
        if (!this.newCategory.trim()) {
          this.showMessage('分类名称不能为空', 'error');
          return;
        }
        try {  
          const response = await axios.post(`${this.$baseUrl}/api/categories`, {  
            name: this.newCategory.trim(),  
          });  
          this.showMessage(response.data.message, 'success');  
  
          this.categories.unshift({  
            ...response.data.category,  
            editing: false,  
            editName: response.data.data.name
          });  
          this.newCategory = '';  
        } catch (error) {  
          console.error('添加分类失败:', error);  
          this.showMessage('添加分类失败', 'error');  
        }  
      },  
      startEditing(category) {  
        category.editing = true;  
        category.editName = category.name;  
      },  
      showMessage(message) {  
        this.responseMsg = message;  
        this.responseFlag = true;  
        setTimeout(() => {  
          this.responseFlag = false;  
        }, 3000);  
      },  
      async updateCategory(category) {  
        if (!category.editName.trim()) return;  
        try {  
          const response = await axios.put(  
            `${this.$baseUrl}/api/categories/${category.id}`,  
            {  
              name: category.editName.trim(),  
            }  
          );  
          category.name = category.editName.trim();  
          category.editing = false;  
          this.showMessage(response.data.message, 'success');  
        } catch (error) {  
          console.error('更新分类失败:', error);  
          this.showMessage('更新分类失败', 'error');  
        }  
      },  
      async deleteCategory(id) {  
        if (confirm('确定要删除这个分类吗？')) {  
          try {  
            const response = await axios.delete(`${this.$baseUrl}/api/categories/${id}`);  
            this.showMessage(response.data.message, 'success');  
            this.fetchCategories();  
          } catch (error) {  
            console.error('删除分类失败:', error);  
            this.showMessage('删除分类失败', 'error');  
          }  
        }  
      },  
      handlePageChange(page) {  
        this.currentPage = page;  
        this.fetchCategories();  
      },  
    },  
  };  
  </script>  
  
  <style scoped>  

  
  .category-management {  
    max-width: 800px;  
    margin: 0 auto;  
    padding: 40px 20px;  
    background-color: #ffffff;  
    border-radius: 12px;  
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);  
    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;  
  }  
  
  .page-title {  
    font-size: 28px;  
    font-weight: 600;  
    color: #333333;  
    margin-bottom: 30px;  
    text-align: center;  
  }  
  
  .search-form {  
    display: flex;  
    align-items: center;  
    gap: 15px;  
    margin-bottom: 30px;  
  }  
  
  .search-input {  
    flex: 1;  
    border-radius: 8px;  
    background-color: #f5f5f5;  
  }  
  
  .search-button {  
    height: 40px;  
    border-radius: 8px;  
  }  
  
  .response-message {  
    position: fixed;  
    top: 20px;  
    left: 50%;  
    transform: translateX(-50%);  
    z-index: 2000;  
    width: 320px;  
  }  
  
  .category-form {  
    display: flex;  
    gap: 15px;  
    margin-bottom: 30px;  
  }  
  
  .add-input {  
    flex: 1;  
    border-radius: 8px;  
    background-color: #f5f5f5;  
  }  
  
  .add-button {  
    height: 40px;  
    border-radius: 8px;  
  }  
  
  .category-list {  
    display: flex;  
    flex-direction: column;  
    gap: 15px;  
    margin-bottom: 30px;  
  }  
  
  .category-item {  
    display: flex;  
    justify-content: space-between;  
    align-items: center;  
    padding: 15px 20px;  
    border-radius: 10px;  
    background-color: #fafafa;  
    transition: box-shadow 0.3s ease;  
  }  
  
  .category-item:hover {  
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);  
  }  
  
  .category-content {  
    flex: 1;  
    font-size: 16px;  
    color: #333333;  
  }  
  
  .edit-input {  
    width: 100%;  
  }  
  
  .category-actions {  
    display: flex;  
    gap: 10px;  
  }  
  
  .edit-btn,  
  .save-btn,  
  .delete-btn {  
    padding: 6px 12px;  
    border-radius: 6px;  
    font-size: 14px;  
    transition: background-color 0.3s ease;  
  }  
  
  .edit-btn {  
    color: #007aff;  
  }  
  
  .edit-btn:hover {  
    background-color: rgba(0, 122, 255, 0.1);  
  }  
  
  .save-btn {  
    color: #34c759;  
  }  
  
  .save-btn:hover {  
    background-color: rgba(52, 199, 89, 0.1);  
  }  
  
  .delete-btn {  
    color: #ff3b30;  
  }  
  
  .delete-btn:hover {  
    background-color: rgba(255, 59, 48, 0.1);  
  }  
  
  .pagination {  
    display: flex;  
    justify-content: center;  
  }  
  
  /* Fade Transition */  
  .fade-enter-active,  
  .fade-leave-active {  
    transition: opacity 0.5s;  
  }  
  .fade-enter,  
  .fade-leave-to {  
    opacity: 0;  
  }  
  </style>