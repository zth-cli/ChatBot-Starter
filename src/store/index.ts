/**
 * @description: 实例化pinia
 */
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(createPersistedState())
export default pinia
export * from './modules/useChatDB'
export * from './modules/chatStore'
export * from './modules/useToolStore'
export * from './modules/userStore'
