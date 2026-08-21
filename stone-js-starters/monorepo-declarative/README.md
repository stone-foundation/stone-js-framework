# Stone.js - One domain, two applications

A monorepo where the interesting file is the one that runs everywhere.

```
acme/
├── packages/domain/     @acme/domain   the entities and the behaviour
├── apps/web/            @acme/web      a browser application
└── apps/mobile/         @acme/mobile   a React Native application
```

`packages/domain` imports `@stone-js/core` and nothing else about a platform: no `Request`, no
`Response`, no `window`, no `View`. Both applications depend on it, and neither has a copy of it.

## The two applications, side by side

Open both and read them together. This is the whole demonstration:

| | `apps/web/app/Application.ts` | `apps/mobile/app/Application.ts` |
|---|---|---|
| Router | `@Routing()` | `@Routing()` |
| Where events come from | `@Browser()` | `@ReactNative()` |
| What a route becomes | `@UseReact()` | `@UseReactNative()` |
| The domain | `[domainBlueprint]` | `[domainBlueprint]` |

Two decorators differ. Everything else is the same file.

Then open `apps/web/app/TaskListPage.tsx` next to `apps/mobile/app/TaskListScreen.tsx`. `handle` and
`head` are identical, line for line, because answering a route is not a platform question. Only
`render` differs, and only in what it draws with: `div` and `ul` on one side, `View` and `ScrollView`
on the other.

## Setup

```sh
pnpm install
pnpm --filter @acme/domain build
```

The domain is built first because both applications consume its `dist`. `pnpm run build` does both in
order.

## Run them

```sh
pnpm run dev:web        # http://localhost:8080
pnpm run dev:mobile     # Expo: press i for iOS, a for Android
```

## Test them

```sh
pnpm run test           # every package
pnpm --filter @acme/domain test    # the domain alone, in milliseconds
```

Three suites, three levels, and the cheapest one is the one that matters most:

- **`packages/domain`** boots nothing. Plain objects in, plain objects out. This is where the
  behaviour is tested, because this is where the behaviour is.
- **`apps/web`** boots the real kernel through `createTestApp()` and reads the HTML that came back.
- **`apps/mobile`** boots the real kernel, adapter and renderer under Node, sends a deep link, and
  asserts what landed on the navigation stack. No device, no simulator.

The web and mobile suites assert the same domain behaviour through two different contexts, which is
the claim this repository exists to make.

## Why React is pinned at the root

```json
"pnpm": { "overrides": { "react": "19.2.3", "react-dom": "19.2.3" } }
```

Expo pins React to an exact version, and a workspace with one React and a different React DOM fails
at run time with "Incompatible React versions". Pinning both at the root is the one piece of
configuration a web-and-mobile monorepo genuinely needs; without it the two applications drift apart
the first time either one updates.

## Adding to the domain

Put it in `packages/domain/src`, export it from `src/index.ts`, and register it in `domainBlueprint`
if an application should resolve it from the container. Both applications see it on the next build,
and neither one changes.

Relative imports inside the domain carry their `.js` extension, because it is published as ESM with
`moduleResolution: NodeNext`. That is what a consumer on modern Node needs in order to resolve them.

## Learn more

- [Stone.js documentation](https://stonejs.dev/docs)
- [The Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto)
