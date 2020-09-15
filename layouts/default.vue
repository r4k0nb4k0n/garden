<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          nuxt
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      dark
      fixed
      shrink-on-scroll
      prominent
      src="grass-turf.jpg"
      :clipped-left="clipped"
    >
      <template v-slot:img="{ props }">
        <v-img
          v-bind="props"
          gradient="to top right, rgba(217, 191, 119, .5), rgba(28, 74, 27, .8)"
        ></v-img>
      </template>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-col class="pa-0 ma-0">
        <v-row>
          <v-col class="pa-1 ma-0">
            <v-select
              v-model="rankType"
              background-color="transparent"
              prepend-inner-icon="mdi-sort"
              :items="rankTypes"
              outlined
              dense
              @change="sortByRankType"
            ></v-select>
          </v-col>
          <v-col class="pa-1 ma-0">
            <v-dialog
              ref="dialog"
              v-model="modal"
              :return-value.sync="dates"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="dateRangeText"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  outlined
                  dense
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="dates" range>
                <v-spacer></v-spacer>
                <v-btn text color="warning" @click="modal = false">취소</v-btn>
                <v-btn color="primary" @click="rangeDates">확인</v-btn>
              </v-date-picker>
            </v-dialog>
          </v-col>
        </v-row>
      </v-col>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer fixed app>
      <span>&copy; {{ new Date().getFullYear() }} {{ footer }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekday)

export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      modal: false,
      dialog: false,
      dates: [],
      items: [
        {
          icon: 'mdi-view-dashboard',
          title: '대시보드',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: '만든 이',
          to: '/about',
        },
      ],
      rankType: 'frequencyFirst',
      rankTypes: [
        {
          text: '빈도 우선',
          value: 'frequencyFirst',
        },
        {
          text: '총량 우선',
          value: 'amountFirst',
        },
      ],
      miniVariant: false,
      title: '잔디 정원사',
      footer: 'DSC University of Seoul',
    }
  },
  computed: {
    dateRangeText() {
      return this.dates.join(' ~ ')
    },
  },
  async mounted() {
    this.$store.dispatch('user/fetchUsers')
    await this.$store.dispatch('contribution/fetchContributions')
    const d = dayjs()
    d.tz('Asia/Seoul')
    const day = d.weekday()
    const diff = d.date() - day + (day === 0 ? -6 : 1)
    const startDay = dayjs().date(diff)
    startDay.tz('Asia/Seoul')
    const endDay = dayjs().date(startDay.date() + 6)
    endDay.tz('Asia/Seoul')
    this.dates.push(startDay.format('YYYY-MM-DD'))
    this.dates.push(endDay.format('YYYY-MM-DD'))
  },
  methods: {
    sortByRankType() {
      this.$store.commit('contribution/setRankType', this.rankType)
      this.$store.dispatch('contribution/sortUsersByRankType')
    },
    rangeDates() {
      this.$refs.dialog.save(this.dates)
      if (this.dates[0].localeCompare(this.dates[1]) > 0) {
        const temp = this.dates[0]
        this.dates[0] = this.dates[1]
        this.dates[1] = temp
      }
      const rangedDates = []
      const d = dayjs()
      d.tz('Asia/Seoul')
      const startDay = dayjs(this.dates[0])
      const endDay = dayjs(this.dates[1])
      startDay.tz('Asia/Seoul')
      endDay.tz('Asia/Seoul')
      const diff = Math.abs(startDay.diff(endDay, 'day')) + 1
      for (let i = 0; i < diff; i++) {
        let nextDay = dayjs(startDay.format('YYYY-MM-DD'))
        nextDay = nextDay.add(i, 'day')
        rangedDates.push(nextDay.format('YYYY-MM-DD'))
      }
      this.$store.dispatch(
        'contribution/rangeContributionListRanged',
        rangedDates
      )
    },
  },
}
</script>
