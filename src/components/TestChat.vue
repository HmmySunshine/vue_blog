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
            <span v-html="message.content" charset="UTF-8"></span>
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
        alert("请先登陆");
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
/* 保持原有的样式不变 */
.chat-container {
  display: flex;
  height: calc(100vh - 60px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  background-color: #ffffff;
  color: #1d1d1f;
}

.sidebar {
  width: 250px;
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
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 70%;
  line-height: 1.4;
  word-wrap: break-word;
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

.input-area {
  display: flex;
  background-color: #f5f5f7;
  border-radius: 20px;
  padding: 5px;
  margin: 10px;
}

input {
  flex-grow: 1;
  padding: 10px 15px;
  font-size: 16px;
  border: none;
  background: transparent;
  color: #1d1d1f;
}

input:focus {
  outline: none;
}

.send-btn {
  background: none;
  border: none;
  color: #007aff;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.send-btn:hover {
  background-color: #e8e8ed;
}

.send-btn:disabled {
  color: #86868b;
  cursor: not-allowed;
}

.cursor {
  display: inline-block;
  width: 10px;
  height: 20px;
  background-color: #007aff;
  animation: blink 0.7s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>