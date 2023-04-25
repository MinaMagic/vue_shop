<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 输入区域 -->
      <div slot="header" class="clearfix ">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input placeholder="请输入搜索内容" v-model="queryInfo.query"
            clearable
            @clear="initUserList"><el-button slot="append" icon="el-icon-search" @click="initUserList"></el-button></el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 用户信息 -->
      <el-table
        :data="usersList"
        border
        stripe
        style="width: 100%"
        >
        <el-table-column
          type="index"
          label="#"
          width="50">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
          width="150">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="150">
        </el-table-column>
        <el-table-column
          prop="mobile"
          label="电话"
          width="120">
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色"
          width="150">
        </el-table-column>
        <el-table-column
          label="状态"
          width="120"
          >
          <template slot-scope="scope">
            <el-switch
            v-model="scope.row.mg_state"
            @change="userStateChange($event,scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="300">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" content="编辑" placement="top"><el-button type="primary" icon="el-icon-edit" size="small" @click="reviseUser(scope.row.id)"></el-button></el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除" placement="top"><el-button type="danger" icon="el-icon-delete" size="small" @click="deleteUser(scope.row.id)"></el-button></el-tooltip>
              <el-tooltip class="item" effect="dark" content="分配权限" placement="top"><el-button type="warning" icon="el-icon-setting" size="small" @click="showSetRoleDialog(scope.row)"></el-button></el-tooltip>
            </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="this.queryInfo.pagenum"
          :page-sizes="[1,2,3,4]"
          :page-size="this.queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPage">
        </el-pagination>
      </div>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClosed">
      <span>
        <el-form :model="addUserForm" :rules="addUserRules" ref="userFormRef" label-width="65px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password" show-password></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="this.addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAdd">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="reviseDialogVisible" @close="reviseDialogClosed">
      <span>
        <el-form :model="reviseUserForm" :rules="reviseUserRules" ref="reviseFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="用户名">
            <el-input v-model="reviseUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="reviseUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="reviseUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reviseDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmRevise">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible" @close="setRoleDialogClosed">
      <span>
        <div>
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的角色：{{ userInfo.role_name }}</p>
          <p>分配的新角色：
            <el-select v-model="selectRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSetRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    const checkEmail = (rule, valid, cb) => {
      const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (regEmail.test(valid)) {
        return cb()
      }
      return cb(new Error('请输入合法的邮箱'))
    }
    const checkMobile = (rule, valid, cb) => {
      const regMobile = /^(?:(?:\+|00)86)?1\d{10}$/
      if (regMobile.test(valid)) {
        return cb()
      }
      return cb(new Error('请输入正确的手机号'))
    }
    return {
      usersList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 1
      },
      totalPage: 0,
      value: true,
      addDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      reviseDialogVisible: false,
      reviseUserForm: [],
      reviseUserRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色
      setRoleDialogVisible: false,
      // 需要被分配角色信息
      userInfo: {},
      // 所有角色列表
      rolesList: [],
      // 选中新角色的Id
      selectRoleId: ''
    }
  },
  methods: {
    async initUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户失败')
      this.totalPage = res.data.total
      this.usersList = res.data.users
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.initUserList()
    },
    handleSizeChange (newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.initUserList()
    },
    async userStateChange (newState, userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${newState}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改状态失败')
      }
      this.$message.success('修改状态成功')
    },
    addDialogClosed () {
      this.$refs.userFormRef.resetFields()
    },
    confirmAdd () {
      this.$refs.userFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addUserForm)
          if (res.meta.status !== 201) return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          this.initUserList()
        }
      })
      this.addDialogVisible = false
    },
    async reviseUser (id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      this.reviseUserForm = res.data
      this.reviseDialogVisible = true
    },
    reviseDialogClosed () {
      this.$refs.reviseFormRef.resetFields()
    },
    confirmRevise () {
      this.$refs.reviseFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`users/${this.reviseUserForm.id}`, this.reviseUserForm)
          if (res.meta.status !== 200) return this.$message.error('用户消息修改失败')
          this.$message.success('用户消息修改成功')
          this.initUserList()
        }
      })
      this.reviseDialogVisible = false
    },
    deleteUser (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`users/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        this.initUserList()
        this.$message.success('删除用户成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    async showSetRoleDialog (userInfo) {
      this.setRoleDialogVisible = true
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
    },
    setRoleDialogClosed () {
      this.selectRoleId = ''
      this.setRoleDialogVisible = false
    },
    async confirmSetRole () {
      if (!this.selectRoleId) return this.$message.error('请选择新角色')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
      if (res.meta.status !== 200) return this.$message.error('更新角色失败')
      this.$message.success('更新角色成功')
      this.initUserList()
      this.selectRoleId = ''
      this.setRoleDialogVisible = false
    }
  },
  created () {
    this.initUserList()
  }
}
</script>

<style lang="less" scoped>

</style>
