<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 输入区域 -->
      <div slot="header" class="clearfix ">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input placeholder="请输入搜索内容" v-model="querInfo.query"
            clearable @clear="initGoodsList"><el-button slot="append" icon="el-icon-search" @click="initGoodsList"></el-button></el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="goAddPage">添加商品</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 商品信息 -->
      <el-table
        :data="goodsList"
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
          prop="goods_name"
          label="商品名称"
          width="500">
        </el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格(元)"
          width="120">
        </el-table-column>
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="100">
        </el-table-column>
        <el-table-column
          label="创建时间"
          width="180">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="140">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" content="编辑" placement="top"><el-button type="primary" icon="el-icon-edit" size="small" @click="showReviseGoodsDialog(scope.row.goods_id)"></el-button></el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除" placement="top"><el-button type="danger" icon="el-icon-delete" size="small" @click="deleteGoods(scope.row.goods_id)"></el-button></el-tooltip>
            </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5,10,15,20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        background
        :total="total">
      </el-pagination>

      <!-- 修改商品对话框 -->
      <el-dialog
        title="编辑商品"
        :visible.sync="reviseGoodsDialogVisible"
        width="30%" @close="reviseDialogClosed">
        <span>
          <el-form :model="reviseGoodsForm" :rules="reviseGoodsRules" ref="reviseGoodsRef" label-width="80px">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="reviseGoodsForm.goods_name" disabled></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="reviseGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="reviseGoodsForm.goods_weight"></el-input>
            </el-form-item>
          </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="reviseGoodsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmReviseGoods">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      goodsList: [],
      querInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 编辑商品对话框显示与隐藏
      reviseGoodsDialogVisible: false,
      // 修改的商品表单
      reviseGoodsForm: {},
      // 修改的商品表单规则
      reviseGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async initGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.querInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.initGoodsList()
    },
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.initGoodsList()
    },
    deleteGoods (id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除商品失败')
        this.initGoodsList()
        this.$message.success('删除商品成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    async showReviseGoodsDialog (id) {
      this.reviseGoodsDialogVisible = true
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败')
      this.reviseGoodsForm = res.data
    },
    // 确定编辑商品
    confirmReviseGoods () {
      this.$refs.reviseGoodsRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入必要的表单项')
        const { data: res } = await this.$http.put(`goods/${this.reviseGoodsForm.goods_id}`, this.reviseGoodsForm)
        if (res.meta.status !== 200) return this.$message.error('修改商品失败')
        this.$message.success('修改商品成功')
        this.initGoodsList()
      })
      this.reviseGoodsDialogVisible = false
    },
    // 关闭编辑对话框
    reviseDialogClosed () {
      this.$refs.reviseGoodsRef.resetFields()
    },
    goAddPage () {
      this.$router.push('/add')
    }
  },
  created () {
    this.initGoodsList()
  }
}
</script>

<style>

</style>
