import Vue from 'vue'
import Router from 'vue-router'
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue')
// import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName:"user" */ '../components/user/Users.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName:"power" */ '../components/power/Rights.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName:"power" */ '../components/power/Roles.vue')
// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName:"goods" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName:"goods" */ '../components/goods/Params.vue')
// import Goods from '../components/goods/Goods.vue'
const Goods = () => import(/* webpackChunkName:"goods" */ '../components/goods/Goods.vue')
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName:"goods" */ '../components/goods/Add.vue')
// import Orders from '../components/orders/Orders.vue'
const Orders = () => import(/* webpackChunkName:"order" */ '../components/orders/Orders.vue')
// import Reports from '../components/reports/Reports.vue'
const Reports = () => import(/* webpackChunkName:"report" */ '../components/reports/Reports.vue')
// eslint-disable-next-line import/first
import '../assets/fonts/iconfont.css'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: Goods },
        { path: '/add', component: Add },
        { path: '/orders', component: Orders },
        { path: '/reports', component: Reports }
      ]
    }
  ]
})

// 为路由对象， 添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from代表从那个路径跳转而来
  // next是一个函数，表示放行
  // 如果用户访问的登陆页，直接放行
  if (to.path === '/login') return next()
  // 从sessionStorage 中获取到保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token，强制跳转到登陆页
  if (!tokenStr) return next('/login')
  next()
})

export default router
