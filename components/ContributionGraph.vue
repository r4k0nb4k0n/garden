<template>
  <div>
    <v-style>
      <template v-slot:content>
        .echarts { width: 100%; height:
        {{ graphOption.yAxis.data.length * 100 + 100 + 'px;' }} }
      </template>
    </v-style>
    <v-chart
      v-if="isMounted"
      :options="graphOption"
      :autoresize="true"
    ></v-chart>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'

Vue.component('v-style', {
  render(createElement) {
    return createElement('style', this.$slots.content)
  },
})

export default {
  name: 'ContributionGraph',
  data() {
    return {
      isMounted: false,
    }
  },
  computed: {
    ...mapGetters({
      graphOption: 'contribution/graphOption',
    }),
  },
  mounted() {
    this.isMounted = true
  },
}
</script>
