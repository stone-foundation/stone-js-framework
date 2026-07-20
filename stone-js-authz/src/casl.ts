/**
 * Curated re-exports of the CASL essentials, so applications get one import surface from
 * `@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
 * (conditions, field-level rules, subject detection) remains available.
 */
export {
  Ability,
  PureAbility,
  AbilityBuilder,
  ForbiddenError,
  defineAbility,
  createMongoAbility,
  createAliasResolver,
  subject
} from '@casl/ability'

export type { MongoAbility, MongoQuery, RawRuleOf } from '@casl/ability'
