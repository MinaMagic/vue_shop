<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
        <!-- 添加分类按钮 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 表格 -->
        <el-row>
            <el-table :data="cateList" border stripe :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="cat_id">
                <el-table-column type="index" label="#" width="50">
                </el-table-column>
                <el-table-column prop="cat_name" label="分类名称" width="200">
                </el-table-column>
                <el-table-column prop="" label="是否有效" width="200">
                  <template slot-scope="scope">
                    <i class="el-icon-success" style="color: lightseagreen" v-if="scope.row.cat_delete"></i>
                  <i class="el-icon-error" style="color: red" v-else></i>
                  </template>
                </el-table-column>
                <el-table-column label="排序" width="200">
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="cat_name" label="操作" width="200">
                  <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" content="编辑" placement="top">
                        <el-button type="primary" icon="el-icon-edit" size="small" @click="showReviseCate(scope.row.cat_id)"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="删除" placement="top">
                        <el-button type="danger" icon="el-icon-delete" size="small" @click="showDeleteWarn(scope.row.cat_id)"></el-button>
                    </el-tooltip>
                </template>
                </el-table-column>
            </el-table>
        </el-row>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="querInfo.pagenum"
          :page-sizes="[1,2,5,20]"
          :page-size="querInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="30%" @close="addCateClosed">
      <span>
        <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="selectCateKeys"
              :options="parentCateList"
              :props="cateProp"
              @change="parentCateChange"
              clearable=""></el-cascader>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReviseCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="reviseCateDialogVisible"
      width="30%" @close="reviseCateClosed">
      <span>
        <el-form :model="reviseCateForm" :rules="reviseCateRules" ref="reviseCateRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="reviseCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reviseCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReviseCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      // 添加分类对话框显示
      addCateDialogVisible: false,
      // 添加的分类
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: ''
      },
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      // 添加分类中选中的父级分类数组
      selectCateKeys: [],
      // 级联选择器配置对象
      cateProp: {
        value: 'cat_id',
        children: 'children',
        label: 'cat_name',
        checkStrictly: true
      },
      // 修改分类对话框显示
      reviseCateDialogVisible: false,
      reviseCateForm: {},
      reviseCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async initCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.initCateList()
    },
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.initCateList()
    },
    showAddCateDialog () {
      this.addCateDialogVisible = true
      this.initParentCateList()
    },
    async initParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类失败')
      this.parentCateList = res.data
    },
    parentCateChange () {
      if (this.selectCateKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectCateKeys[this.selectCateKeys.length - 1]
        this.addCateForm.cat_level = this.selectCateKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCateClosed () {
      this.$refs.addCateRef.resetFields()
      this.selectCateKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    confirmAddCate () {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.initCateList()
        this.addCateDialogVisible = false
      })
    },
    // 展示修改分类对话框
    async showReviseCate (id) {
      this.reviseCateDialogVisible = true
      // 根据ID查询分类信息
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取分类信息失败')
      this.reviseCateForm = res.data
    },
    confirmReviseCate () {
      this.$refs.reviseCateRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`categories/${this.reviseCateForm.cat_id}`, { cat_name: this.reviseCateForm.cat_name })
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改分类成功')
        this.initCateList()
        this.reviseCateDialogVisible = false
      })
    },
    reviseCateClosed () {
      this.$refs.reviseCateRef.resetFields()
    },
    showDeleteWarn (id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除分类失败')
        this.$message.success('删除成功')
        this.initCateList()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  },
  created () {
    this.initCateList()
  }
}
</script>

<style>

</style>
