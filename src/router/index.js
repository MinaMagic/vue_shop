import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '@/components/Login'
// import Home from '@/components/Home'
// import Welcome from '@/components/Welcome'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '@/components/Login')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '@/components/Home')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '@/components/Welcome')

// import Users from '@/components/Users'
// import Rights from '@/components/power/Rights'
// import Roles from '@/components/power/Roles'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/Users')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/power/Rights')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/power/Roles')

// import Cate from '@/components/Goods/Cate'
// import Params from '@/components/Goods/Params'
// import GoodsList from '@/components/Goods/List'
// import Add from '@/components/Goods/Add'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '@/components/Goods/Cate')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '@/components/Goods/Params')

const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ '@/components/Goods/List')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '@/components/Goods/Add')

// import Order from '@/components/Order/Order'
// import Report from '@/components/Report/Report'
const Order = () => import(/* webpackChunkName: "Order" */ '@/components/Order/Order')
const Report = () => import(/* webpackChunkName: "Report" */ '@/components/Report/Report')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    children: [
      { path: '', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
