<template>
  <div :class="`language-${language} line-numbers-mode`" data-highlighter="prismjs" :data-ext="ext">
    <pre :class="`language-${language}`"><code v-html="highlightedCode"></code></pre>
    <div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0">
      <div v-for="(_, i) of lines" :key="`item-line-${i}`" class="line-number"></div>
    </div>
  </div>
</template>

<script>
import Prism from 'prismjs'

export default {
  props: {
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    ext: {
      type: String,
      required: true
    }
  },
  computed: {
    lines () {
      return this.code.split('\n')
    },
    highlightedCode() {
      return Prism.highlight(this.code, Prism.languages[this.language], this.language)
    }
  },
}
</script>
