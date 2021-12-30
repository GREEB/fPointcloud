<template>
  <div />
</template>
<script>
export default {
  computed: {
    connected () {
      return this.$store.state.connected
    }
  },
  watch: {
    connected (state) {
      if (state) {
        this.$toast.success('Socket connected')
      } else {
        this.$toast.error('Socket disconnected')
      }
    }
  },
  mounted () {
    this.socket = this.$nuxtSocket({
      withCredentials: true,
      extraHeaders: {
        path: this.$nuxt.$route.path
      }
    })
  }
}
</script>
