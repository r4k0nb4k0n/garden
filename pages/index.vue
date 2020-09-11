<template>
  <v-layout>
    <v-flex>
      <contribution-graph />
    </v-flex>
  </v-layout>
</template>

<script>
import ContributionGraph from '~/components/ContributionGraph.vue'

export default {
  components: {
    ContributionGraph,
  },
  mounted() {
    this.$store.dispatch('user/fetchUsers')
    this.$store.dispatch('contribution/fetchContributions')
  },
}
</script>
