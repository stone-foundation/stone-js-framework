---
"@stone-js/use-react-core": patch
"@stone-js/use-react": patch
---

feat(use-react): a link addressed by route name, and the hook behind it

```tsx
<StoneLink name='notes.show' params={{ id: note.id }}>Read it</StoneLink>
<StoneLink name='notes.index' query={{ page: 2 }} hash='top'>Page 2</StoneLink>
```

`StoneLink` took a path, as `href` or `to`. Writing a path in a component makes the component own something the router owns: the day the path changes, every link that spelled it out is wrong, and nothing says so. A link that names a route cannot go stale, and a name nobody declared says so in the console instead of rendering a broken address that looks fine.

Everything `router.generate()` accepts is a prop: `params`, `query`, `hash`, `protocol` and `withDomain`. The generation is the router's own, so a link and a redirect built from the same name cannot disagree.

**The resolution lives in `@stone-js/use-react-core`, as `useLink`.** An anchor is a browser element and a route name is not: a React Native application has no `<a>` and needs exactly what the hook returns, so only the rendering belongs to this package.

```ts
const { href, isCurrent, navigate } = useLink({ name: 'notes.show', params: { id } })
```

**A parameterised link is highlighted correctly for the first time.** The selected class compared the generated `/notes/42` against the current route's pattern `/notes/:id`, which are never equal, so a link to any route with a parameter was never marked current. A named link is compared by name and by the parameters it named; one that names no parameter is current for every value of them, which is what a navigation highlight wants. A raw address is still compared against the current path.

`href` and `to` keep working, with `to` still accepting either a path or `NavigateOptions`: nothing to change in an existing application. `name` is the one to write now, and the props are a union, so the compiler asks for one of the three instead of letting a link render with nothing to point at.

One more thing the tests caught: the failure path resolves the bound logger, or falls back to `console`, and never the static `Logger`, which throws when it has not been initialised. Warning about a broken link must not break the page.
