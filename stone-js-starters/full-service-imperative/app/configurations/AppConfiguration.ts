import { Config } from '@libsql/client'
import { getString } from '@stone-js/env'
import { CORSHeadersMiddleware } from '@stone-js/http-core'
import { defineBlueprintMiddleware, defineConfig, IBlueprint, LogLevel, Promiseable } from '@stone-js/core'

/**
 * User Implicit Configuration
 *
 * Explicit configuration takes precedence over implicit configuration.
 * Implicit configuration are defined at decorators level.
 */
export const AppConfiguration = defineConfig((blueprint: IBlueprint): Promiseable<void> => {
  blueprint
    .set('database', databaseConfig())
    .set('security', securityConfig())
    .set('stone.logger.level', LogLevel.INFO)
    .set('stone.http.cors.preflightStop', true)
    .set('stone.http.cors.allowedHeaders', ['*'])
    .set(defineBlueprintMiddleware(CORSHeadersMiddleware))
})

/**
 * Get the database configuration
 */
function databaseConfig (): Config {
  return {
    url: getString('DATABASE_URL', 'file:local.db')
  }
}

/**
 * Get the security configuration
 */
function securityConfig (): Record<string, any> {
  return {
    jwt: {
      expiresIn: 3600
    },
    secret: getString('SECURITY_JWT_SECRET', 'non_prod_secret'),
    bcrypt: {
      saltRounds: 10
    }
  }
}
