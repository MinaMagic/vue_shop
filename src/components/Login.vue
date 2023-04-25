<template>
    <div class="login_container">
      <div class="login_box">
        <!-- 头部区域 -->
        <div class="avatar_box">
          <img src="@/assets/logo.png" alt="">
        </div>
        <!-- 表单区域 -->
        <el-form ref="loginForm" :model="loginForm" label-width="0" class="login_form" :rules="loginFormRules">
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username"  placeholder="请输入用户名"
      prefix-icon="el-icon-user-solid">></el-input>
            <!-- 密码 -->
          </el-form-item>
          <el-form-item  prop="password">
            <el-input v-model="loginForm.password" placeholder="请输入密码"
      prefix-icon="el-icon-s-goods" show-password @keyup.enter.native="submitForm"></el-input>
          </el-form-item>
          <!-- 按钮 -->
          <el-form-item class="btns">
            <el-button type="primary" @click="submitForm">登录</el-button>
            <el-button type="info" @click="resetForm('loginForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm () {
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid) {
          return false
        } else {
          const { data: res } = await this.$http.post('login', this.loginForm)
          // 200为成功
          if (res.meta.status !== 200) return this.$message.error('登录失败')
          this.$message.success('登录成功')
          window.sessionStorage.setItem('token', res.data.token)
          window.sessionStorage.setItem('username', res.data.username)
          this.$router.push('/home')
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    iptPsw () {
    }
  }
}

</script>

  <style lang="less" scoped>
  .login_container {
    position: relative;
    background-color: #dbccf1;
    height: 100%;
    .login_box {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
      width: 450px;
      height: 300px;
      background-color: #fff;
      border-radius: 3px;
      .avatar_box {
        position: absolute;
        left: 50%;
        top: 0;
        transform: translate(-50%,-50%);
        width: 120px;
        height: 120px;
        background-color: #fff;
        padding: 10px;
        border-radius: 50%;
        box-shadow: 0 0 5px #ccc;
        img {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #eceeeb;
          border-radius: 50%;
          vertical-align: middle;
        }
      }
      .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
        .btns {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
  </style>
