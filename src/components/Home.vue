<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header height="70px">
          <div>
            <img src="@/assets/logo.png" alt="">
            <span>电商后台管理系统</span>
          </div>
          <el-popover
            placement="bottom"
            trigger="hover">
            <el-button type="info" @click="logout" class="logout">退出登录</el-button>
            <el-button slot="reference">
              <i class="el-icon-user-solid"></i>
              <span>{{ username }}</span>
              <i class="el-icon-arrow-down"></i>
            </el-button>
          </el-popover>
        </el-header>
        <el-container>
          <!-- 侧边栏 -->
            <el-aside :width="isCollapse?'68px':'200px'">
                <el-tooltip class="item" effect="dark" :content="isCollapse? '展开' : '折叠'" placement="top">
                  <div class="toggle-button" @click="isCollapse=!isCollapse">
                    <i :class="isCollapse? 'el-icon-s-fold' : 'el-icon-s-unfold'" style="font-size: 25px"></i>
                  </div>
                </el-tooltip>
              <el-menu unique-opened :collapse="isCollapse" :collapse-transition="isCollapse" router :default-active="activePath">
                <el-submenu :index="item.id.toString()" v-for="item in menuList" :key="item.id">
                  <template slot="title">
                    <i :class="iconObj[item.id]"></i>
                    <span>{{ item.authName }}</span>
                  </template>
                  <el-menu-item :index="subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="changeActivePath(subItem.path)">
                    <i class="el-icon-menu"></i>
                    <span>{{ subItem.authName }}</span>
                  </el-menu-item>
                </el-submenu>
              </el-menu>
            </el-aside>
            <!-- 主体部分 -->
            <el-main>
              <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
  </template>

<script>
export default {
  data () {
    return {
      menuList: [],
      iconObj: {
        125: 'el-icon-user',
        103: 'el-icon-setting',
        101: 'el-icon-goods',
        102: 'el-icon-tickets',
        145: 'el-icon-monitor'
      },
      isCollapse: false,
      activePath: '',
      // 登录用户名称
      username: ''
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMeunList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    changeActivePath (activePathName) {
      window.sessionStorage.setItem('activePath', activePathName)
      this.activePath = activePathName
    }
  },
  created () {
    this.getMeunList()
    this.username = window.sessionStorage.getItem('username')
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4338ca;
  color: #fff;
  font-size: 20px;
  img {
    width: 50px;
    height: 50px;
    vertical-align: middle;
    margin-right: 10px;
  }
}
.logout {
    margin-left: 25px;
  }
.el-aside {
  background-color: #fff;
  .toggle-button {
    text-align: center;
    background-color: #fff;
    padding: 10px;
    color: #000;
    cursor: pointer;
  }
  .el-menu {
    border-right: none;
  }
}

.el-menu:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }
.el-main {
    background-color: #f1f2f6;
}
</style>
