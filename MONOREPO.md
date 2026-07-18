# Piloter le monorepo Stone.js

> Guide pratique pour comprendre et **piloter toi-même** le monorepo, sans être expert.
> Public : mainteneur du projet. Langue : français. Tout est illustré en ligne de commande.

---

## 1. C'est quoi un monorepo, ici ?

Avant : ~18 dépôts git séparés, un par module (`@stone-js/core`, `@stone-js/router`…).

Maintenant : **un seul dépôt git** (`stone-foundation/stone-js-framework`) qui contient tous les
modules comme de **simples dossiers** (`stone-js-core/`, `stone-js-router/`…). Ce ne sont pas des
sous-modules git : ce sont des dossiers normaux versionnés dans le même dépôt.

Pourquoi c'est mieux :

- **Une seule version pour tout** (lockstep) : quand on publie, tous les paquets passent à la même
  version (ex. 0.8.0). Fini les incompatibilités entre `core@0.2` et `router@0.8`.
- **Modifications atomiques** : un changement qui touche `core` + `router` + `cli` = **une seule PR**,
  testée ensemble.
- **Un seul CI, un seul Sonar, un seul lint** : moins de maintenance.
- **Liens internes automatiques** : `router` utilise `core` directement depuis le disque, sans
  publier sur npm à chaque essai.

## 2. Les 3 outils qui rendent le monorepo possible

| Outil | Rôle en une phrase | Fichier de config |
|---|---|---|
| **pnpm** (workspaces) | Installe les dépendances **une fois** pour tout le monorepo et **relie les paquets internes entre eux** sans les publier. | `pnpm-workspace.yaml`, `.npmrc` |
| **Turborepo** (turbo) | Lance `build`/`test`/`lint` sur tous les paquets, **dans le bon ordre** et **avec cache** (ne refait pas ce qui n'a pas changé). | `turbo.json` |
| **Changesets** | Gère les **versions** et la **publication** : tu décris tes changements, il calcule la version et publie sur npm. | `.changeset/config.json` |

### 2.1 pnpm — le liant

`pnpm-workspace.yaml` déclare quels dossiers sont des paquets :

```yaml
packages:
  - 'stone-js-*'        # tous les modules
  - '!stone-js-docs'    # sauf la doc
  - '!stone-js-starters'# sauf les starters (publiés à part)
```

Grâce à `.npmrc` (`link-workspace-packages=true`, `dedupe-peer-dependents=true`), quand `router`
déclare `"@stone-js/core": "workspace:*"`, pnpm **branche le dossier local** au lieu de télécharger
depuis npm. Le `workspace:*` est réécrit en vraie version au moment de la publication.

> ⚠️ Règle d'or : **toute dépendance interne** (`@stone-js/*`) se déclare en `workspace:*`
> (en `dependencies`, `peerDependencies` ou `devDependencies` selon le cas). Jamais un numéro figé.

### 2.2 Turborepo — l'orchestrateur

`turbo.json` décrit les tâches et leurs dépendances :

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test":  { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "lint":  {},
    "doc":   { "outputs": ["docs/**"] }
  }
}
```

`"dependsOn": ["^build"]` = « avant de builder un paquet, builde d'abord ses dépendances internes ».
Le `^` veut dire « les dépendances ». Turbo calcule l'ordre tout seul (core → http-core → router → …).

### 2.3 Changesets — le releaser

Un « changeset » est un petit fichier Markdown qui dit : « j'ai changé ces paquets, en `patch`/`minor`/`major`, voici pourquoi ». Au moment de la release, changesets additionne tous les changesets, calcule la nouvelle version, met à jour les `CHANGELOG.md` et publie.

Ici on est en mode **`fixed`** (lockstep) : tous les `@stone-js/*` bougent **ensemble** à la même
version. C'est déclaré dans `.changeset/config.json` (bloc `"fixed"`).

## 3. Les commandes du quotidien

Toutes se lancent **depuis la racine** du monorepo.

```bash
# 1. Installer / relier tout (à faire une fois, et après chaque pull)
pnpm install

# 2. Builder tout (avec cache turbo)
pnpm build
#   … ou un seul paquet et ses dépendances :
pnpm --filter @stone-js/router... build

# 3. Tester
pnpm test
pnpm --filter @stone-js/router test           # un seul paquet
pnpm --filter @stone-js/router test:cvg       # avec couverture

# 4. Linter
pnpm lint
pnpm --filter @stone-js/cli lint:fix          # corriger automatiquement

# 5. Lancer une commande dans un paquet précis
pnpm --filter @stone-js/core <script>
```

> `--filter @stone-js/router...` (avec les `...`) = le paquet **et** tout ce dont il dépend.
> `--filter ...@stone-js/core` (les `...` devant) = `core` **et** tout ce qui dépend de lui.

## 4. Ajouter un changement et préparer une release

```bash
# 1. Tu as codé quelque chose. Tu décris le changement :
pnpm changeset
#   → choisis les paquets impactés, le type (patch/minor/major), écris un résumé.
#   → crée un fichier dans .changeset/ (à committer avec ton code).

# 2. Quand on veut sortir la version (fait par le CI, ou à la main) :
pnpm version-packages
#   → applique tous les changesets : bump des versions + mise à jour des CHANGELOG.

# 3. Publier sur npm (normalement via le CI) :
pnpm release
#   → build tout puis `changeset publish`.
```

En mode `fixed`, **un seul changeset suffit** pour faire monter tout le monde à la version suivante.

## 5. Ajouter un nouveau paquet au monorepo

```bash
# 1. Créer le dossier (préfixe stone-js-*)
mkdir stone-js-telemetry && cd stone-js-telemetry

# 2. package.json : nom @stone-js/telemetry, "type": "module", "sideEffects": false,
#    deps internes en "workspace:*". Reprendre la structure d'un module existant.

# 3. Revenir à la racine et réinstaller pour que pnpm le prenne :
cd .. && pnpm install
```

Le glob `stone-js-*` de `pnpm-workspace.yaml` le détecte automatiquement.
Si le paquet doit sortir dans la release lockstep, l'ajouter au bloc `"fixed"` de `.changeset/config.json`.

## 6. Conventions communes à tous les modules

- **ESM only** (`"type": "module"`), **`"sideEffects": false"`** (tree-shaking).
- TypeScript strict, lint **ts-standard**, tests **Vitest** (jauge 100 %), build **Rollup**.
- Deps internes en **`workspace:*`**.
- **Constructeurs privés/protégés + `static create()`**.
- Commits **conventionnels** (commitlint).
- ⚠️ `docs/` dans chaque module = sortie TypeDoc, **détruite à chaque build** (`rimraf docs`).
  Ne jamais y stocker de contenu durable.
- ⚠️ Garde stale-dts dans `rollup.config.mjs` : `input: ['dist/**/*.d.ts', '!dist/index.d.ts']`.

## 7. CI / Sonar

- **`.github/workflows/ci.yml`** : sur chaque PR et push → `pnpm install` + `turbo lint test build` + scan Sonar.
- **`.github/workflows/release.yml`** : sur `main` → l'action Changesets ouvre/maj une PR « Version Packages » ;
  quand tu la merges, elle publie sur npm.
- **SonarCloud** : **un seul projet** (`stone-foundation_stone-js-framework`), config dans
  `sonar-project.properties`. La couverture de tous les modules est agrégée via les `lcov.info`.

Secrets GitHub nécessaires : `NPM_TOKEN` (publication), `SONAR_TOKEN` (analyse).

## 8. Consolidation git (Phase 2, à faire une fois)

Aujourd'hui, chaque `stone-js-*/` a peut-être encore son propre `.git` (ancien dépôt indépendant),
et le `.gitignore` racine les ignore. La **consolidation** fusionne tout dans le dépôt unique, avec
un **historique propre** (décision retenue : *départ propre + archivage* des anciens dépôts).

Un script guidé est fourni : **`scripts/consolidate-monorepo.sh`** (à lire avant de lancer).
Marche à suivre recommandée :

```bash
# 1. AVANT TOUT : archiver les anciens dépôts sur GitHub (Settings → Archive) — lecture seule.
#    (Étape manuelle côté GitHub. Elle préserve l'historique publié pour référence.)

# 2. Vérifier que le travail est bien dans les dossiers (working tree à jour) :
bash scripts/consolidate-monorepo.sh --check

# 3. Lancer la consolidation (supprime les .git internes, intègre les dossiers au dépôt racine) :
bash scripts/consolidate-monorepo.sh --run
```

> Cette étape est **irréversible** localement (elle retire les `.git` internes). C'est pourquoi
> on archive d'abord côté GitHub, et pourquoi le script tourne en `--check` par défaut.

## 9. Où trouver quoi

- **Vue d'ensemble publique** : [`README.md`](./README.md).
- **Contribuer** : [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- **Sécurité** : [`SECURITY.md`](./SECURITY.md).
- **Instructions agent** : [`CLAUDE.md`](./CLAUDE.md).
