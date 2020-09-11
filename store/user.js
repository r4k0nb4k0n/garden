const user = {
  namespaced: true,
  state: () => ({
    userList: [],
  }),
  getters: {
    storedUserList(state) {
      return state.userList
    },
  },
  mutations: {
    initUser(state) {
      state.userList = []
    },
    addUser(state, payload) {
      state.userList.push(payload)
    },
  },
  actions: {
    fetchUsers({ commit }) {
      commit('initUser')
      const users = [
        'r4k0nb4k0n',
        'beeetea',
        'Dormarble',
        'iknoom',
        'iwanhae',
        'presentnine',
        'TheShooter',
        'gmldms784',
        'Marades',
        'K4N9',
        'ggjae',
        'sanghoho',
        'qlqhqo2341',
        'LittleSamakFox',
        'gunhoflash',
        'lsh3163',
      ]
      users.forEach((user) => {
        commit('addUser', user)
      })
    },
  },
}

export default user
