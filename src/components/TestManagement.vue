<template>
  <div>
    <el-container>
      <el-header>
        <h1>测试管理curd</h1>
      </el-header>
      <el-main>
        <el-button type="primary" @click="addEditStudent = true"
          >添加学生测试 <i class="el-icon-upload el-icon--right"></i
        ></el-button>
        <el-dialog title="编辑学生" :visible.sync="editStudent" width="30%">
            <el-form
          ref="form"
          v-if="editStudent"
          :model="newStudent"
          label-width="80px"
        >
          <el-form-item label="姓名">
            <el-input v-model="newStudent.name"></el-input>
          </el-form-item>
          <el-radio v-model="newStudent.gender" label="1">男</el-radio>
          <el-radio v-model="newStudent.gender" label="2">女</el-radio>
          <el-form-item
            label="年龄"
            prop="age"
            :rules="[
              { required: true, message: '年龄不能为空' },
              { type: 'number', message: '年龄必须为数字值' },
            ]"
            ><el-input
              v-model.number="newStudent.age"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          </el-form>
        </el-dialog>
        <el-dialog title="添加学生测试" :visible.sync="addEditStudent" width="30%">
        <el-form
          ref="form"
          v-if="addEditStudent"
          :model="newStudent"
          label-width="80px"
        >
          <el-form-item label="姓名">
            <el-input v-model="newStudent.name"></el-input>
          </el-form-item>
          <el-radio v-model="newStudent.gender" label="1">男</el-radio>
          <el-radio v-model="newStudent.gender" label="2">女</el-radio>
          <el-form-item
            label="年龄"
            prop="age"
            :rules="[
              { required: true, message: '年龄不能为空' },
              { type: 'number', message: '年龄必须为数字值' },
            ]"
            ><el-input
              v-model.number="newStudent.age"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-date-picker
            v-model="newStudent.date"
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
          
          <el-form-item>
            <el-button type="primary" @click="onSubmit(newStudent)"
              >添加学生测试</el-button
            >
            <el-button @click="addEditStudent = false">取消</el-button>
          </el-form-item>
        </el-form>
        </el-dialog>
        <el-table :data="students" style="width: 100%">
          <el-table-column prop="id" label="学号"> </el-table-column>
          <el-table-column prop="stuName" label="姓名"> </el-table-column>
          <el-table-column prop="gender" label="性别"> </el-table-column>
          <el-table-column prop="age" label="年龄"> </el-table-column>
          <el-table-column prop="enterTime" label="测试时间"> </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="editStudent1(scope.row)">编辑 </el-button>

              <el-button
                type="text"
                size="small"
                @click="deleteStudent(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      newStudent: {
        name: "",
        gender: "",
        age: "",
        date: "",
      },
      addEditStudent: false,
      editStudent : false,
      students: [],
      
    };
  },
  methods: {
    onSubmit(newStudent) {
      this.addStduent(newStudent);
    },
    async fetchStudent() {
      const response = await axios.get(`${this.$baseUrl}/api/getStudents`);
      if (response.status === 200) {
        this.students = response.data;
        this.students.forEach((student) => {
          student.enterTime = this.formatDate(student.enterTime);
        });
      } else {
        this.$message.error("获取学生信息失败");
      }
    },
    formatDate(value) {
      if (!value) return "";
      const date = new Date(value);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const hours = ("0" + date.getHours()).slice(-2);
      const minutes = ("0" + date.getMinutes()).slice(-2);
      const seconds = ("0" + date.getSeconds()).slice(-2);
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    async deleteStudent(student) {
      try {
        const response = await axios.delete(
          `${this.$baseUrl}/api/deleteStudent/${student.id}`
        );
        if (response.status === 200) {
          this.$message.success("删除成功");
          this.fetchStudent();
        } else {
          this.$message.error("删除失败");
        }
      } catch (error) {
        console.error(error);
      }
    },
    async editStudent1(student) {
      this.newStudent = {
        id: student.id,
        name: student.stuName,
        gender: student.gender,
        age: student.age,
        date: student.enterTime,
      };
      this.editStudent = true;

    },
    async addStduent(newStudent) {
      if (
        newStudent.name === "" ||
        newStudent.gender === "" ||
        newStudent.age === "" ||
        newStudent.date === ""
      ) {
        this.$message.error("请填写完整信息");
        return;
      }

      try {
        const response = await axios.post(
          `${this.$baseUrl}/api/addStudent`,
          newStudent,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          this.$message.success("添加成功");

          this.newStudent = {
            name: "",
            gender: "",
            age: "",
            date: "",
          };
        } else {
          this.$message.error("添加失败");
        }
        this.fetchStudent();
        this.showEdit = false;
      } catch (error) {
        console.error(error);
      }
    },
  },
  mounted() {
    this.fetchStudent();
  },
};
</script>



<style scoped>
h1 {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  color: #000;
  text-align: center;
}

/* 对话框内容的样式 */
.el-dialog__body {
  padding: 20px;
}

/* 表单整体的样式 */
.el-form {
  max-width: 400px;
  margin: 0 auto;
}

/* 表单项的样式 */
.el-form-item {
  margin-bottom: 15px;
}

/* 性别选择器的样式 */
.el-radio {
  margin-right: 10px;
}

/* 日期选择器的样式 */
.el-date-picker {
  width: 100%;
}

/* 按钮的样式 */
.el-button {
  margin-top: 10px;
}
</style>