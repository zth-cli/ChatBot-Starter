import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
export const useResponsive = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  return {
    breakpoints,
    md: computed(() => unref(breakpoints.smallerOrEqual('md'))),
    lg: computed(() => unref(breakpoints.smallerOrEqual('lg'))),
    xl: computed(() => unref(breakpoints.smallerOrEqual('xl'))),
  }
}
