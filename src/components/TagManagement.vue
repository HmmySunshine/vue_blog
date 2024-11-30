<template>
  <div class="tag-management">
    <h2 class="page-title">标签管理</h2>
    <div class="search-form">
      <el-input
        v-model="searchQuery"
        placeholder="搜索标签"
        class="search-input"
      ></el-input>
      <el-button type="primary" @click="fetchTags" class="search-button">
        搜索
      </el-button>
    </div>
    <div class="tag-form">
      <el-input
        v-model="newTag"
        placeholder="输入新标签名称"
        @keyup.enter="addTag"
        class="add-input"
        clearable
      ></el-input>
      <el-button type="success" @click="addTag" class="add-button">
        添加标签
      </el-button>
    </div>

    <div class="tag-list">
      <div v-for="tag in tags" :key="tag.id" class="tag-item">
        <div class="tag-content">
          <span v-if="!tag.editing">{{ tag.name }}</span>
          <el-input
            v-else
            v-model="tag.editName"
            size="small"
            @keyup.enter="updateTag(tag)"
            class="edit-input"
          ></el-input>
        </div>
        <div class="tag-actions">
          <el-button
            v-if="!tag.editing"
            type="text"
            @click="startEditing(tag)"
            class="edit-btn"
          >
            编辑
          </el-button>
          <el-button
            v-else
            type="text"
            @click="updateTag(tag)"
            class="save-btn"
          >
            保存
          </el-button>
          <el-button type="text" @click="deleteTag(tag.id)" class="delete-btn">
            删除
          </el-button>
        </div>
      </div>
    </div>
    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      >
      </el-pagination>
    </div>
    <transition name="fade">
      <div v-if="responseFlag" class="response-message">
        <el-alert
          :title="responseMsg"
          :type="responseType"
          show-icon
          :closable="false"
        ></el-alert>
      </div>
    </transition>
  </div>
</template>  
  
  <script>
import axios from "axios";

export default {
  name: "TagManagement",
  data() {
    return {
      tags: [],
      newTag: "",
      responseMsg: "",
      responseType: "",
      responseFlag: false,
      total: 0,
      currentPage: 1,
      pageSize: 5,
      searchQuery: "",
    };
  },
  mounted() {
    this.fetchTags();
  },
  methods: {
    async fetchTags() {
      try {
        const response = await axios.get(`${this.$baseUrl}/api/tags`, {
          params: {
            name: this.searchQuery,
            page: this.currentPage,
            pageSize: this.pageSize,
          },
        });
        if (response.data.code === 200) {
          this.tags = response.data.data.pageList.map((tag) => ({
            ...tag,
            editing: false,
            editName: tag.name,
          }));
          this.total = response.data.data.total;
        }
      } catch (error) {
        console.error("获取标签失败:", error);
        this.showMessage("获取标签失败", "error");
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchTags();
    },
    async addTag() {
      if (!this.newTag.trim()) return;
      try {
        const response = await axios.post(`${this.$baseUrl}/api/tags`, {
          name: this.newTag.trim(),
        });
        this.showMessage("标签添加成功", "success");

        this.tags.unshift({
          ...response.data.data,
          editing: false,
          editName: response.data.name,
        });
        this.newTag = "";
      } catch (error) {
        console.error("添加标签失败:", error);
        this.showMessage("添加标签失败", "error");
      }
    },
    startEditing(tag) {
      tag.editing = true;
      tag.editName = tag.name;
    },
    async updateTag(tag) {
      if (!tag.editName.trim()) return;
      try {
        await axios.put(`${this.$baseUrl}/api/tags/${tag.id}`, {
          name: tag.editName.trim(),
        });
        tag.name = tag.editName.trim();
        tag.editing = false;
        this.showMessage("标签更新成功", "success");
      } catch (error) {
        console.error("更新标签失败:", error);
        this.showMessage("更新标签失败", "error");
      }
    },
    async deleteTag(id) {
      if (confirm("确定要删除这个标签吗？")) {
        try {
          await axios.delete(`${this.$baseUrl}/api/tags/${id}`);
          this.tags = this.tags.filter((tag) => tag.id !== id);
          this.showMessage("标签删除成功", "success");
        } catch (error) {
          console.error("删除标签失败:", error);
          this.showMessage("删除标签失败", "error");
        }
      }
    },
    showMessage(message, type) {
      this.responseMsg = message;
      this.responseType = type;
      this.responseFlag = true;
      setTimeout(() => {
        this.responseFlag = false;
      }, 3000);
    },
  },
};
</script>  
  
  <style scoped>

.tag-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
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
.tag-form {
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

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}
.pagination {  
    display: flex;  
    justify-content: center;  
  }  
.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-radius: 10px;
  background-color: #fafafa;
  transition: box-shadow 0.3s ease;
}

.tag-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tag-content {
  flex: 1;
  font-size: 16px;
  color: #333333;
}

.edit-input {
  width: 100%;
}

.tag-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 按钮样式 */
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

.response-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: 320px;
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