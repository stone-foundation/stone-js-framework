---
"@stone-js/i18n": patch
---

feat(i18n): catalogues are found at any depth, and overlapping ones merge

Discovery scanned `app/i18n` and nothing else, which forced every translation of
an application into one flat directory. A catalogue is now **any directory named
`i18n` under `app`**, found at any depth, so translations can live next to the
code that owns them:

```
app/i18n/fr/common.json                     shared across the app
app/modules/billing/i18n/fr/invoice.json    owned by the billing module
app/modules/crm/contacts/i18n/fr/contact.json
```

Which makes overlapping catalogues the normal case, and revealed a silent data
loss: `loadTranslations` did `resources[locale][namespace] = ...`, so a shared
`fr/common.json` and a module's own `fr/common.json` left only the last one
standing. Catalogues sharing a locale and a namespace now **deep-merge**, applied
in sorted path order, so the deeper catalogue wins a conflicting key and the
result is identical on every machine and every build. The lazy path already
merged through i18next but applied its bundles inside `Promise.all`, letting
import timing decide the winner; imports stay parallel, the merge is ordered.

Four plugin options cover what the convention cannot express, none of them needed
by a conventional project:

| Option | Default | What it does |
|---|---|---|
| `root` | `'app'` | The directory walked for catalogues |
| `dirname` | `'i18n'` | The directory name that marks a catalogue, for example `'locales'` |
| `dir` | -- | Scan exactly this one directory, no walk |
| `pattern` | -- | Take the files from a glob, when nothing above fits |

```ts
i18nCliPlugin({ root: 'src', dirname: 'locales' })
i18nCliPlugin({ pattern: 'packages/*/translations/*/*.json' })
```

`node_modules` and dotted directories are excluded from the walk and from
`pattern`, because a dependency's translations are not your application's.
