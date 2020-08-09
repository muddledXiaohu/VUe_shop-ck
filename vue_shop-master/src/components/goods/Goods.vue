<template>
    <div>
       <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="box-card">

            <el-row :gutter="20">
                <el-col class="cat_opt" :span="8">
                    <el-input
                        placeholder="请输入内容"
                        v-model="queryInfo.query"
                        clearable
                        @clear="getGoodslist">
                        <el-button slot="append" icon="el-icon-search" circle @click="getGoodslist"></el-button>
                    </el-input>
                </el-col>
                <el-col class="cat_opt" :span="5">
                        <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>

            </el-row>

            <el-table :data="goodslist" border stripe>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                    <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
                    <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
                    <el-table-column label="创建时间" width="140px">
                        <template v-slot="scope">
                            {{scope.row.add_time | dateFormat}}
                        </template>
                    </el-table-column>
                    <el-table-column width="130px" label="操作">
                        <template  v-slot="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                            <el-button  type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                        </template>
                    </el-table-column>
            </el-table>

                 <!-- 分页 -->
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
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodslist: [],
      total: 0
    }
  },

  created () {
    this.getGoodslist()
  },

  methods: {
    //  渲染商品列表
    async getGoodslist () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品列表获取失败!')
      }
      //  this.$message.success('商品列表获取成功!')
      this.goodslist = res.data.goods
      this.total = res.data.total
      // console.log(res.data.goods)
    },

    // 分页
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodslist()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodslist()
    },

    // 删除事件按钮
    async removeById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除改商品信息！', '是否删除？', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '放弃删除'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      // console.log(id)
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败!')
      }
      this.$message.success('删除商品成功!')
      this.getGoodslist()
    },

    // 添加按钮
    goAddpage () {
      this.$router.push('/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-table{
    margin-top: 20px;
}
</style>
