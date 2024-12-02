import { defineStore } from 'pinia'

export const userStore = defineStore(
  'user',
  () => {
    const userInfo = ref<Record<string, any>>({
      userId: '',
      userName: '',
      token: '',
      refreshToken: '',
    })
    /**
     * @description 设置用户信息
     */
    const setUserInfo = (data: any) => {
      Object.assign(userInfo.value, data)
    }
    /**
     * @description 清空用户信息
     */
    const logout = () => {
      userInfo.value = {
        userId: '',
        userName: '',
        token: '',
        refreshToken: '',
      }
    }
    //暴露一个是否登录的状态
    const isLogin = computed(() => {
      return userInfo.value.userId !== ''
    })
    return {
      userInfo,
      logout,
      setUserInfo,
      isLogin,
    }
  },
  {
    persist: {
      key: '_appChatSetting',
      storage: localStorage,
      pick: ['userInfo'],
    },
  },
)
