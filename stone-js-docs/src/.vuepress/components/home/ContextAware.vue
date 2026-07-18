<template>
  <div class="context-aware">
    <div class="context-aware-text">
      <div class="section-container">
        <h2 class="section-title">One Framework <br> Many Worlds</h2>
        <p class="section-subtitle">
          Stone.js doesn't just run on multiple platforms, it adapts to them. 
          From frontend to backend, from CLI to cloud, every context becomes a dimension.
          You write your logic once, and Stone.js unfolds it across environments without losing structure, meaning, or performance.
        </p>
      </div>
    </div>
    <div class="continuum-hero-layer">
      <div v-for="(row, y) in contextItems" :key="y" class="continuum-row">
        <div
          v-for="(col, x) in row"
          :key="x"
          class="continuum-col"
        >
          <a
            v-if="col?.icon"
            :href="col.link"
            :title="col.name"
            target="_blank"
            class="continuum-tile no-external-link-icon"
          >
            <img
              :src="col.icon"
              :alt="col.name"
              class="continuum-icon"
            />
          </a>
          <div v-else class="continuum-tile"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const rows = 6
const cols = ref(8)
const updateCols = () => {
  cols.value = Math.floor(document.documentElement.clientWidth / 96) + 1
}
const contextItems = computed(() => {
  return Array
    .from({ length: rows }, () => Array(cols.value).fill(null))
    .map((row, rowIndex) => {
      return row.map((_, colIndex) => {
        return getContext(rowIndex + 1, colIndex + 1)
      })
    })
})

onMounted(() => {
  updateCols()
  window.addEventListener('resize', updateCols)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCols)
})


const contexts = [
  { name: 'Node.js', icon: '/assets/image/context/nodejs.png', link: 'https://nodejs.org/' },
  { name: 'AWS Lambda', icon: '/assets/image/context/lambda_2.png', link: 'https://aws.amazon.com/lambda/' },
  { name: 'Browser', icon: '/assets/image/context/browser.png', link: 'https://developer.mozilla.org/en-US/docs/Web' },
  { name: 'JavaScript', icon: '/assets/image/context/js.png', link: '#' },
  { name: 'TypeScript', icon: '/assets/image/context/typescript.png', link: 'https://www.typescriptlang.org/' },
  { name: 'React', icon: '/assets/image/context/react.webp', link: 'https://react.dev/' },
  { name: 'Vue.js', icon: '/assets/image/context/vue.png', link: 'https://vuejs.org/' },
  { name: 'AWS', icon: '/assets/image/context/aws.png', link: 'https://aws.amazon.com/' },
  { name: 'Edge Runtime', icon: '/assets/image/context/edge.png', link: 'https://vercel.com/docs/concepts/functions/edge-functions' },
  { name: 'Serverless', icon: '/assets/image/context/serverless.png', link: 'https://www.serverless.com/' },
  { name: 'Azure', icon: '/assets/image/context/azure.png', link: 'https://azure.microsoft.com/' },
  { name: 'Google Cloud', icon: '/assets/image/context/googlecloud.png', link: 'https://cloud.google.com/' },
  { name: 'CLI', icon: '/assets/image/context/cli.webp', link: '#' },
  { name: 'Microservices', icon: '/assets/image/context/microservices.png', link: 'https://microservices.io/' }
]

const part1 = contexts.slice(0, Math.ceil(contexts.length / 2))
const part2 = contexts.slice(Math.ceil(contexts.length / 2))

function getContext(row, col) {
  const spacing = 1
  let list = []
  if (row === 3) list = part1
  if (row === 4) list = part2
  if (list.length === 0) return null

  const totalCols = cols.value
  const totalIcons = list.length
  const neededCols = (totalIcons - 1) * spacing - 2
  const startCol = Math.floor((totalCols - neededCols) / 2)

  const index = (col - startCol) / spacing
  if (col >= startCol && (col - startCol) % spacing === 0 && index < totalIcons) {
    return list[index]
  }

  return null
}
</script>

<style scoped lang="scss">
.context-aware {
  padding-top: 2rem;
  padding-bottom: 3rem;
  position: relative;

  .context-aware-text {
    width: 100%;
    position: absolute;

    .section-container {
      padding-bottom: 0;
    }

    .section-title {
      margin-top: 0;
    }
  }

  .continuum-hero-layer {
    gap: 1rem;
    width: 100%;
    display: flex;
    padding-top: 15rem;
    position: relative;
    pointer-events: none;
    flex-direction: column;

    @media (max-width: hope-config.$tablet) {
      padding-top: 24rem;
    }

    .continuum-row {
      gap: 1rem;
      display: flex;
      margin-left: 0;
      overflow: hidden;
      justify-content: center;

      &:nth-child(odd) {
        padding-right: 112px;
      }

      .continuum-col {
        display: flex;
        align-items: center;
        justify-content: center;

        .continuum-tile {
          width: 96px;
          height: 96px;
          display: flex;
          overflow: hidden;
          align-items: center;
          border-radius: 12px;
          pointer-events: auto;
          justify-content: center;
          backdrop-filter: blur(2px);
          background: linear-gradient(180deg, #fafafa, #fdf9f5);

          &:not(:has(img)) {
            transition: transform 1s ease;
            transform: scale(1) translateZ(0);
          }

          &:has(img) {
            cursor: pointer;
            transition: transform 1s ease;
            transform: scale(1) translateZ(0);
          }

          &:has(img):hover {
            transform: scale(.85) translateZ(0);
            transition: transform .2s ease-in-out;
          }

          &:not(:has(img)):hover {
            transform: scale(.85) translateZ(0);
            transition: transform .2s ease-in-out;
          }

          .continuum-icon {
            width: 96px;
            opacity: 0.9;
            color: #2c3e50;
            transition: opacity 0.3s ease;
          }
        }
      }

      &:first-child .continuum-tile {
        background: linear-gradient(180deg, #fff, #f8f9fa);
      }
      &:nth-child(2) .continuum-tile {
        background: linear-gradient(180deg, #f8f9fa, #f4f6f8);
      }
      &:nth-child(3) .continuum-tile {
        background: linear-gradient(180deg, #f4f6f8, #fdf9f5);
      }
      &:nth-last-child(3) .continuum-tile {
        background: linear-gradient(360deg, #f4f6f8, #fdf9f5);
      }
      &:nth-last-child(2) .continuum-tile {
        background: linear-gradient(360deg, #f8f9fa, #f4f6f8);
      }
      &:last-child .continuum-tile {
        background: linear-gradient(360deg, #fff, #f8f9fa);
      }
    }
  }
}
</style>
