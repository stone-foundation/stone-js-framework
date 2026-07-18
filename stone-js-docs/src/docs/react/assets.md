---
title: Assets
---

In Stone.js, asset management is powered by [**Vite**](https://vite.dev), a modern build tool that makes working with CSS, images, fonts, and other static files incredibly fast and intuitive.

You can import assets just like in any modern Vite project, whether you're bundling styles, loading fonts, or referencing images. No special Stone.js syntax required, just write frontend code the way you're used to.

But to align with a clean and consistent application structure, **Stone.js uses an `assets/` folder by convention**.

::: info
This is just a default. You are free to organize your assets however you like.
:::

If you change the location of your main CSS or other critical files, you can specify the new path in your `stone.config.mjs` file:

```ts title="stone.config.mjs"
import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  input: {
    mainCSS: '/styles/main.css'
  }
})
```

This lets Stone.js know where to inject global styles during the build and rendering process, across all rendering dimensions (SPA, SSR, SOR).

Stone.js doesn’t force structure, it enables continuity.
You stay in control of your assets, your structure, and your creativity.

## Importing CSS

CSS in Stone.js is handled just like in any Vite + React project, no wrappers, no magic. Just import it where you need it.

You can:

* Import global styles in your app entry or layout
* Import component-scoped styles in `.tsx` files
* Use CSS Modules if you prefer scoped classes
* Use PostCSS, Sass, Tailwind, etc., whatever Vite supports, Stone.js supports

### Global Styles

To define your global CSS (e.g., resets, typography, layout), just put it in your main css file and it will be automatically included in your app.

```css title="assets/css/main.css"
body {
  margin: 0;
  font-family: sans-serif;
}
```

If you're using a different global CSS path, be sure to declare it under the `input.mainCSS` key:

```ts title="stone.config.mjs"
import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  input: {
    mainCSS: '/styles/main.css'
  }
})
```

This tells Stone.js to inject it correctly into the server-rendered HTML and to include it in the client bundle.

### Component Styles

You can also import CSS directly inside your component:

```tsx
import './LoginForm.css'

export const LoginForm = () => {
  return <form className="login-form">...</form>
}
```

This pattern is recommended for **isolated component styling**.

### CSS Modules (Optional)

If you prefer CSS Modules:

```tsx
import styles from './Button.module.css'

export const Button = () => {
  return <button className={styles.primary}>Click me</button>
}
```

This works out of the box with Vite, no extra config needed.

### Preprocessors

You can also use:

* **Sass/SCSS** (`.scss`)
* **PostCSS**
* **Stylus**
* Or integrate a **utility-first framework** like Tailwind CSS

Simply install the appropriate plugin and import your styles, Stone.js doesn't restrict your setup.

## Importing Fonts

In Stone.js, fonts are handled just like in any modern Vite-based project, **no constraints, full flexibility**. You can import fonts:

* Locally from your `assets/` (or any custom) folder
* Remotely via a CDN (e.g., Google Fonts)
* Through CSS `@font-face` declarations
* Or via a CSS framework (like Tailwind, Bootstrap, etc.)

### Importing Local Fonts

If you want to host your fonts in your project, drop them in your custom assets directory:

```
/assets/fonts/
├── Inter-Regular.woff2
├── Inter-Bold.woff2
```

Then reference them in your global CSS file:

```css
@font-face {
  font-family: 'Inter';
  src: url('/assets/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}

body {
  font-family: 'Inter', sans-serif;
}
```

Stone.js (via Vite) will correctly serve and cache these assets.

### Importing Fonts via CDN

You can also include fonts in your `index.html` file, generated with:

```bash
stone export app
```

Once exported, add this to the `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
```

This is ideal if you're using popular fonts without needing to host them.

### Using Fonts from a CSS Framework

If you're using a UI or CSS framework (like Tailwind, Bootstrap, or Material UI), fonts may be included by default. You can override them via CSS or configure them at the framework level.

Stone.js gives you **zero interference**, so your font strategy is entirely yours.

## Importing Images

In Stone.js, importing images is simple and optimized thanks to Vite's asset handling system. Whether you're referencing static images via `<img>`, using background images in CSS, or importing them into your components, everything works seamlessly.

### Referencing Static Images via `src`

If you place images in your `assets/` folder (or whatever custom path you’ve configured in `stone.config.mjs`), you can reference them directly in your JSX:

```tsx
<img src="/img/logo.png" alt="Stone.js Logo" />
```

This path is relative to the root of the Vite dev server and will be properly resolved at build time.

### Importing Images in JavaScript or TypeScript

You can also import images as modules:

```tsx
import logo from '/assets/img/logo.png'

export const Header = () => (
  <img src={logo} alt="Stone.js Logo" />
)
```

Vite will optimize the image and replace the path with a fingerprinted version during the build.

### Using Images in CSS

In your CSS or Sass files, you can reference image assets just like you would in any Vite-powered project:

```css
.hero {
  background-image: url('/assets/img/hero.jpg');
  background-size: cover;
}
```

These paths will be resolved and bundled properly.

### Placing Global Static Images

If you need a truly static asset (like a favicon, Open Graph image, or site verification file), place it in the `public/` folder:

```bash
/public/
  ├── favicon.ico
  ├── og-image.jpg
  └── robots.txt
```

You can then reference it directly:

```html
<link rel="icon" href="/favicon.ico" />
<meta property="og:image" content="/og-image.jpg" />
```

The `public/` folder is never processed by Vite, so use it for raw assets only.

## Importing JavaScript Files

Stone.js supports JavaScript imports the same way as any modern Vite-powered app. Whether you're integrating utility libraries, injecting third-party scripts, or adding custom JS logic, it all works naturally in the Stone.js ecosystem.

### JavaScript Modules

You can import JS modules directly into your TypeScript or JSX files:

```ts
import { formatDate } from '/assets/js/utils.js'

const formatted = formatDate(new Date())
```

If the file is placed in your asset folder or within your project structure, Vite will include and optimize it at build time.

### Third-Party Libraries

Need to use a third-party script (like Chart.js or a legacy analytics SDK)? Install it via npm and import it like usual:

```bash
npm install chart.js
```

```ts
import Chart from 'chart.js/auto'
```

Stone.js handles these modules through Vite’s native ESM bundling.

### Inline Scripts in Layouts

If you want to include a script tag (e.g., for a chat widget or analytics snippet), you can use the `head()` method in your page or layout:

```ts
head() {
  return {
    scripts: [
      {
        src: 'https://cdn.example.com/sdk.js',
        defer: true
      }
    ]
  }
}
```

Or if you're editing the HTML template directly (after `stone export app`), you can add it manually in `index.html`:

```html
<script src="https://cdn.example.com/sdk.js" defer></script>
```

### Using Global Scripts via `public/`

If you drop a JS file into the `public/` folder, you can link to it statically:

```html
<script src="/my-widget.js"></script>
```

This is great for vendor files or legacy integrations you don’t want Vite to bundle.

## Using Design Systems in Stone.js

Stone.js is completely compatible with any design system or UI library from the React ecosystem, because it doesn’t stand in the way.

Since Stone.js pages are just React functional components, you can bring in **Material UI**, **Ant Design**, **Bootstrap**, **Tailwind**, or any custom design system you like, with zero configuration beyond what React itself requires.

Let’s explore how to integrate a few of the most popular design systems.

### Material UI (MUI)

**Installation**

```bash
npm install @mui/material @emotion/react @emotion/styled
```

**Usage**

```tsx
import Button from '@mui/material/Button'

export const MyComponent = () => {
  return <Button variant="contained">Click Me</Button>
}
```

MUI themes and providers can be added globally by wrapping your layout's `render()` method or using React’s context system.

### Ant Design

**Installation**

```bash
npm install antd
```

**Import Styles**

Ant Design requires global CSS import, which you can include in your `main.css` (configured in `stone.config.mjs`) or directly in your component if needed:

```ts
import 'antd/dist/reset.css'
```

**Usage**

```tsx
import { DatePicker } from 'antd'

export const MyComponent = () => {
  return <DatePicker />
}
```

### Bootstrap (React-Bootstrap)

**Installation**

```bash
npm install react-bootstrap bootstrap
```

**Import Styles**

```ts
import 'bootstrap/dist/css/bootstrap.min.css'
```

**Usage**

```tsx
import Button from 'react-bootstrap/Button'

export const MyComponent = () => {
  return <Button variant="primary">Save</Button>
}
```

### Tailwind CSS

Tailwind is a utility-first CSS framework that integrates seamlessly with Vite.

**Installation**

Follow the official Tailwind + Vite setup guide:
[https://tailwindcss.com/docs/guides/vite](https://tailwindcss.com/docs/guides/vite)

**Usage**

You can now write utility classes directly in your JSX:

```tsx
export const MyComponent = () => {
  return <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2">Submit</button>
}
```

### Custom Design Systems

You’re not limited to libraries. You can define your own design system by:

* Placing reusable components in `src/components/`
* Defining a `theme.css` or `variables.css` in your assets
* Using your own `ThemeProvider` via React Context in your layout

Stone.js doesn’t interfere with these choices, it embraces them. Because your UI decisions belong to the **view dimension**, and Stone.js only takes care of the **functional dimension**.

## Best Practices

Managing assets in a Stone.js application is all about clarity, portability, and performance. Here are some best practices to keep your setup clean and scalable:

#### Organize Your Assets Clearly

Structure your assets folder logically:

```
public/              ← For static files like favicon, robots.txt, etc.
assets/
├── img/             ← Images used in JSX (imported or linked)
├── fonts/           ← Web fonts
├── styles/          ← CSS, Tailwind, or design system overrides
```

And keep your entry points consistent with your `stone.config.mjs`:

```ts
export default defineConfig({
  input: {
    mainCSS: '/styles/main.css',
  }
})
```

#### Use Absolute Paths

When importing assets (CSS, images, etc.), prefer absolute paths relative to the project root (`/assets/...`) instead of relative imports (`../../assets/...`). This ensures consistent resolution across modules and avoids broken imports.

#### Import CSS Once

Avoid importing the same CSS file in multiple components. Instead, configure a main CSS file (like `main.css`) and Stone.js will handle the rest. This keeps your bundle size smaller and avoids duplication.

#### Snapshot Your Images When Needed (SSR Tip)

When using SSR, static assets like images should be referenced with **absolute paths** that will exist on both the server and the client. Do not dynamically compute image URLs unless necessary, serve them directly from the `assets/` or `public/` directory.

#### Don’t Overload `public/`

Use `public/` only for truly static files that don’t go through Vite’s build pipeline (like `.txt`, `.ico`, etc.). For everything else, styles, fonts, images, prefer using the `assets/` folder and import them via JavaScript or CSS.

#### Wrap Design Systems with Your Own Components (Optional)

If you're using a third-party UI library like MUI or Ant Design, wrap them in your own components (`<MyButton>`, `<MyCard>`, etc.). This gives you a future escape hatch and keeps your codebase consistent if you decide to change libraries later.

## Summary

* Stone.js uses **Vite** under the hood, so you can handle assets exactly like any modern React/Vite app.
* Use `assets/` for bundled files and `public/` for static files.
* Configure your main CSS entry in `stone.config.mjs` with `input.mainCSS` if you change the default path.
* Import fonts, images, JavaScript, and design systems using standard ES modules or Vite conventions.
* Use absolute paths (`/assets/...`) for reliability across dimensions.
* You can integrate **any** design system, Material UI, Ant Design, Bootstrap, Tailwind, or even your custom one, without any special configuration.
* The **view stays yours**. Stone.js never dictates how your UI should look, only that it should work seamlessly across contexts.
