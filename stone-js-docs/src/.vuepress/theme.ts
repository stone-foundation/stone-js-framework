import { enNavbar } from "./navbar/index.js";
import { enSidebar } from "./sidebar/index.js";
import { hopeTheme } from "vuepress-theme-hope";
import { ALGOLIA_API_KEY, ALGOLIA_APP_ID, ALGOLIA_INDEX_NAME } from "./options.js";

export default hopeTheme({
  pure: true,
  docsDir: "src",
  pageInfo: false,
  logo: "/logo.png",
  hostname: "https://stonejs.dev",
  repo: "https://github.com/stone-foundation/stone-js-docs",
  
  author: {
    name: "Mr. Stone",
  },
  toc: {
    levels: [2, 3],
  },

  locales: {
    "/": {
      navbar: enNavbar,
      sidebar: enSidebar,
      displayFooter: true,
      copyright: false,
      // copyright: 'Stone.js is a Trademark of Stonesify LLC.',
      footer: 'Licensed under the MIT License. <br> <br> Copyright © 2026 Stone Foundation. All rights reserved.',
      metaLocales: {
        editLink: "Edit this page on GitHub",
      },
    },
  },

  markdown: {
    tabs: true,
    highlighter: {
      type: "prismjs",
      themes: {
        dark: 'one-dark',
        light: 'one-dark'
      }
    },
    align: true,
    attrs: true,

    // install chart.js before enabling it
    // chart: true,

    codeTabs: true,

    // insert component easily
    // component: true,

    demo: true,

    // install echarts before enabling it
    // echarts: true,

    figure: true,

    // install flowchart.ts before enabling it
    // flowchart: true,

    // gfm requires mathjax-full to provide tex support
    // gfm: true,

    imgLazyload: true,
    imgSize: true,
    include: true,

    // install katex before enabling it
    // katex: true,

    // install mathjax-full before enabling it
    // mathjax: true,

    mark: true,

    // https://theme-hope.vuejs.press/guide/markdown/chart/mermaid.html#settings
    mermaid: true,

    playground: {
      presets: ["ts", "vue"],
    },

    // install reveal.js before enabling it
    // revealJs: {
    //   plugins: ["highlight", "math", "search", "notes", "zoom"],
    // },

    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    vPre: true,

    // install @vue/repl before enabling it
    // vuePlayground: true,
  },

  encrypt: {
    config: {
      "/demo/encrypt.html": ["1234"],
    },
  },

  plugins: {
    icon: {
      assets: "fontawesome-with-brands",
    },

    // https://theme-hope.vuejs.press/guide/feature/search.html#use-vuepress-plugin-docsearch
    docsearch: {
      appId: ALGOLIA_APP_ID,
      apiKey: ALGOLIA_API_KEY,
      indexName: ALGOLIA_INDEX_NAME,
    },

    seo: {
      fallBackImage: "/logo_square.png",
    },

    // uncomment these if you want a pwa
    // pwa: {
    //   favicon: "/favicon.ico",
    //   cacheHTML: true,
    //   cachePic: true,
    //   appendBase: true,
    //   apple: {
    //     icon: "/assets/icon/apple-icon-152.png",
    //     statusBarColor: "black",
    //   },
    //   msTile: {
    //     image: "/assets/icon/ms-icon-144.png",
    //     color: "#ffffff",
    //   },
    //   manifest: {
    //     icons: [
    //       {
    //         src: "/assets/icon/chrome-mask-512.png",
    //         sizes: "512x512",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-mask-192.png",
    //         sizes: "192x192",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //     ],
    //     shortcuts: [
    //       {
    //         name: "Demo",
    //         short_name: "Demo",
    //         url: "/demo/",
    //         icons: [
    //           {
    //             src: "/assets/icon/guide-maskable.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  },
}, {
  custom: true
});
