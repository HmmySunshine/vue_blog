<template>
  <div class="article-editor">
    <h2 class="editor-title">发布文章</h2>
    <div class="editor-container">
      <div class="editor-main">
        <div class="form-group">
          <input
            v-model="article.title"
            type="text"
            class="title-input"
            placeholder="请输入文章标题（必须）"
          />
        </div>
        <div class="form-group">
          <select v-model="article.categoryId" class="category-select">
            <option value="">选择分类</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <vue-tags-input
            v-model="tag"
            :tags="article.tags"
            :autocomplete-items="filteredTags"
            @tags-changed="(newTags) => (article.tags = newTags)"
            placeholder="输入标签并按回车"
            @input="updateFilteredTags"
          />
        </div>
        <div class="editor-wrapper" ref="editorElem"></div>
        <div class="form-group">
          <textarea
            v-model="article.summary"
            class="summary-input"
            placeholder="请输入文章摘要（最多500字）"
            maxlength="500"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
    <div class="editor-footer">
      <button class="btn btn-secondary" @click="returnToList">返回列表</button>
      <button class="btn btn-primary" @click="saveArticle">保存文章</button>
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
        isPublished: true,
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
        height: '500px',
        initialEditType: 'markdown', // 默认使用 markdown 模式
        previewStyle: 'vertical',    // 左侧编辑，右侧预览
        placeholder: '请输入文章内容...',
        

        hooks: {
          addImageBlobHook: async (blob, callback) => {
            // 处理图片上传
            //图片上传限制（>1MB）
            if (blob.size > 1024 * 1024) {
              alert('图片大小不能超过1MB');
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
        alert("请输入文章标题");
        return;
      }

      if (!this.article.categoryId) {
        alert("请选择文章分类");
        return;
      }
      if (!this.article.content.trim()) {
        alert("请输入文章内容");
        return;
      }

      try {
        const response = await axios.post(
          `${this.$baseUrl}/api/articles`,
          {
            title: this.article.title,
            content: this.article.content,
            tags: this.article.tags.map((tag) => tag.text),
            categoryId: this.article.categoryId,
            summary: this.article.summary,
            isPublished: this.article.isPublished,
            tempImages: this.tempImages,
          }
        );

        if (response.data.code === 200) {
          alert("文章保存成功");
          this.$emit("article-saved");
          this.tempImages = [];
        }
      } catch (error) {
        console.error("保存文章失败:", error);
        alert("保存文章失败，请重试");
      }
    },
    returnToList() {
      this.$emit("return-to-list");
    },
  },
};
</script>
  
  <style scoped>
.article-editor {
  max-width: 1000px; /* 缩小最大宽度 */
  margin: 0 auto;
  padding: 20px;
}

.editor-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.editor-container {
  margin-bottom: 20px;
}

.editor-main {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.title-input,
.category-select,
.summary-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.title-input:focus,
.category-select:focus,
.summary-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.editor-wrapper {
  margin: 20px 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  overflow-y: auto;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background-color: #357abd;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

.toastui-editor-defaultUI {
  border-radius: 4px;
}

.toastui-editor-defaultUI-toolbar {
  background-color: #f9f9f9;
}
</style>