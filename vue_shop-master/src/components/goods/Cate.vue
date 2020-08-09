<template>
    <div>
         <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

         <!-- 卡片视图 -->
        <el-card class="box-card">
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-button type="primary" @click="showAddCateDialog">新增分类</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表 -->
            <tree-table
            :data="catelist"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            show-index
            index-text="#"
            :show-row-hover="false"
            border>
            <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
                    <i class="el-icon-error" v-else style="color: red;"></i>
                </template>
                 <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt">
                    <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页 -->
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">

                </el-pagination>

        </el-card>

        <!-- 新增分类对话框 -->
        <el-dialog title="新增分类" :visible.sync="addDialogVisible" width="50%" @close="addCateDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateRef" label-width="90px">
                <el-form-item label="新增分类" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options指定数据源 -->
                    <el-cascader expand-trigger="hover" :options="prentCateList" :props="cascaderProps" v-model="slelectedKeys" @change="parentCateChanged" clearable change-on-select></el-cascader>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <div slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      catelist: [],
      //   列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      prentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数据
      slelectedKeys: []
    }
  },
  created () {
    this.getCatelist()
  },
  methods: {
    // 获取商品分类
    async getCatelist () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分类查询失败!')
      }
      // console.log(res)
      this.catelist = res.data.result
      this.total = res.data.total
    },

    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatelist()
    },

    // 监听 页码值改变的事件
    handleCurrentChange (newpage) {
    //   console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getCatelist()
    },

    showAddCateDialog () {
      this.addDialogVisible = true
      this.getParentCateList()
    },

    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类失败')
      }
      // console.log(res.data)
      this.prentCateList = res.data
    },

    parentCateChanged () {
      console.log(this.slelectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0 证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.slelectedKeys.length > 0) {
        //  父级分类id
        this.addCateForm.cat_pid = this.slelectedKeys[
          this.slelectedKeys.length - 1
        ]
        // 为当前等级的分类赋值
        this.addCateForm.cat_level = this.slelectedKeys.length
        // return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮
    addCate () {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加父级分类失败')
        }
        // console.log(res.data)
        this.$message.success('添加父级分类成功')
        this.getCatelist()
        this.addDialogVisible = false
      })
    },
    addCateDialogClosed () {
      this.$refs.addCateRef.resetFields()
      this.slelectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
    .el-button{
        margin-bottom: 20px;
    }
</style>
