import axios from 'axios'
import JSSoup from 'jssoup'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekday)

const contribution = {
  namespaced: true,
  state: () => ({
    contributionList: [],
    contributionListRanged: [],
    userListOrderedByRank: [],
    rankType: 'frequencyFirst',
    dates: [],
  }),
  getters: {
    storedContributionList(state) {
      return state.contributionList
    },
    storedContributionListRanged(state) {
      return state.contributionListRanged
    },
    githubIdFromUserListOrderedByRank(state) {
      return state.userListOrderedByRank.map((v) => v.githubId)
    },
    graphOption(state, getters, rootState) {
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
            color: ['#D9BF77', '#81B214', '#477946', '#2B580C', '#1C4A1B'],
          },
        },
        xAxis: {
          type: 'category',
          data: state.dates,
          position: 'top',
          axisLabel: {
            fontFamily: 'GmarketSansLight',
          },
        },
        grid: {
          left: '0%',
          right: '0%',
          top: 80,
        },
        yAxis: {
          type: 'category',
          data: getters.githubIdFromUserListOrderedByRank,
          axisLabel: {
            color: '#ffffff',
            inside: true,
            fontFamily: 'GmarketSansMedium',
            fontSize: '20',
            padding: [75, 0, 0, 0],
            textShadowColor: '#000000',
            textShadowBlur: 10,
          },
          zlevel: 10,
        },
        series: [
          {
            type: 'heatmap',
            data: getters.storedContributionListRanged
              .filter((item) => state.dates.includes(item.dataDate))
              .map((item) => {
                return {
                  value: [
                    state.dates.indexOf(item.dataDate),
                    getters.githubIdFromUserListOrderedByRank.indexOf(
                      item.githubId
                    ),
                    item.dataCount,
                  ],
                }
              }),
            label: {
              show: true,
              textStyle: {
                fontFamily: 'GmarketSansMedium',
                fontSize: 20,
                borderWidth: 1,
              },
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0)',
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
    initContributionRanged(state) {
      state.contributionListRanged = []
    },
    initUserListOrderedByRank(state) {
      state.userListOrderedByRank = []
    },
    addContribution(state, payload) {
      state.contributionList.push(...payload)
    },
    addContributionRanged(state, payload) {
      state.contributionListRanged.push(...payload)
    },
    setRankType(state, payload) {
      state.rankType = payload
    },
    setUserListOrderedByRank(state, payload) {
      state.userListOrderedByRank = payload
    },
    setDates(state, payload) {
      state.dates = payload
    },
  },
  actions: {
    rangeContributionListRanged({ state, commit, dispatch }, payload) {
      commit('initContributionRanged')
      commit('initUserListOrderedByRank')
      commit('setDates', payload)
      dispatch('setContributionRanged')
      dispatch('sortUsersByRankType')
    },
    setDatesThisWeek({ state, commit }) {
      const dates = []
      const d = dayjs()
      d.tz('Asia/Seoul')
      const day = d.weekday()
      const diff = d.date() - day + (day === 0 ? -6 : 1)
      const startDay = dayjs().date(diff)
      startDay.tz('Asia/Seoul')
      for (let i = 0; i < 7; i++) {
        const nextDay = dayjs().date(startDay.date() + i)
        dates.push(nextDay.format('YYYY-MM-DD'))
      }
      commit('setDates', dates)
    },
    setContributionRanged({ state, commit }) {
      commit(
        'addContributionRanged',
        state.contributionList.filter((c) => {
          return state.dates.includes(c.dataDate)
        })
      )
    },
    sortUsersByRankType({ state, commit, rootGetters }) {
      const userList = rootGetters['user/storedUserList']
      const userListOrderedByRank = userList.map((user) => {
        const contributionListRangedFiltered = state.contributionListRanged.filter(
          function isEqualId(contribution) {
            return contribution.githubId === user
          }
        )
        return {
          githubId: user,
          dayCount: contributionListRangedFiltered.reduce((prev, next) => {
            return prev + (next.dataCount > 0 ? 1 : 0)
          }, 0),
          totalCount: contributionListRangedFiltered.reduce((prev, next) => {
            return prev + next.dataCount
          }, 0),
        }
      })
      userListOrderedByRank.sort((a, b) => {
        if (state.rankType === 'frequencyFirst') {
          if (a.dayCount > b.dayCount) return 1
          else if (a.totalCount > b.totalCount) return 1
          else return -1
        } else if (state.rankType === 'amountFirst') {
          if (a.totalCount > b.totalCount) return 1
          else if (a.dayCount > b.dayCount) return 1
          else return -1
        }
      })
      commit('setUserListOrderedByRank', userListOrderedByRank)
    },
    async fetchContributions({ state, commit, rootGetters, dispatch }) {
      commit('initContribution')
      commit('initUserListOrderedByRank')
      const userList = rootGetters['user/storedUserList']
      const promises = userList.map(async (user) => {
        const url = '/github/users/' + user + '/contributions'
        try {
          const res = await axios.get(url)
          const soup = new JSSoup(res.data)
          const payload = soup
            .findAll('rect')
            .filter((rect) => rect.attrs.class === 'day')
            .map((rect) => {
              return {
                githubId: user,
                dataCount: parseInt(rect.attrs['data-count']),
                dataDate: rect.attrs['data-date'],
              }
            })
          commit('addContribution', payload)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }
      })
      await Promise.all(promises)
      dispatch('setDatesThisWeek')
      dispatch('setContributionRanged')
      dispatch('sortUsersByRankType')
    },
  },
}

export default contribution
