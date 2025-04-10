<template>
  <div class="chat-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <h2>对话</h2>
      <div class="chat-list">
        <ul>
          <li
            v-for="(chat, index) in chatHistory"
            :key="index"
            :class="['chat-item', { active: index === currentChatIndex }]"
            @click="selectChat(index)"
          >
            <span class="chat-title">{{ chat.title }}</span>
            <button @click.stop="deleteChat(index)" class="delete-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </li>
        </ul>
      </div>
      <button @click="createNewChat" class="new-chat-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        新对话
      </button>
    </div>

    <!-- Main chat area -->
    <div class="main-chat">
      <div class="chat-messages" ref="chatMessages">
        <div
          v-for="(message, index) in currentChat.messages"
          :key="index"
          :class="['message', message.role]"
        >
          <template v-if="message.role === 'user'">
            {{ message.content }}
          </template>
          <template v-else>
            <!-- 当消息完成时使用Markdown渲染，否则保持原始文本 -->
            <span v-if="index === currentChat.messages.length - 1 && isLoading" 
                  v-html="message.content" charset="UTF-8"></span>
            <span v-else
                  v-html="renderMarkdown(message.content)" charset="UTF-8"></span>
            <span
              v-if="index === currentChat.messages.length - 1 && isLoading"
              class="cursor"
            ></span>
          </template>
        </div>
      </div>

      <!-- Input area -->
      <div class="input-area">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="输入消息..."
          :disabled="isLoading"
        />
        <button @click="sendMessage" class="send-btn" :disabled="isLoading">
          <svg
            v-if="!isLoading"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <span v-else>发送中...</span>
        </button>
      </div>
    </div>
  </div>
</template>
  
<script>
// 在script标签顶部添加import
import marked from 'marked'; // 导入marked库

export default {
  data() {
    return {
      chatHistory: [{ title: "新对话", messages: [] }],
      currentChatIndex: 0,
      userInput: "",
      isLoading: false,
      socket: null,
      typingSpeed: 50, // 打字速度（毫秒/字符）
      currentAssistantMessage: "", // 用于存储当前正在接收的助手消息
      isLogin: false,
    };
  },
  computed: {
    currentChat() {
      return this.chatHistory[this.currentChatIndex];
    },
  },
  methods: {
    //检查是否登录

    initWebSocket() {
      if (localStorage.getItem("token") == null) {
        alert("请先登录");
        return;
      }

      const token = localStorage.getItem("token");
      //${this.$baseUrl}
      ///localhost:8090
      //域名
      const oldUrl = "ws://localhost:8090/api/chat?token=" + token;
      //const newUrl = "ws://www.fzhblog.cn/api/chat?token=" + token;
      this.socket = new WebSocket(
        oldUrl
        //newUrl
      );

      //请先登陆

      this.socket.onopen = () => {
        console.log("WebSocket连接已建立");
      };

      this.socket.onmessage = (event) => {
        let response;

        try {
          // 检查 WebSocket 消息类型
          if (event.data instanceof ArrayBuffer) {
            // 如果是 ArrayBuffer 类型，使用 TextDecoder 解码
            response = JSON.parse(
              new TextDecoder("utf-8").decode(new Uint8Array(event.data))
            );
          } else if (typeof event.data === "string") {
            // 如果是字符串，直接解析
            response = JSON.parse(event.data);
          } else {
            throw new Error("Unsupported WebSocket message type");
          }
        } catch (error) {
          console.error("解析 WebSocket 消息出错:", error);
          this.appendAssistantMessage("处理响应时出现错误。", true);
          return;
        }

        // 处理响应逻辑
        if (response.type === "DONE") {
          this.isLoading = false;
          this.appendAssistantMessage(this.currentAssistantMessage, true);
          this.currentAssistantMessage = "";
        } else if (response.role === "assistant") {
          this.currentAssistantMessage += response.content;
          this.appendAssistantMessage(this.currentAssistantMessage, false);
        }
      };

      this.socket.onclose = () => {
        console.log("WebSocket连接已关闭");
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket错误:", error);
        this.appendAssistantMessage("抱歉，连接出现了错误。", true);
        this.isLoading = false;
      };
    },
    appendAssistantMessage(content, isComplete) {
      if (
        this.currentChat.messages.length > 0 &&
        this.currentChat.messages[this.currentChat.messages.length - 1].role ===
          "assistant"
      ) {
        if (isComplete) {
          this.currentChat.messages[
            this.currentChat.messages.length - 1
          ].content = content;
        } else {
          // 显示原始文本，不应用Markdown（因为打字效果）
          this.typeMessage(content, this.currentChat.messages.length - 1);
        }
      } else {
        this.currentChat.messages.push({
          role: "assistant",
          content: "",
        });
        if (isComplete) {
          this.currentChat.messages[
            this.currentChat.messages.length - 1
          ].content = content;
        } else {
          this.typeMessage(content, this.currentChat.messages.length - 1);
        }
      }
    },
    // 添加Markdown渲染方法
    renderMarkdown(content) {
      return content ? marked(content) : '';
    },
    //你好  有什么  可以  帮助  你的 吗？
    typeMessage(content, index) {
      const message = this.currentChat.messages[index];
      message.content = ""; // 清空已有内容
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < content.length) {
          // 累计输出完整的子字符串
          message.content = content.slice(0, i + 1);
          i++;
          this.$nextTick(() => {
            this.scrollToBottom(); // 滚动到底部
          });
        } else {
          clearInterval(intervalId); // 完成后停止
        }
      }, this.typingSpeed);
    },
    sendMessage() {
      if (localStorage.getItem("token") == null) {
        alert("请先登陆");
        return;
      }
      if (this.userInput.trim() === "" || this.isLoading) return;

      const userMessage = { role: "user", content: this.userInput };
      this.currentChat.messages.push(userMessage);
      this.isLoading = true;

      // 发送消息到WebSocket服务器
      this.socket.send(
        JSON.stringify({
          messages: this.currentChat.messages,
        })
      );

      this.userInput = "";
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    selectChat(index) {
      this.currentChatIndex = index;
    },
    scrollToBottom() {
      const chatMessages = this.$refs.chatMessages;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    deleteChat(index) {
      if (this.chatHistory.length > 1) {
        this.chatHistory.splice(index, 1);
        if (this.currentChatIndex >= this.chatHistory.length) {
          this.currentChatIndex = this.chatHistory.length - 1;
        }
      } else {
        alert("无法删除最后一个对话");
      }
    },
    createNewChat() {
      if (localStorage.getItem("token") == null) {
        alert("请先登陆");
        return;
      }
      this.chatHistory.push({
        title: "新对话 " + (this.chatHistory.length + 1),
        messages: [],
      });
      this.currentChatIndex = this.chatHistory.length - 1;
    },
  },
  mounted() {
    if (this.chatHistory.length === 0) {
      this.createNewChat();
    }
    this.initWebSocket();
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  },
};
</script>
  
  <style scoped>
/* 添加以下样式到TestChat.vue的<style>部分最前面 */
.chat-container {
  display: flex !important; 
  position: relative !important;
  height: calc(100vh - 120px) !important;
  flex: none !important; /* 覆盖App.vue中的flex: 1 */
  max-height: calc(100vh - 120px) !important;
}

.main-chat {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important; 
  overflow: hidden !important;
}

/* 确保输入框显示在底部 */
.input-area {
  position: absolute !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 75% !important;
  max-width: 800px !important;
  min-width: 300px !important;
  z-index: 100 !important;
  
  display: flex !important;
  align-items: center !important;
  padding: 12px 18px !important;
  background-color: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 20px !important;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease !important;
}

.input-area:hover, .input-area:focus-within {
  box-shadow: 0 5px 16px rgba(0, 122, 255, 0.12) !important;
  border-color: rgba(0, 122, 255, 0.2) !important;
  transform: translateX(-50%) translateY(-2px) !important;
}

.input-area input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  font-size: 15px;
  color: #333;
  background-color: transparent;
  border: none;
}

.input-area .send-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background-color: #007aff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  padding: 0;
  margin-left: 12px;
  box-shadow: 0 2px 5px rgba(0, 122, 255, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .input-area {
    width: 85% !important;
    padding: 10px 16px !important;
  }
  
  .input-area:hover, .input-area:focus-within {
    transform: translateX(-50%) translateY(-1px) !important;
  }
}

@media (max-width: 480px) {
  .input-area {
    width: 90% !important;
    min-width: auto !important;
  }
}

/* 保持原有的样式不变 */
.chat-container {
  display: flex;
  height: calc(100vh - 100px); /* 减去头部和底部的高度 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  background-color: #ffffff;
  color: #1d1d1f;
  margin-bottom: 60px; /* 为备案信息留出空间 */
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.sidebar {
  min-width: 250px; /* 添加最小宽度 */
  width: 250px; /* 固定宽度 */
  flex-shrink: 0; /* 防止侧边栏收缩 */
  background-color: #f5f5f7;
  padding: 20px;
  border-right: 1px solid #d2d2d7;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar h2 {
  margin-bottom: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.chat-list {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.chat-list ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  min-width: 210px; /* 设置最小宽度 */
}

.chat-item:hover {
  background-color: #e8e8ed;
}

.chat-item.active {
  background-color: #d2d2d7;
}

.chat-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  max-width: 180px; /* 限制最大宽度 */
}

.delete-btn {
  background: none;
  border: none;
  color: #86868b;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.delete-btn:hover {
  background-color: #d2d2d7;
}

.new-chat-btn {
  width: 100%;
  padding: 10px;
  background-color: #0071e3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-chat-btn:hover {
  background-color: #0077ed;
}

.new-chat-btn svg {
  margin-right: 5px;
}

.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 600px; /* 添加最小宽度，防止过度收缩 */
  position: relative;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 80px; /* 为输入框留出空间 */
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 70%; /* 保持最大宽度 */
  min-width: 200px; /* 添加最小宽度 */
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap; /* 保持换行和空格 */
}

.user {
  align-self: flex-end;
  background-color: #007aff;
  color: white;
}

.assistant {
  align-self: flex-start;
  background-color: #e9e9eb;
  color: #1d1d1f;
}

/* 修复输入区域 */
.input-area {
  position: absolute !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 75% !important;
  max-width: 800px !important;
  min-width: 300px !important;
  z-index: 100 !important;
  
  display: flex !important;
  align-items: center !important;
  padding: 12px 18px !important;
  background-color: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 20px !important;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease !important;
}

.input-area:hover, .input-area:focus-within {
  box-shadow: 0 5px 16px rgba(0, 122, 255, 0.12) !important;
  border-color: rgba(0, 122, 255, 0.2) !important;
  transform: translateX(-50%) translateY(-2px) !important;
}

.input-area input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  font-size: 15px;
  color: #333;
  background-color: transparent;
  border: none;
}

.input-area .send-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background-color: #007aff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  padding: 0;
  margin-left: 12px;
  box-shadow: 0 2px 5px rgba(0, 122, 255, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .input-area {
    width: 85% !important;
    padding: 10px 16px !important;
  }
  
  .input-area:hover, .input-area:focus-within {
    transform: translateX(-50%) translateY(-1px) !important;
  }
}

@media (max-width: 480px) {
  .input-area {
    width: 90% !important;
    min-width: auto !important;
  }
}

/* 光标动画 */
.cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background-color: #333;
  animation: blink 1s infinite;
  margin-left: 2px;
  vertical-align: middle;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* 媒体查询，适应不同屏幕尺寸 */
@media (max-width: 768px) {
  .sidebar {
    min-width: 200px;
    width: 200px;
  }

  .chat-title {
    max-width: 130px;
  }

  .chat-item {
    min-width: 160px;
  }

  .chat-container {
    margin: 10px;
    height: calc(100vh - 120px);
  }

  .main-chat {
    min-width: auto;
  }
}

/* 防止外部下拉栏影响 */
.chat-container {
  position: relative !important;
  z-index: 1 !important; /* 确保较低层级 */
  isolation: isolate !important; /* 创建堆叠上下文 */
}

/* 修复与外部下拉栏的冲突 */
:deep(.navbar-dropdown),
:deep(.el-dropdown-menu) {
  z-index: 2000 !important; /* 确保下拉菜单高于聊天容器 */
}

/* 添加Markdown样式支持 */
.assistant :deep(pre) {
  background-color: #f6f8fa !important;
  padding: 16px !important;
  border-radius: 6px !important;
  overflow-x: auto !important;
  margin: 10px 0 !important;
}

.assistant :deep(code) {
  font-family: Consolas, Monaco, 'Andale Mono', monospace !important;
  background-color: #f6f8fa !important;
  padding: 3px 5px !important;
  border-radius: 3px !important;
  font-size: 0.9em !important;
}

.assistant :deep(p) {
  margin: 10px 0 !important;
}

.assistant :deep(ul), 
.assistant :deep(ol) {
  padding-left: 20px !important;
  margin: 10px 0 !important;
}

.assistant :deep(h1),
.assistant :deep(h2),
.assistant :deep(h3) {
  margin-top: 24px !important;
  margin-bottom: 16px !important;
  font-weight: 600 !important;
  line-height: 1.25 !important;
}

.assistant :deep(h1) {
  font-size: 1.5em !important;
  border-bottom: 1px solid #eaecef !important;
  padding-bottom: 0.3em !important;
}

.assistant :deep(h2) {
  font-size: 1.3em !important;
  border-bottom: 1px solid #eaecef !important;
  padding-bottom: 0.3em !important;
}

.assistant :deep(h3) {
  font-size: 1.1em !important;
}

.assistant :deep(a) {
  color: #0366d6 !important;
  text-decoration: none !important;
}

.assistant :deep(a:hover) {
  text-decoration: underline !important;
}

.assistant :deep(table) {
  border-collapse: collapse !important;
  width: 100% !important;
  margin: 10px 0 !important;
}

.assistant :deep(th),
.assistant :deep(td) {
  border: 1px solid #dfe2e5 !important;
  padding: 6px 13px !important;
}

.assistant :deep(th) {
  background-color: #f6f8fa !important;
}

/* 确保消息气泡适应Markdown内容 */
.message {
  min-width: auto !important; /* 覆盖之前的200px最小宽度 */
  width: auto !important;
  max-width: 70% !important;
}
</style>

