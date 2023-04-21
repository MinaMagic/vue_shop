<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
          <div>
            <img src="@/assets/logo.png" alt="">
            <span>电商后台管理系统</span>
          </div>
          <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
          <!-- 侧边栏 -->
            <el-aside :width="isCollapse?'68px':'200px'">
              <div class="toggle-button" @click="isCollapse=!isCollapse">|||</div>
              <el-menu :default-openeds="['1', '3']" background-color="#313743" text-color="#fff" unique-opened :collapse="isCollapse" :collapse-transition="isCollapse" router :default-active="activePath">
                <el-submenu :index="item.id.toString()" v-for="item in menuList" :key="item.id">
                  <template slot="title">
                    <i :class="iconObj[item.id]"></i>
                    <span>{{ item.authName }}</span>
                  </template>
                  <el-menu-item :index="subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="changeActivePath(subItem.path)">
                    <i class="el-icon-s-custom"></i>
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
        103: 'el-icon-warning-outline',
        101: 'el-icon-goods',
        102: 'el-icon-shopping-bag-1',
        145: 'el-icon-edit-outline'
      },
      isCollapse: false,
      activePath: ''
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
      console.log(res.data)
    },
    changeActivePath (activePathName) {
      window.sessionStorage.setItem('activePath', activePathName)
      this.activePath = activePathName
    }
  },
  created () {
    this.getMeunList()
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
  background-color: #313743;
  color: #fff;
  font-size: 20px;
  img {
    width: 50px;
    height: 50px;
    vertical-align: middle;
    margin-right: 10px;
  }
}
.el-aside {
  background-color: #313743;
  .toggle-button {
    text-align: center;
    background-color: #475163;
    padding: 5px;
    color: #fff;
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
    background-color: #fff;
}
</style>
