export const getters = {
  isAuthenticated (state) {
    return state.auth.loggedIn // auth object as default will be added in vuex state, when you initialize nuxt auth
  },
  getUserInfo (state) {
    return state.auth.user
  }
}

export const state = () => ({
  connected: false,
  udpNew: false,
  game: ''
})

export const mutations = {
  SET_CONNECT (state) {
    console.log('SET_CONNECT')
    state.connected = true
  },
  SET_DISCONNECT (state) {
    console.log('SET_DISCONNECT')
    state.connected = false
  },
  SET_UDPREGISTER (state) {
    console.log('SET_UDPREGISTER')
    state.udpNew = true
  },
  SET_GAME (state, sel) {
    console.log('SET_GAME')
    state.game = sel
  }
}

export const actions = {
  CONNECT ({ commit }) {
    commit('SET_CONNECT')
  },
  DISCONNECT ({ commit }) {
    commit('SET_DISCONNECT')
  },
  UDPREGISTER ({ commit }, msg) {
    commit('SET_UDPREGISTER')
  },
  UDPSETGAME ({ commit }, msg) {
    commit('SET_GAME', msg)
  }
}
