<template>
    <div>

         <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="box-card">
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <!-- 搜索 -->
                    <el-input
                     placeholder="请输入内容"
                     v-model="queryInfo.query"
                     clearable
                     @clear="getOrderslist">
                        <el-button slot="append" icon="el-icon-search" circle @click="getOrderslist"></el-button>
                    </el-input>

                </el-col>
            </el-row>

            <!-- 列表 -->
            <el-table :data="orderslist"  border stripe>
                <el-table-column type="index" width="50" label="#"></el-table-column>
                <el-table-column prop="order_number" width="450px" label="订单编号"></el-table-column>
                <el-table-column prop="order_price" label="订单价格"></el-table-column>
                <el-table-column label="是否付款">
                    <template v-slot="scope">
                        <div>
                            <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
                            <el-tag type="success" v-else>已付款</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货"></el-table-column>
                <el-table-column label="下单时间" width="180px">
                    <template v-slot="scope">
                            {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                   <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                   <el-button type="success" size="mini" icon="el-icon-map-location" @click="showProgressBox"></el-button>
                </el-table-column>
            </el-table>

            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5,  10, 15]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">

            </el-pagination>

        </el-card>

        <!-- 消息提示 -->
        <el-dialog
            title="提示"
            :visible.sync="addressVisible"
            @close="addressDialogClosed">
           <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区县" prop="address1">
                    <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
           </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流 -->
        <el-dialog
            title="物流进度"
            :visible.sync="progressVisible"
            width="30%">
            <el-timeline>
                <el-timeline-item
                v-for="(activity, index) in progressInfo"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
            <span slot="footer" class="dialog-footer">
                <el-button @click="progressVisible = false">取 消</el-button>
                <el-button type="primary" @click="progressVisible = false">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
import cityData from './citydata'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderslist: [],
      total: 0,
      addressVisible: false,

      addressForm: {
        address1: [],
        address2: ''
      },

      //  验证
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityData,

      progressVisible: false,

      progressInfo: []
    }
  },
  created () {
    this.getOrderslist()
  },
  methods: {
    //  渲染列表
    async getOrderslist () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('订单数据列表获取失败！')
      }
      // this.$message.success('订单数据列表获取成功！')
      this.orderslist = res.data.goods
      this.total = res.data.total
    //   console.log(this.orderslist)
    },

    // 分页
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderslist()
    },

    // 分页
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderslist()
    },

    // 省市联动
    showBox () {
      this.addressVisible = true
    },

    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },

    async showProgressBox () {
      const ips = '804909574412544580'
      const { data: res } = await this.$http.get('/kuaidi/' + ips)
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败')
      }
      this.progressInfo = res.data
      this.progressVisible = true
    //   console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader{
    width: 60%;
}
</style>
