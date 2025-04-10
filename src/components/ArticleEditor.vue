<template>
    <div class="article-editor">
      <div class="editor-header">
        <h2 class="editor-title">发布文章</h2>
        <div class="editor-actions">
          <el-button size="medium" @click="returnToList" icon="el-icon-back">返回列表</el-button>
          <el-button size="medium" type="primary" @click="saveArticle" icon="el-icon-upload">发布文章</el-button>
        </div>
      </div>
  
      <div class="editor-container">
        <!-- 左侧栏：编辑区 -->
        <div class="editor-main">
          <div class="title-wrapper">
            <input
              v-model="article.title"
              type="text"
              class="title-input"
              placeholder="请输入文章标题"
            />
          </div>
          
          <div class="editor-wrapper" ref="editorElem"></div>
        </div>
        
        <!-- 右侧栏：设置区 -->
        <div class="editor-sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">文章设置</h3>
            
            <div class="form-item">
              <label>文章分类</label>
              <el-select 
                v-model="article.categoryId" 
                placeholder="选择分类" 
                class="full-width"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                >
                </el-option>
              </el-select>
            </div>
            
            <div class="form-item">
              <label>文章标签</label>
              <vue-tags-input
                v-model="tag"
                :tags="article.tags"
                :autocomplete-items="filteredTags"
                @tags-changed="(newTags) => (article.tags = newTags)"
                placeholder="输入标签并按回车"
                @input="updateFilteredTags"
                class="full-width"
              />
            </div>
            
            <div class="form-item">
              <label>文章摘要</label>
              <el-input
                v-model="article.summary"
                type="textarea"
                :rows="4"
                placeholder="请输入文章摘要"
                class="full-width"
              ></el-input>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
    
  <script>
  import '@toast-ui/editor/dist/toastui-editor.css';
  import { Editor } from '@toast-ui/editor';
  import axios from "axios";
  import VueTagsInput from "@johmun/vue-tags-input";
  
  export default {
    name: "ArticleEditor",
    components: {
      VueTagsInput,
    },
    data() {
      return {
        editor: null,
        article: {
          title: "",
          tags: [],
          content: "",
          categoryId: "",
          summary: "",
          isPublished: true, // 默认发布
        },
        categories: [],
        tag: "",
        filteredTags: [],
        existingTags: [],
        tempImages: [],
      };
    },
    async mounted() {
      this.initEditor();
      await this.fetchCategories();
      await this.fetchTags();
    },
    beforeDestroy() {
      if (this.editor) {
        this.editor.destroy();
      }
    },
    methods: {
      initEditor() {
        this.editor = new Editor({
          el: this.$refs.editorElem,
          height: '600px', // 增加编辑器高度
          initialEditType: 'markdown', // 默认使用 markdown 模式
          previewStyle: 'vertical',    // 左侧编辑，右侧预览
          placeholder: '请输入文章内容...',
          
  
          hooks: {
            addImageBlobHook: async (blob, callback) => {
              // 处理图片上传
              //图片上传限制（>1MB）
              if (blob.size > 1024 * 1024) {
                this.$message.error('图片大小不能超过1MB');
                return;
              }
              try {
                const formData = new FormData();
                formData.append('file', blob);
                
                const response = await axios.post(
                  `${this.$baseUrl}/api/image`,
                  formData,
                  {
                    headers: {
                      'Authorization': 'Bearer ' + localStorage.getItem('token'),
                      'Content-Type': 'multipart/form-data'
                    }
                  }
                );
  
                if (response.data.errno === 0) {
                  const imageUrl = response.data.data[0].url;
                  callback(imageUrl);
                  this.tempImages.push({ url: imageUrl });
                }
              } catch (error) {
                console.error('图片上传失败:', error);
              }
            }
          },
          events: {
            change: () => {
              this.article.content = this.editor.getMarkdown();
            }
          }
        });
      },
      async fetchCategories() {
        try {
          const response = await axios.get(
            `${this.$baseUrl}/api/categories`
          );
          this.categories = response.data.data.categories;
        } catch (error) {
          console.error("获取分类失败:", error);
          this.$message.error("获取分类失败");
        }
      },
      async fetchTags() {
        try {
          const response = await axios.get(`${this.$baseUrl}/api/tags`);
          this.existingTags = response.data.data.pageList.map((tag) => ({
            text: tag.name,
            id: tag.id,
          }));
          this.filteredTags = [...this.existingTags];
        } catch (error) {
          console.error("获取标签失败:", error);
          this.$message.error("获取标签失败");
        }
      },
      updateFilteredTags(text) {
        if (!text) {
          this.filteredTags = [...this.existingTags];
          return;
        }
        this.filteredTags = this.existingTags.filter((t) =>
          t.text.toLowerCase().includes(text.toLowerCase())
        );
      },
      async saveArticle() {
        if (!this.article.title.trim()) {
          this.$message.warning("请输入文章标题");
          return;
        }
  
        if (!this.article.categoryId) {
          this.$message.warning("请选择文章分类");
          return;
        }
        if (!this.article.content.trim()) {
          this.$message.warning("请输入文章内容");
          return;
        }
  
        try {
          const loadingInstance = this.$loading({
            lock: true,
            text: '正在保存文章...',
            spinner: 'el-icon-loading',
            background: 'rgba(255, 255, 255, 0.7)'
          });
          
          const response = await axios.post(
            `${this.$baseUrl}/api/articles`,
            {
              title: this.article.title,
              content: this.article.content,
              tags: this.article.tags.map((tag) => tag.text),
              categoryId: this.article.categoryId,
              summary: this.article.summary,
              isPublished: true, // 始终为true，不需要草稿功能
              tempImages: this.tempImages,
            }
          );
  
          loadingInstance.close();
  
          if (response.data.code === 200) {
            this.$message.success("文章发布成功");
            this.returnToList(); // 保存成功后返回文章列表
            this.tempImages = [];
          }
        } catch (error) {
          console.error("保存文章失败:", error);
          this.$message.error("保存文章失败，请重试");
        }
      },
      returnToList() {
        // 修改为返回到文章管理页面
        this.$emit("return-to-list");
        
        // 正确导航到文章管理标签页
        const parent = this.$parent;
        if (parent && parent.setActiveView) {
          parent.setActiveView('articleManagement');
        }
      },
    },
  };
  </script>
    
  <style scoped>
  .article-editor {
    width: 90%;
    height: calc(100vh - 40px); /* 使用视口高度计算，减去一些边距 */
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .editor-title {
    font-size: 24px;
    margin: 0;
    color: #333;
    font-weight: 600;
  }
  
  .editor-actions {
    display: flex;
    gap: 10px;
  }
  
  .editor-container {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    flex: 1; /* 填充剩余空间 */
    overflow: hidden; /* 避免编辑器内容溢出 */
  }
  
  .editor-main {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%; /* 使用全高 */
  }
  
  .title-wrapper {
    padding: 20px 20px 0;
  }
  
  .title-input {
    width: 100%;
    padding: 10px 0;
    font-size: 24px;
    border: none;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .title-input:focus {
    outline: none;
    border-color: #409EFF;
  }
  
  .editor-wrapper {
    flex: 1;
    padding: 0 20px 20px;
    min-height: 700px; /* 确保编辑区有最小高度 */
  }
  
  .editor-sidebar {
    width: 100%;
    height: 100%;
    overflow-y: auto; /* 侧边栏可滚动 */
  }
  
  .sidebar-section {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-title {
    font-size: 16px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .form-item {
    margin-bottom: 20px;
  }
  
  .form-item:last-child {
    margin-bottom: 0;
  }
  
  .form-item label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }
  
  .full-width {
    width: 100%;
  }
  
  /* 标签输入组件样式覆盖 */
  :deep(.vue-tags-input) {
    max-width: 100% !important;
  }
  
  :deep(.vue-tags-input .ti-input) {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
  
  @media (max-width: 992px) {
    .editor-container {
      grid-template-columns: 1fr;
    }
    
    .editor-sidebar {
      order: -1;
    }
  }
  
  /* Toast UI Editor 样式调整 */
  :deep(.toastui-editor-defaultUI) {
    border-radius: 0;
    border: none;
  }
  
  :deep(.toastui-editor-defaultUI-toolbar) {
    background-color: #fafafa;
  }
  
  /* Toast UI Editor 高度调整 */
  :deep(.toastui-editor) {
    height: 100% !important; /* 让编辑器占满容器高度 */
  }
  </style>