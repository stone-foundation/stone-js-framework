<template>
  <section class="continuum-section">
    <div class="section-container">
      <h2 class="section-title">Continuum in Action</h2>
      <p class="section-subtitle">
        Stone.js isn't built on layers, it's built on a flow, from raw events to rendered experiences. That flow is called the Continuum.
      </p>

      <div class="card-grid">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="feature-card"
        >
          <component :is="step.icon" class="icon" />
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <div v-if="index < steps.length - 1" class="arrow">→</div>
        </div>
      </div>
      <p class="continuum-cta">
        <a href="/docs/architecture/continuum" class="route-link auto-link vp-hero-action primary no-external-link-icon" aria-label="Learn the Continuum">
          Learn the Continuum
        </a>
      </p>
    </div>
  </section>
</template>

<script setup>
import { Server, Settings, Share2, Zap } from 'lucide-vue-next'

const steps = [
  {
    title: 'Setup',
    description: 'Produce your app’s blueprint by configuring services, features, and plugins, declaratively or imperatively.',
    icon: Settings
  },
  {
    title: 'Integration',
    description: 'Adapt external stimuli (HTTP, CLI, Lambda, browser) into contextual events Stone.js understands.',
    icon: Server
  },
  {
    title: 'Initialization',
    description: 'Populate the app context, register lifecycle hooks, and prepare for execution.',
    icon: Zap
  },
  {
    title: 'Functional',
    description: 'Handle intentions using event handlers to produce responses, domain logic, clean and portable.',
    icon: Share2
  }
]

</script>

<style scoped lang="scss">
.continuum-section {
  padding: 6rem 2rem;
  text-align: center;
  background: linear-gradient(to right, #fefefe, #f8f8f8);

  @media (max-width: hope-config.$tablet) {
    padding: 3rem 0;
  }

  .continuum-cta {
    margin: 0;
    padding: 4rem 0 0;
  }

  .arrow {
    font-size: 2rem;
    color: #ccc;
    margin: 0 1rem;
    font-weight: bold;
    display: inline-block;

    @media (max-width: hope-config.$tablet) {
      transform: rotate(90deg);
    }
  }
}
</style>
