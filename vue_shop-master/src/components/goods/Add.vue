<template>
    <div>
       <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="box-card">
            <el-alert
              title="消息提示的文案"
              type="info"
              show-icon
              :closable="false">
            </el-alert>

            <el-steps :space="200" :active="activeIndex - 0" align-center finish-status="success">
              <el-step title="基本信息"></el-step>
              <el-step title="商品参数"></el-step>
              <el-step title="商品属性"></el-step>
              <el-step title="商品图片"></el-step>
              <el-step title="商品内容"></el-step>
              <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
              <el-tabs :before-leave="beforeTabLeave" v-model="activeIndex" :tab-position="'left'" @tab-click="tabClicked">

                <!-- 基本信息 -->
                <el-tab-pane label="基本信息" name='0'>

                  <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="addForm.goods_name"></el-input>
                  </el-form-item>
                  <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="addForm.goods_price" type="number"></el-input>
                  </el-form-item>
                  <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="addForm.goods_weight" type="number"></el-input>
                  </el-form-item>
                  <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="addForm.goods_number" type="number"></el-input>
                  </el-form-item>
                  <el-form-item label="商品分类" prop="goods_cat">
                    <el-cascader
                      v-model="addForm.goods_cat"
                      :options="catelist"
                      expand-trigger="hover"
                      :props="cateProps"
                      @change="handleChange">
                    </el-cascader>
                  </el-form-item>

                </el-tab-pane>

                <!-- 商品参数 -->
                <el-tab-pane label="商品参数" name='1'>
                  <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                    <!-- 循环渲染checkbox -->
                    <el-checkbox-group v-model="item.attr_vals">
                      <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                    </el-checkbox-group>

                  </el-form-item>
                </el-tab-pane>

                <el-tab-pane label="商品属性" name='2'>
                   <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                    <!-- 循环渲染checkbox -->
                    <el-input v-model="item.attr_vals">
                      <!-- <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox> -->
                    </el-input>

                  </el-form-item>
                </el-tab-pane>

                <el-tab-pane label="商品图片" name='3'>
                    <!-- action图片上传的地址 -->
                  <el-upload
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

                <el-tab-pane label="商品内容" name='4'>
                  <quill-editor
                    ref="myQuillEditor"
                    v-model="addForm.goods_introduce"

                  />
                  <el-button class="btnAdd" type="primary" @click="add">添加商品</el-button>
                </el-tab-pane>

              </el-tabs>
            </el-form>

        </el-card>

        <!-- 图片预览 -->
        <el-dialog
          title="图片预览"
          :visible.sync="previewVisible"
          width="50%">
         <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>

    </div>
</template>

<script>

// 213
import _ from 'lodash'

export default {
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品详情
        goods_introduce: '',
        attrs: []
      },
      // 做验证
      addFormRules: {
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
      catelist: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },

      // 动态参数列表数据
      manyTableData: [],
      // 静态参数列表数据
      onlyTableData: [],

      //  图片上传地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },

      previewPath: '',

      previewVisible: false

    }
  },
  created () {
    this.getCateList()
  },
  methods: {

    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类数据获取失败!')
      }
      // this.$message.success('商品分类数据获取成功!')
      this.catelist = res.data
      // console.log(this.catelist)
    },

    // 级联选择器
    handleChange () {
      // console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },

    // 切换面板题条件
    beforeTabLeave (activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },

    // 点击
    async tabClicked () {
      // console.log(this.activeIndex)

      // 访问动态参数面板时
      if (this.activeIndex === '1') {
      // 访问动态参数面板时
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('动态参数列表获取失败!')
        }
        // console.log(res.data)
        res.data.forEach(item => {
          // eslint-disable-next-line no-unused-expressions
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
      // 访问静态参数面板时
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('静态属性获取失败!')
        }
        // console.log(res.data)
        this.onlyTableData = res.data
      }
    },

    // 图片预览事件
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },

    // 移除图片事件
    handleRemove (file) {
      // 图片路径
      const filePath = file.response.data.tmp_path
      // 找到图片对象索引值
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath
      )
      this.addForm.pics.splice(1, i)
    },

    handleSuccess (response) {
      // 拼接图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm.pics)
    },

    // 添加商品
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 添加业务逻辑
        // lodash  cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', form)
        console.log(res.meta)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功!')
        this.$router.push('goods')
      })
    }

  },

  computed: {

    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }

  }
}
</script>

<style lang="less" scoped>

.el-alert{
  display: flex;
  justify-content: center;
}
.el-steps{
  margin: 30px 0;
}
.el-checkbox{
  margin: 0 5px 0 0 !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}

</style>
