<template>
  <div class="vp-code-tabs">
    <div class="vp-code-tabs-nav" role="tablist">
      <button
        v-for="(item, i) of tabs"
        :key="`item-line-${i}`"
        type="button"
        class="vp-code-tab-nav"
        :class="i === index ? 'active' : ''"
        role="tab"
        aria-controls="codetab-78-0"
        aria-selected="true"
        @click="index = i"
      >
        {{ item }}
      </button>
    </div>
    <slot :value="tabs[index]" :attrs="{class:'vp-code-tab', id:'codetab-home', role:'tabpanel', 'aria-expanded':'true'}"></slot>
  </div>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      required: true
    },
  },
  data () {
    return {
      index: 0
    }
  }
}
</script>
