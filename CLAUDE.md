# CLAUDE.md — Stone Foundation (monorepo de dépôts Stone.js)

Ce dossier regroupe tous les dépôts du framework **Stone.js**, créé par Evens Pierre (« Mr. Stone »), implémentation de référence de la **Continuum Architecture** (https://evens-stone.github.io/continuum-manifesto/manifesto). Chaque sous-dossier est un dépôt git indépendant publié sous le scope npm `@stone-js/*`.

## La vision (compréhension validée par le mainteneur, 2026-07-17)

Une application n'est pas un objet mais un **acte** : `Application = Domaine × Contexte → Résolution`. Stone.js se positionne comme **étant le contexte lui-même** : le développeur écrit son domaine une fois, et c'est le contexte qui s'applique au domaine à l'exécution — pas l'inverse. Ambitions : un seul framework pour backend **et** frontend, cloud-native à la base (« build once, deploy anywhere » : Node, FaaS, navigateur, CLI, edge).

### Les quatre dimensions et leur incarnation

| Dimension | Incarnation | Rôle |
|---|---|---|
| **Setup** | Blueprint (`@stone-js/config` + BlueprintBuilder du core) | Manifeste de configuration unique, construit par introspection des décorateurs ou par meta-modules impératifs, une fois avant tout événement |
| **Integration** | Adapters (un paquet par plateforme) | Capturent les *causes* brutes, les normalisent en *intentions* (`IncomingEvent`), retransforment les réponses en *effets* natifs |
| **Initialization** | Kernel (core) | Applique le conteneur (contexte d'exécution éphémère par événement) + le domaine à l'intention ; middleware, hooks, error handlers |
| **Functional** | Code utilisateur | Handlers et services — aucune structure imposée |

### Principes non négociables

- **Noyau agnostique de la plateforme** : aucun vocabulaire HTTP/CLI/browser dans le core (les écarts actuels sont des bugs à corriger, pas des choix).
- **Double paradigme à parité** : déclaratif (décorateurs TC39 stage-3 2023-11, `Symbol.metadata`, **jamais** reflect-metadata ni experimentalDecorators) et impératif (helpers `define*` → meta-modules `{ module, isClass?, isFactory? }`).
- **Trois formes partout** : classe, factory, fonction (la forme fonction ne reçoit jamais le conteneur ; les providers interdisent la forme fonction).
- **Toute la config par clés pointées `stone.*`** sur le Blueprint.
- **Micro-kernel** : le core ne dépend que de pipeline, service-container et config ; tout le reste se greffe par blueprints/providers/adapters, sans dépendance inverse.

## Carte de l'écosystème

- **Primitives** : `stone-js-pipeline` (chaîne de responsabilité), `stone-js-service-container` (DI), `stone-js-config` (store du Blueprint).
- **Noyau** : `stone-js-core`.
- **Couches transverses** : `stone-js-http-core` (HTTP agnostique du runtime), `stone-js-router` (routage universel node/navigateur), `stone-js-env`, `stone-js-filesystem`, `stone-js-browser-core`.
- **Adaptateurs (Integration)** : `stone-js-node-http-adapter`, `stone-js-aws-lambda-adapter` (générique), `stone-js-aws-lambda-http-adapter`, `stone-js-browser-adapter` (SPA), `stone-js-node-cli-adapter`.
- **Frontend** : `stone-js-use-react` (React, SSR/CSR) et `stone-js-use-view` (couche « view engine » agnostique, réutilisable par d'autres frameworks de vue).
- **Outillage** : `stone-js-cli` (builds de tous les projets : Rollup+Babel backend, Vite+Babel frontend, codegen `.stone/`), `stone-js` (`@stone-js/create`, scaffolder), `stone-js-starters` (templates).
- **Docs** : `stone-js-docs` (site VuePress).

## Conventions communes à tous les modules

- ESM only (`"type": "module"`), TypeScript strict, lint `ts-standard`, tests Vitest (jauge 100 %), build Rollup, conventional commits (commitlint + husky), SonarCloud.
- Constructeurs privés/protégés + `static create()`.
- ⚠️ **`docs/` dans chaque module est la sortie TypeDoc, détruite par `rimraf docs` à chaque build** — ne jamais y stocker de contenu durable.

## Méthode de travail

- Chaque bug corrigé doit gagner un test **comportemental** (pas un test de mocks).
- Toute dépendance interne `@stone-js/*` se déclare en `workspace:*`.
- Voir [`MONOREPO.md`](./MONOREPO.md) pour piloter le monorepo (pnpm/turbo/changesets).
