<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 输入区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="querInfo.query" clearable @close="initOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="initOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单信息 -->
      <el-table
        :data="orderList"
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
          prop="order_number"
          label="订单编号"
          width="500">
        </el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="60">
        </el-table-column>
        <el-table-column
          label="是否付款"
          width="100">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          width="60">
          <template slot-scope="scope">
            {{ scope.row.is_send }}
          </template>
        </el-table-column>
        <el-table-column
          label="下单时间"
          width="180">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="140">
            <template>
              <el-tooltip class="item" effect="dark" content="编辑" placement="top"><el-button type="primary" icon="el-icon-edit" size="small" @click="showReviseAddressDialog"></el-button></el-tooltip>
              <el-tooltip class="item" effect="dark" content="定位" placement="top"><el-button type="success" icon="el-icon-location" size="small" @click="showProgressDialog"></el-button></el-tooltip>
            </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
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
    </el-card>

    <!-- 修改商品对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="reviseAddressDialogVisible"
      width="30%" @close="reviseDialogClosed">
      <span>
        <el-form :model="reviseAddressForm" :rules="reviseAddressRules" ref="reviseAddressRef" label-width="100px">
          <el-form-item label="省区市/县" prop="address1">
            <el-cascader v-model="reviseAddressForm.address1" :options="cityData"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="reviseAddressForm.address2"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reviseAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="reviseAddressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看物流对话框 -->
    <el-dialog
      title="物料进度"
      :visible.sync="progressDialogVisible"
      width="30%">
      <span>
        <el-timeline :reverse="reverse">
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      orderList: [],
      querInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 修改地址对话框显示与隐藏
      reviseAddressDialogVisible: false,
      // 修改地址表单
      reviseAddressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单规则
      reviseAddressRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'change' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'change' }
        ]
      },
      cityData,
      // 查看物流对话框显示与隐藏
      progressDialogVisible: false,
      // 物流数据（因接口错误）
      progressInfo: [
        {
          time: '2022-05-10 09:39:00',
          ftime: '2022-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2022-05-10 08:23:00',
          ftime: '2022-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2022-05-10 07:32:00',
          ftime: '2022-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2022-05-10 02:03:00',
          ftime: '2022-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2022-05-09 23:05:00',
          ftime: '2022-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2022-05-09 21:21:00',
          ftime: '2022-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2022-05-09 13:07:00',
          ftime: '2022-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2022-05-09 12:25:03',
          ftime: '2022-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2022-05-09 12:22:24',
          ftime: '2022-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2022-05-08 21:36:04',
          ftime: '2022-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  methods: {
    async initOrdersList () {
      const { data: res } = await this.$http.get('orders', { params: this.querInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单信息失败')
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(res.data)
    },
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.initOrdersList()
    },
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.initOrdersList()
    },
    reviseDialogClosed () {
      this.$refs.reviseAddressRef.resetFields()
    },
    showReviseAddressDialog () {
      this.reviseAddressDialogVisible = true
    },
    showProgressDialog () {
      this.progressDialogVisible = true
    }
  },
  created () {
    this.initOrdersList()
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}

.el-timeline {
  padding: 0 20px;
}
</style>
