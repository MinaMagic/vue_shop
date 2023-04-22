<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
        <!-- 添加角色按钮 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
            </el-col>
        </el-row>
    <!--角色信息表格 -->
    <el-table
        :data="rolesList"
        border
        stripe
        style="width: 100%"
        >
        <!-- 展开列 -->
        <el-table-column type="expand" width="50">
            <template slot-scope="scope">
                <el-row v-for="(item, i) in scope.row.children" :key="item.id" :gutter="20" :class="['lineBottom',i===0?'lineTop':'','vcenter']">
                    <el-col :span="4">
                        <el-tag closable @close="removeRightById(scope.row,item.id)">{{ item.authName }}</el-tag>
                        <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="20" >
                        <el-row v-for="(second,i) in item.children" :key="second.id" :gutter="20" :class="[i===0?'':'lineTop','vcenter']">
                                <el-col :span="6"><el-tag type="success" closable @close="removeRightById(scope.row,second.id)">{{ second.authName }}</el-tag><i class="el-icon-caret-right"></i>
                                  </el-col>
                                <el-col :span="18">
                                    <span v-for="third in second.children" :key="third.id"><el-tag type="warning" closable @close="removeRightById(scope.row,third.id)">{{ third.authName }}</el-tag></span>
                                </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="50">
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="300">
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述"
          width="300">
        </el-table-column>
        <el-table-column
          label="操作"
          width="300">
            <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="编辑" placement="top">
                    <el-button type="primary" icon="el-icon-edit" size="small" @click="reviseRole(scope.row.id)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除" placement="top">
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteRole(scope.row.id)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="分配权限" placement="top">
                    <el-button type="warning" icon="el-icon-setting" size="small" @click="showRights(scope.row)"></el-button>
                </el-tooltip>
            </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="30%"
        @close="addDialogClosed">
        <span>
            <el-form ref="addRoleFormRef" :model="addRoleForm" :rules="addRoleRule" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="addRoleForm.Desc"></el-input>
                </el-form-item>
            </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="confirmAdd">确 定</el-button>
        </span>
      </el-dialog>

        <!-- 编辑角色对话框 -->
      <el-dialog
        title="编辑角色"
        :visible.sync="reviseDialogVisible"
        width="30%"
        @close="reviseDialogClosed">
        <span>
            <el-form ref="reviseRoleFormRef" :model="reviseRoleForm" label-width="80px">
                <el-form-item label="角色名称">
                    <el-input v-model="reviseRoleForm.roleName" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="reviseRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="reviseDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="confirmRevise">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 权限分配对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightsDialogVisible"
        width="30%"
        @close="setRightsClosed">
        <span>
          <el-tree :data="rightsList" :props="treeProps" node-key="id" default-expand-all :default-checked-keys="defKeys" show-checkbox ref="treeRef">
          </el-tree>
        </span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightsDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="confirmRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      addDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRule: {
        roleName: [
          { required: true, message: '请输入橘色名称', trigger: 'blur' }
        ]
      },
      reviseDialogVisible: false,
      reviseRoleForm: {},
      setRightsDialogVisible: false,
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 分配权限选中的节点ID
      defKeys: [],
      // 分配角色的ID
      roleId: ''
    }
  },
  methods: {
    async initRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      console.log(res.data)
      this.rolesList = res.data
    },
    addDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    confirmAdd () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        this.initRolesList()
      })
      this.addDialogVisible = false
    },
    reviseDialogClosed () {
      this.$refs.reviseRoleFormRef.resetFields()
    },
    async reviseRole (id) {
      this.reviseDialogVisible = true
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取该角色信息失败')
      this.reviseRoleForm = res.data
    },
    confirmRevise () {
      this.$refs.reviseRoleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`roles/${this.reviseRoleForm.roleId}`, this.reviseRoleForm)
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        this.$message.success('修改角色成功')
        this.initRolesList()
      })
      this.reviseDialogVisible = false
    },
    deleteRole (id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败')
        this.$message.success('删除角色成功')
        this.initRolesList()
      }).catch(() => {
        this.$message.info('已取消删除 ')
      })
    },
    removeRightById (role, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败')
        this.$message.success('删除权限成功')
        // this.initRolesList()刷新会导致关闭
        role.children = res.data
      }).catch(() => {
        this.$message.error('已取消删除')
      })
    },
    async showRights (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rightsList = res.data
      this.initLeafKeys(role, this.defKeys)
      this.setRightsDialogVisible = true
    },
    initLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.initLeafKeys(item, arr)
      })
    },
    setRightsClosed () {
      this.defKeys = []
    },
    // 确认分配角色按钮
    async confirmRights () {
      this.setRightsDialogVisible = false
      // 被选中的节点和半选中的节点
      const key = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = key.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.initRolesList()
    }
  },
  created () {
    this.initRolesList()
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .lineTop {
    border-top: 1px solid #ccc;
  }
  .lineBottom {
    border-bottom: 1px solid #ccc;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
