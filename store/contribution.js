import axios from 'axios'
import JSSoup from 'jssoup'

const contribution = {
  namespaced: true,
  state: () => ({
    contributionList: [],
  }),
  getters: {
    storedContributionList(state) {
      return state.contributionList
    },
    graphOption(state, getters, rootState) {
      const userList = rootState.user.userList
      const days = []
      const d = new Date()
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const startDay = new Date(d.setDate(diff))
      for (let i = 0; i < 7; i++) {
        startDay.setDate(startDay.getDate() + 1)
        days.push(startDay.toISOString().substring(0, 10))
      }
      return {
        tooltip: {},
        visualMap: {
          min: 0,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          top: '0%',
          textStyle: {
            fontFamily: 'GmarketSansLight',
          },
          inRange: {
            color: ['#EBEDF0', '#9BE9A8', '#40C463', '#30A14E', '#216E39'],
          },
        },
        xAxis: {
          type: 'category',
          data: days,
          position: 'top',
          axisLabel: {
            fontFamily: 'GmarketSansLight',
          },
        },
        grid: {
          left: '25%',
          right: '0%',
          top: 80,
        },
        yAxis: {
          type: 'category',
          data: rootState.user.userList,
          axisLabel: {
            fontFamily: 'GmarketSansMedium',
            fontSize: '20',
          },
        },
        series: [
          {
            type: 'heatmap',
            data: getters.storedContributionList
              .filter((item) => days.includes(item.dataDate))
              .map((item) => {
                return {
                  value: [
                    days.indexOf(item.dataDate),
                    userList.indexOf(item.githubId),
                    item.dataCount,
                  ],
                }
              }),
            label: {
              show: true,
              textStyle: {
                fontFamily: 'GmarketSansMedium',
                fontSize: 16,
                borderWidth: 1,
              },
            },
            emphasis: {
              label: {
                textStyle: {
                  fontFamily: 'GmarketSansMedium',
                  fontSize: 20,
                  color: '#900',
                },
              },
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
    },
  },
  mutations: {
    initContribution(state) {
      state.contributionList = []
    },
    addContribution(state, payload) {
      state.contributionList.push(...payload)
    },
  },
  actions: {
    fetchContributions({ commit, rootGetters }) {
      commit('initContribution')
      const userList = rootGetters['user/storedUserList']
      userList.forEach((user) => {
        const url = '/github/users/' + user + '/contributions'
        axios
          .get(url)
          .then((res) => {
            const soup = new JSSoup(res.data)
            commit(
              'addContribution',
              soup.findAll('rect', 'day').map((rect) => {
                return {
                  githubId: user,
                  dataCount: parseInt(rect.attrs['data-count']),
                  dataDate: rect.attrs['data-date'],
                }
              })
            )
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(err)
          })
      })
    },
  },
}

export default contribution
