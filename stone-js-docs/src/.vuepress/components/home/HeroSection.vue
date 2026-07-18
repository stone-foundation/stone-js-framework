<template>
  <section class="hero-section">
    <header class="vp-hero-info-wrapper">
      <div class="vp-hero-info">
        <img
          class="vp-hero-image"
          src="/assets/image/moai_img_5.png"
          alt="Stone.js Moai Logo"
        />

        <div class="vp-hero-infos">
          <h1 id="main-title" class="vp-hero-title">The first context-aware <br> Framework</h1>
          <div id="main-description">
            Stone.js embraces the unknown. <br> It doesn’t assume your context, it discovers it. <br>
            From the CLI to the browser, from local to the cloud, from SPA to SSR, from FaaS to the unknown. <br> <b>Stone.js adapts.</b>
          </div>

          <p class="vp-hero-actions">
            <a href="/docs/" class="route-link auto-link vp-hero-action primary no-external-link-icon" aria-label="Get Started with Stone.js">
              <i class="vp-icon" sizing="both" data-fa-i2svg=""><svg class="svg-inline--fa fa-signs-post fa-fw" sizing="both" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="signs-post" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M224 32H64C46.3 32 32 46.3 32 64v64c0 17.7 14.3 32 32 32H441.4c4.2 0 8.3-1.7 11.3-4.7l48-48c6.2-6.2 6.2-16.4 0-22.6l-48-48c-3-3-7.1-4.7-11.3-4.7H288c0-17.7-14.3-32-32-32s-32 14.3-32 32zM480 256c0-17.7-14.3-32-32-32H288V192H224v32H70.6c-4.2 0-8.3 1.7-11.3 4.7l-48 48c-6.2 6.2-6.2 16.4 0 22.6l48 48c3 3 7.1 4.7 11.3 4.7H448c17.7 0 32-14.3 32-32V256zM288 480V384H224v96c0 17.7 14.3 32 32 32s32-14.3 32-32z"></path></svg></i>
              Get Started
            </a>
            <a href="/docs/architecture/continuum" class="route-link auto-link vp-hero-action default no-external-link-icon" aria-label="Learn the Continuum">
              <i class="vp-icon" sizing="both" data-fa-i2svg=""><svg class="svg-inline--fa fa-lightbulb fa-fw" sizing="both" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="lightbulb" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg=""><path fill="currentColor" d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2l0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4l0 0c19.8 27.1 39.7 54.4 49.2 86.2H272zM192 512c44.2 0 80-35.8 80-80V416H112v16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"></path></svg></i>
              Learn the Continuum
            </a>
          </p>
        </div>
      </div>
    </header>
  </section>
</template>

<style scoped lang="scss">
.hero-section {
  padding: 3rem 0;
  position: relative;
  background-color: #ffffff;
  background-size: 260px, 260px;
  background-position: right bottom, left bottom;
  background-image: url('/assets/image/context/hero_bg.png');

  #main-description {
    max-width: 36rem;
    line-height: 1.4;
  }

  @media (max-width: hope-config.$tablet) {
    padding: 0;
  }

  .vp-hero-infos {
    padding-bottom: 3rem;
  }

  .vp-hero-title {
    line-height: 1.2;
  }

  .vp-hero-image {
    margin-left: 0;
    max-height: 25rem;
    transition: transform 2s ease;
    transform: scale(1) translateZ(0);
    
    &:hover {
      transform: scale(.9) translateZ(0);
      transition: transform .2s ease-in-out;
    }
  }
}
</style>
