<template>
  <div>
     <!-- 面包屑导航 -->
     <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
    <!-- 权限信息表格 -->
    <el-table
        :data="rightsList"
        border
        stripe
        style="width: 100%"
        >
        <el-table-column type="index" label="#" width="50">
        </el-table-column>
        <el-table-column prop="authName" label="权限姓名" width="300">
        </el-table-column>
        <el-table-column
          prop="path"
          label="路径"
          width="300">
        </el-table-column>
        <el-table-column
          label="权限等级"
          width="300">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==='0'">一般</el-tag>
            <el-tag type="success" v-else-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightsList: []
    }
  },
  methods: {
    async initRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rightsList = res.data
    }
  },
  created () {
    this.initRightsList()
  }
}
</script>

<style>

</style>
