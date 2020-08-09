<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card class="box-card">
            <el-alert
                title="注意！只允许使用第三级分类设置相关参数"
                type="warning"
                :closable="false"
                show-icon>
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row>
                <el-col class="cat_opt">
                    <span>选择商品分类：</span>
                    <el-cascader
                    expand-trigger="hover"
                    v-model="seletedCateKeys"
                    :options="catelist"
                    :props="cateProps"
                    @change="handleChange"
                    style="width: 260px;">
                    </el-cascader>
                </el-col>

            </el-row>
             <el-tabs v-model="activeName" @tab-click="handleTabClick">
                    <!-- 添加动态参数面板 -->
                    <el-tab-pane label="动态参数" name="many">
                        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                        <!-- 动态参数表格 -->
                        <el-table :data="manyTabData" border stripe>

                          <!-- 展开行 -->
                          <el-table-column type="expand">
                            <template slot-scope="scope">
                              <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index, scope.row)">
                                {{item}}
                              </el-tag>
                              <!-- 输入的文本框 -->
                              <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                              >
                              </el-input>
                              <!-- 添加的按钮 -->
                              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>
                          </el-table-column>

                          <!-- 索引列 -->
                          <el-table-column type="index"></el-table-column>
                          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                          <el-table-column label="操作">
                            <template slot-scope="scope">
                              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                          </el-table-column>
                        </el-table>
                    </el-tab-pane>
                    <!-- 添加静态属性面板 -->
                    <el-tab-pane label="静态属性" name="only">
                        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                        <!-- 静态参数表格 -->
                        <el-table :data="onlyTabData" border stripe>
                          <!-- 展开行 -->
                          <el-table-column type="expand">

                            <template slot-scope="scope">
                              <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index, scope.row)">
                                {{item}}
                              </el-tag>
                              <!-- 输入的文本框 -->
                              <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                              >
                              </el-input>
                              <!-- 添加的按钮 -->
                              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>

                          </el-table-column>
                          <!-- 索引列 -->
                          <el-table-column type="index"></el-table-column>
                          <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                          <el-table-column label="操作">
                            <template slot-scope="scope">
                              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                          </el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
        </el-card>

        <!-- 添加参数对话框 -->
        <el-dialog
          :title="'添加' + titleText"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClosed">
          <!-- 添加参数的对话框 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 修改参数对话框 -->
        <el-dialog
          :title="'修改' + titleText"
          :visible.sync="editDialogVisible"
          width="50%"
          @close="editDialogClosed">
          <!-- 添加参数的对话框 -->
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
          </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      catelist: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框绑定到的数组
      seletedCateKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态属性的数据
      manyTabData: [],
      // 静态属性的数据
      onlyTabData: [],
      // 控制对话框显示隐藏
      addDialogVisible: false,
      // 添加参数的表单参数对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制对话框显示隐藏
      editDialogVisible: false,
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },

  created () {
    this.getCateList()
  },

  methods: {
    // 获取所有商品的分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      // console.log(res)
      // this.$message.success('获取商品分类成功!')
      this.catelist = res.data
    },

    // 级联选择框变化触发的函数
    handleChange () {
      this.getParamsData()
    },

    // tab 页签点击事件的处理函数
    handleTabClick () {
      // console.log(this.activeName)
      this.getParamsData()
    },

    // 获取参数的列表数据
    async getParamsData () {
      //  证明选中的不是三级分类
      if (this.seletedCateKeys.length !== 3) {
        this.seletedCateKeys = []
        this.manyTabData = []
        this.onlyTabData = []
        return
      }
      // 证明选中的是三级分类
      // console.log(this.seletedCateKeys)
      // 根据所选分类的id获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach(item => {
        // item.attr_vals = item.attr_vals.split(' ')
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // console.log(item.attr_vals)
        // 添加布尔值，控制单独的文本框显示隐藏
        item.inputVisible = false
        // 文本库输入的值
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
      // console.log(res.data)
    },

    // 监听对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数确定按钮
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功!')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },

    // 点击按钮展示修改对话框
    async showEditDialog (attrid) {
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分类查询失败!')
      }
      this.editForm = res.data
      // console.log(res)
      this.editDialogVisible = true
    },

    // 重置修改表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },

    // 点击按钮修改参数信息
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败!')
        }
        this.$message.success('修改参数成功!')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },

    // 删除事件
    async removeParams (attrid) {
      const confirmResule = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResule !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.$message.success('删除参数成功!')
      this.getParamsData()
    },

    // 文本框失去焦点或摁下enter都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求保存添加数据
      this.saveAttrVals(row)
    },

    // 将对 attr_vals的操作保存到数据库
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('添加操作失败!')
      }
      // this.$message.success('添加操作成功!')
    },

    // 点击按钮 展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 删除对应的参数可选项事件
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }

  },
  computed: {
    // 如果按钮需要被禁用，则返回true 否则返回folse
    isBtnDisabled () {
      if (this.seletedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.seletedCateKeys.length === 3) {
        return this.seletedCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
    margin: 15px 0;
}
.el-tag{
  margin: 10px;
}
.input-new-tag{
  width: 120px;
}
</style>
