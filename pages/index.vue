<template>
  <div class="ThreeContainer">
    <PointCloud />
    <RegisterClient />
    <v-snackbar
      v-model="io.show"
      left
      bottom
      flat
      dense
      :color="io.connected ? 'success' : 'warning'"
      outlined
      timeout="1500"
    >
      {{ io.text }}
    </v-snackbar>
  </div>
</template>
<script>
export default {
  data () {
    return {
      io: {
        show: false,
        connected: false,
        text: ''
      }
    }
  },
  computed: {
    connected () {
      return this.$store.state.connected
      // Or return basket.getters.fruitsCount
      // (depends on your design decisions).
    }
  },
  watch: {
    connected (state) {
      console.log(state)
      if (state) {
        this.io.connected = true
        this.io.show = true
        this.io.text = 'Sockets connected'
      } else {
        this.io.connected = false
        this.io.show = true
        this.io.text = 'Sockets disconnected'
      }
    }
  },
  mounted () {
    this.socket = this.$nuxtSocket({
      withCredentials: true // nuxt-socket-io opts:
    })

    // x8WIv7-mJelg7on_ALbx});
    /* Listen for events: */
    // this.socket.on('connect', (socket) => {
    //   this.io.text = 'Sockets connected: ' + this.socket.id
    //   this.io.show = true
    //   this.io.connected = true
    // })
  }
}
</script>
