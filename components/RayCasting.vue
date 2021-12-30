<template>
  <client-only>
    <RaycastingComponent />
  </client-only>
</template>
<script>
export default {
  components: {
    RaycastingComponent: process.browser ? () => import('~/components/ThreeJSRaycasting.vue') : null
  }
}
</script>
