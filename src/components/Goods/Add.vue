<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 提醒区域 -->
      <el-alert
        title="添加商品信息"
        center
        show-icon
        type="info">
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :active="+active" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 填写数据区域 -->
      <el-form :model="addGoodsForm" :rules="addGoodsRules" ref="addGoodsRef" label-width="100px" label-position="top" class="demo-ruleForm">
        <el-tabs tab-position="left"
        :before-leave="beforeTabLeave" v-model="active">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                  v-model="addGoodsForm.goods_cat"
                  :options="cateList"
                  :props="goodProps"
                  clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTabletList" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item2" v-for="(item2,i) in item.attr_vals" :key="i" border size="small"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabletList" :key="item.attr_id">
              <el-input v-model="item.attr_name"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="30%">
      <span>
        <img :src="previewURL" alt="" style="width: 100%">
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="previewDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 当前完成的步骤
      active: 0,
      addGoodsForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: '',
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品数据的规则
      addGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 选择商品分类对象设置
      goodProps: {
        children: 'children',
        label: 'cat_name',
        value: 'cat_id'
      },
      // 选择的商品动态参数列表
      manyTabletList: [],
      // 选择的商品静态属性列表
      onlyTabletList: [],
      // 上传图片的地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传数据请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 需要预览的图片URL
      previewURL: '',
      // 预览图片对话框显示与隐藏
      previewDialogVisible: false
    }
  },
  methods: {
    // 获取商品分类列表
    async initCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },
    // 切换Tab-pane标签前
    beforeTabLeave (activeName, oldActiveName) {
      if (activeName === '0' || this.addGoodsForm.goods_cat.length === 3) {
        if (activeName === '1') {
          this.initParamsList('many')
        } else if (activeName === '2') {
          this.initParamsList('only')
        }
        return true
      } else {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 获取商品参数列表
    async initParamsList (selectSel) {
      const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: selectSel } })
      if (res.meta.status !== 200) return this.$message.error('获取商品参数失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
      })
      if (selectSel === 'many') {
        this.manyTabletList = res.data
      } else {
        this.onlyTabletList = res.data
      }
    },
    // 监听上传图片成功事件
    handleSuccess (response) {
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addGoodsForm.pics.push(picInfo)
    },
    // 监听移除图片成功事件
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      this.addGoodsForm.pics = this.addGoodsForm.pics.filter(item => item.pic !== filePath)
    },
    // 监听预览图片事件
    handlePreview (file) {
      this.previewURL = file.response.data.url
      this.previewDialogVisible = true
    },
    addGoods () {
      this.$refs.addGoodsRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        const newAddForm = JSON.parse(JSON.stringify(this.addGoodsForm))
        newAddForm.goods_cat = newAddForm.goods_cat.join(',')
        // 处理动态参数
        this.manyTabletList.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodsForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTabletList.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodsForm.attrs.push(newInfo)
        })
        newAddForm.attrs = this.addGoodsForm.attrs
        const { data: res } = await this.$http.post('goods', newAddForm)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateID () {
      return this.addGoodsForm.goods_cat[2]
    }
  },
  created () {
    this.initCateList()
  }
}
</script>

<style lang="less" scoped>
.btnAdd {
  margin-top: 10px;
}
</style>
