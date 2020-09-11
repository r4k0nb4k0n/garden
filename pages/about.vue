<template>
  <v-layout>
    <v-flex class="text-center">
      <div
        v-for="(author, i) in authors"
        :key="i"
        class="d-flex flex-column align-center"
      >
        <img :src="author.src" :alt="author.name" />
        <blockquote class="blockquote px-0">
          &#8220;{{ author.phrase }}&#8221;
          <footer>
            <small>
              <em>&mdash;{{ author.name }}</em>
            </small>
          </footer>
        </blockquote>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      authors: [
        {
          name: 'r4k0nb4k0n',
          phrase: '너구리와 라쿤은 다르다.',
          src: '/r4k0nb4k0n.jpg',
        },
      ],
    }
  },
}
</script>
