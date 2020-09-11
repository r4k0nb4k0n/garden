<template>
  <v-chart :options="graphOption" :autoresize="true" :style="cssVars"></v-chart>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ContributionGraph',
  computed: {
    ...mapGetters({
      graphOption: 'contribution/graphOption',
    }),
    cssVars() {
      return {
        '--height': this.graphOption.yAxis.data.length * 100 + 100 + 'px',
      }
    },
  },
}
</script>

<style>
.echarts {
  width: 100%;
  height: var(--height);
}
</style>
