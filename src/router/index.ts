import { setupLayouts } from 'virtual:generated-layouts'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import { createRouter, createWebHashHistory } from 'vue-router'
import LoadingComponent from './LoadingComponent.vue'

// 创建异步组件加载器
const asyncComponentLoader = (component: any) => {
  return defineAsyncComponent({
    loader: component,
    loadingComponent: LoadingComponent,
    // 展示加载组件前的延迟时间，默认为 200ms
    delay: 200,
    // 加载失败后展示的组件
    errorComponent: {
      template: '<div>加载失败，请刷新重试</div>',
    },
    // 超时时间，超时后显示错误组件
    timeout: 3000,
  })
}

// 处理路由配置
const processedRoutes = routes.map((route) => {
  if (route.path !== '/') {
    return {
      ...route,
      component: route.component ? asyncComponentLoader(route.component) : undefined,
    }
  }
  return route
})
const router = createRouter({
  history: createWebHashHistory(),
  routes: setupLayouts(processedRoutes),
  scrollBehavior(_to, from, savedPosition) {
    //  处理路由切换滚动行为
    return new Promise((resolve) => {
      if (savedPosition) {
        return savedPosition
      }
      if (from.meta.saveSrollTop) {
        const top: number = document.documentElement.scrollTop || document.body.scrollTop
        resolve({ left: 0, top })
      }
    })
  },
})
if (import.meta.hot) {
  handleHotUpdate(router)
}
export default router
