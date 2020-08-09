<template>
    <div>
         <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card class="box-card">
            <!-- 添加 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table border stripe :data="rolesList" style="width: 100%">
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom','vcenter', index1 === 0 ? 'bdtop' : '']" v-for="(item1, index1) in scope.row.children" :key="index1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- for循环渲染二级权限 -->
                                <el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item1.children" :key="index2.id">
                                    <!-- 二级 -->
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级 -->
                                    <el-col  :span="18">
                                        <el-tag v-for="(item3, index3) in item2.children" :key="index3.id" type="warning" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>

                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 修改 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <!-- 删除 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeroleById(scope.row.id)">删除</el-button>
                        <!-- 分配 -->
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" ref="addFormRef" label-width="70px">
                <el-form-item label="角色名" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <div slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 修改用户对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="editForm" ref="editFormRef" label-width="70px">
                <el-form-item label="角色名" prop="roleName">
                    <el-input disabled v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <div slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="rolesDialogVisible" width="50%"  @close="setRightDialogClosed">
            <!-- 内容主体区域 -->
            <el-tree
              show-checkbox
              node-key="id"
              default-expand-all
              :default-checked-keys="defKeys"
              :data="rightslist"
              :props="treeProps"
              ref="treeRef">
              <span slot="footer" class="dialog-footer"></span>
            </el-tree>
            <!-- 底部区域 -->
            <div slot="footer" class="dialog-footer">
                <el-button @click="rolesDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
export default {
  data () {
    return {
      // 添加用户的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改用户的表单数据
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      // 控制用户对话框的显示隐藏
      addDialogVisible: false,
      // 控制用户对话框的显示隐藏
      editDialogVisible: false,
      // 控制权限对话框的显示隐藏
      rolesDialogVisible: false,
      // 三层角色列表
      rolesList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      rightslist: [],
      defKeys: [],
      // 当前即将分配权限的id
      roleId: ''
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    // 监听添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 添加按钮，添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('用户添加失败!')
        }
        this.$message.success('用户添加成功!')
        // 隐藏对话框
        this.addDialogVisible = false
        // 刷新
        this.getRightsList()
      })
    },
    // 修改按钮
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          this.$message.error('用户修改失败!')
        }
        this.$message.success('用户修改成功!')
        // 隐藏对话框
        this.editDialogVisible = false
        // 刷新
        this.getRightsList()
      })
    },
    // 修改表单的验证规则对象
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 获取列表数据
    async getRightsList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表获取失败!')
      }
      this.rolesList = res.data
    },

    // 删除权限
    // 弹框提示用户是否删除
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      this.$message.success('权限删除成功!')
      // 刷新
      //   this.getRightsList() // 页面完整渲染
      role.children = res.data
    },

    // 删除角色
    async removeroleById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('用户删除成功!')
      // 刷新
      this.getRightsList()
    },

    // 展示权限对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      this.rolesDialogVisible = true
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.getLeafKeys(role, this.defKeys)
      this.rightslist = res.data
      // console.log(this.rightslist)
    },

    // 递归获取三级权限id
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      // this.defKeys = arr
      node.children.forEach(item =>
        this.getLeafKeys(item, arr)
      )
    },

    // 监听权限对话框对话事件
    setRightDialogClosed () {
      this.defKeys = []
    },

    // 分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRightsList()
      this.rolesDialogVisible = false
    }

  }
}
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>
