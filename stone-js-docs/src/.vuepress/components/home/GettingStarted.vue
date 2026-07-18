<template>
  <section class="getting-started">
    <div class="section-container">
      <div>
        <h2 class="section-title">Start Small <br> Scale Everywhere</h2>
        <p class="section-subtitle">
          From microservices to monoliths, from local to cloud, Stone.js lets you scaffold, shape, and ship your app in minutes.
          Choose your paradigm, pick your platform, and let Stone.js handle the rest.
        </p>
      </div>

      <div class="content">
        <div class="code-blocks">
          <CodeTabs :tabs="['Declarative', 'Imperative']" class="code-tabs">
            <template v-slot:default="slotProps">
              <div v-bind="slotProps.attrs" :class="slotProps.value === 'Declarative' ? 'active' : ''">
                <CodeBlock language="javascript" :code="code" ext="ts" />
              </div>
              <div v-bind="slotProps.attrs" :class="slotProps.value === 'Imperative' ? 'active' : ''">
                <CodeBlock language="javascript" :code="macroCode" ext="ts" />
              </div>
            </template>
          </CodeTabs>
        </div>

        <ul class="steps">
          <li>
            <h3>1. Scaffold in seconds</h3>
            <p>
              Run <code>npm create @stone-js</code> and pick your flavor: mono-routed or multi-routed, backend or frontend, React or Vue(soon). No templates, just choices.
            </p>
          </li>
          <li>
            <h3>2. Choose your paradigm</h3>
            <p>
              Prefer functions? Use the imperative API. Love decorators? Go declarative.  
              Stone.js supports both, equally powerful, equally simple.
            </p>
          </li>
          <li>
            <h3>3. Run locally. Deploy globally.</h3>
            <p>
              Whether it’s Node.js, Lambda, or the browser, your app becomes one artifact ready to deploy anywhere. No config hell. Just build and run.
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import CodeTabs from '@CodeTabs'
import CodeBlock from '@CodeBlock'
import { nanoApp, macroApp } from '../../examples/home-apps.js';

const code = computed(() => nanoApp)
const macroCode = computed(() => macroApp)

</script>

<style scoped lang="scss">
.getting-started {
  padding: 6rem 2rem;
  background: linear-gradient(to bottom right, #ffffff, #fdf9f5);

  @media (max-width: hope-config.$tablet) {
    padding: 3rem 0;
  }

  @media (min-width: hope-config.$tablet) {
    .content {
      display: flex;
      align-items: center;
      gap: 2rem;

      .code-blocks {
        max-width: 60%;
      }
    }
  }

  .steps {
    padding: 0;
    margin: 0;
    list-style: none;
    max-width: 480px;
  }

  .steps li {
    margin-bottom: 2rem;
  }

  .steps h3 {
    font-size: 1.2rem;
    color: #d35400;
    margin-bottom: 0.5rem;
  }

  .steps p {
    font-size: 1rem;
    color: #555;
    line-height: 1.6;
  }
}
</style>
