<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon>
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加属性按钮 -->
          <el-button type="primary" size="small" :disabled="isDisable" @click="showAddParamsDialog">添加属性</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTabletList" stripe border style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="tag"
                  v-for="tag in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(tag, scope.row)">
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.addValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ NewTag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="编辑" placement="top">
                    <el-button type="primary" icon="el-icon-edit" size="small" @click="showReviseParamsDialog(scope.row.attr_id)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除" placement="top">
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="showDeleteWarn(scope.row.attr_id)"></el-button>
                </el-tooltip>
            </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button type="primary" size="small" :disabled="isDisable" @click="showAddParamsDialog">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTabletList" stripe border style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="tag"
                  v-for="tag in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(tag,scope.row)">
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.addValue"
                  ref="saveTagInputRef"
                  size="small" autofocus
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ NewTag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="编辑" placement="top">
                    <el-button type="primary" icon="el-icon-edit" size="small" @click="showReviseParamsDialog(scope.row.attr_id)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除" placement="top">
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="showDeleteWarn(scope.row.attr_id)"></el-button>
                </el-tooltip>
            </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
    </el-tabs>
      <div class="line"></div>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addParamsDialogVisible"
      width="30%" @close="addParamsClosed">
      <span>
        <el-form :model="addParamsForm" :rules="addParamsRules" ref="addParamsRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="reviseParamsDialogVisible"
      width="30%" @close="reviseDialogClosed">
      <span>
        <el-form :model="reviseParamsForm" :rules="reviseParamsRules" ref="reviseParamsRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="reviseParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reviseParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReviseParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      // 选择分类配置对象
      cateProps: {
        children: 'children',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 选择的商品分类
      selectCateKeys: [],
      // 选择的标签页
      activeName: 'many',
      // 动态参数的数据
      manyTabletList: [],
      // 静态属性的数据
      onlyTabletList: [],
      // 添加参数对话框显示与隐藏
      addParamsDialogVisible: false,
      // 添加的参数列表
      addParamsForm: {
        attr_name: ''
      },
      addParamsRules: {
        attr_name: [
          { required: true, message: '请输入动态参数', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 修改参数对话框显示与隐藏
      reviseParamsDialogVisible: false,
      // 修改参数列表
      reviseParamsForm: {},
      reviseParamsRules: {
        attr_name: [
          { required: true, message: '请输入动态参数', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async initCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      this.cateList = res.data
    },
    // 选择商品分类发生变化
    handleChange () {
      this.initParamsList()
    },
    // 切换参数(动态/静态)
    handleClick () {
      this.initParamsList()
    },
    // 获取参数列表
    async initParamsList () {
      if (this.selectCateKeys.length === 3) {
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
          item.inputVisible = false
          item.addValue = ''
        })
        if (this.activeName === 'many') {
          this.manyTabletList = res.data
        } else {
          this.onlyTabletList = res.data
        }
      }
    },
    // 显示添加参数对话框
    showAddParamsDialog () {
      this.addParamsDialogVisible = true
    },
    // 关闭添加参数对话框
    addParamsClosed () {
      this.$refs.addParamsRef.resetFields()
    },
    // 确定添加参数
    confirmAddParams () {
      this.$refs.addParamsRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post(`categories/${this.cateID}/attributes`, { attr_sel: this.activeName, attr_name: this.addParamsForm.attr_name })
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.addParamsDialogVisible = false
        this.initParamsList()
      })
    },
    // 显示修改参数对话框
    async showReviseParamsDialog (id) {
      this.reviseParamsDialogVisible = true
      const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取信息失败')
      this.reviseParamsForm = res.data
    },
    reviseDialogClosed () {
      this.$refs.reviseParamsRef.resetFileds()
    },
    // 确定修改参数
    confirmReviseParams () {
      this.$refs.reviseParamsRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`categories/${this.cateID}/attributes/${this.reviseParamsForm.attr_id}`, { attr_name: this.reviseParamsForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        this.reviseParamsDialogVisible = false
        this.initParamsList()
      })
    },
    // 删除参数提醒
    showDeleteWarn (id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateID}/attributes/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.initParamsList()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 展示输入框添加标签
    showInput (paramsInfo) {
      paramsInfo.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInputRef.$refs.input.focus()
      })
    },
    // 删除标签
    handleClose (tag, paramsInfo) {
      paramsInfo.attr_vals.splice(paramsInfo.attr_vals.indexOf(tag), 1)
      this.changeTagList(paramsInfo)
    },
    // 标签输入完成
    async handleInputConfirm (paramsInfo) {
      paramsInfo.inputVisible = false
      if (paramsInfo.addValue.trim()) {
        paramsInfo.attr_vals.push(paramsInfo.addValue.trim())
        this.changeTagList(paramsInfo)
      } else {
        this.$message.error('标签不能为空')
      }
      paramsInfo.addValue = ''
    },
    async changeTagList (paramsInfo) {
      const newVals = paramsInfo.attr_vals.join(',')
      const { data: res } = await this.$http.put(`categories/${this.cateID}/attributes/${paramsInfo.attr_id}`, { attr_name: paramsInfo.attr_name, attr_sel: this.activeName, attr_vals: newVals })
      if (res.meta.status !== 200) return this.$message.error('添加失败')
      this.$message.success('添加成功')
    }
  },
  computed: {
    // 添加参数按钮
    isDisable () {
      if (this.selectCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 选中商品的ID
    cateID () {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2]
      } else {
        return null
      }
    },
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  created () {
    this.initCateList()
  }
}
</script>

<style lang="less" scoped>
  .el-cascader {
    margin: 10px 0;
  }
  .el-cascader .el-input {
    width: 400px;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
