# Variable: DEFAULT\_BROWSER\_TARGETS

```ts
const DEFAULT_BROWSER_TARGETS: "defaults and fully supports es6-module" = 'defaults and fully supports es6-module';
```

The default browser targets.

Used when the application does not define a browserslist configuration.
Covers all browsers supporting native ES modules (Safari 11+, iOS 11+, etc.),
which is the minimum required by Vite anyway.
