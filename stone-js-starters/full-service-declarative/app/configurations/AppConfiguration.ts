import { Config } from '@libsql/client'
import { getString } from '@stone-js/env'
import { CORSHeadersMiddleware } from '@stone-js/http-core'
import { Configuration, defineBlueprintMiddleware, IBlueprint, IConfiguration, LogLevel, Promiseable } from '@stone-js/core'

/**
 * User Implicit Configuration
 *
 * Explicit configuration takes precedence over implicit configuration.
 * Implicit configuration are defined at decorators level.
 */
@Configuration()
export class AppConfiguration implements IConfiguration {
  /**
   * Configure the application
   *
   * @param blueprint - The blueprint to configure
   */
  configure (blueprint: IBlueprint): Promiseable<void> {
    blueprint
      .set('database', this.databaseConfig())
      .set('security', this.securityConfig())
      .set('stone.logger.level', LogLevel.INFO)
      .set('stone.http.cors.preflightStop', true)
      .set('stone.http.cors.allowedHeaders', ['*'])
      .set(defineBlueprintMiddleware(CORSHeadersMiddleware))
  }

  /**
   * Get the database configuration
   */
  private databaseConfig (): Config {
    return {
      url: getString('DATABASE_URL', 'file:local.db')
    }
  }

  /**
   * Get the security configuration
   */
  private securityConfig (): Record<string, any> {
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
}
