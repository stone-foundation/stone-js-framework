import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/config-source'

/**
 * Extensions: Config Source.
 */
@Page(PATH, { layout: 'docs' })
export class ConfigSource implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Config Source',
      description: 'Load and merge configuration from env, files, AWS SSM, Secrets Manager, HTTP/GitHub and KMS into the blueprint before boot, with optional live reload.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Config Source' />
        <Lead>
          Configuration rarely lives in one place: some in the environment, some in a file, the
          secrets in a vault. <code>@stone-js/config-source</code> loads and merges it from many
          providers, env, JSON/YAML files, AWS SSM, Secrets Manager, an HTTP endpoint, into the
          blueprint <em>before the app boots</em>, so every middleware and provider sees the resolved
          config. Opt into <b>live</b> reload to refresh it on each request.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/config-source
# only the drivers you use (optional, lazy):
npm i @aws-sdk/client-ssm @aws-sdk/client-secrets-manager @aws-sdk/client-kms js-yaml`}</Code>

        <H2>Load before boot</H2>
        <Principle
          principle={
            <p>
              Configuration is Setup, the first dimension: it must exist before anything reads it. The
              blueprint is built once, ahead of every event; the config belongs there, resolved, not
              fetched lazily halfway through a request.
            </p>
          }
          incarnation={
            <p>
              A <code>@Configuration()</code>'s <code>configure(blueprint)</code> is awaited during
              <code> initBlueprint</code>, before the blueprint middleware run. Load your sources
              there and the whole app boots with the merged config in place.
            </p>
          }
        />
        <Code file='app/AppConfig.ts'>{`import { Configuration } from '@stone-js/core'
import { loadConfigSources, envSource, fileSource, ssmSource, secretsSource, kmsDecryptor } from '@stone-js/config-source'

@Configuration()
export class AppConfig {
  async configure (blueprint) {
    await loadConfigSources(blueprint, [
      envSource({ prefix: 'APP_' }),
      fileSource({ path: './config.yaml', optional: true }),
      ssmSource({ path: '/my-app/' }),
      secretsSource({ secretId: 'my-app/prod' })
    ], { transform: kmsDecryptor() })   // decrypts any "kms:…" value
  }
}`}</Code>
        <p>Sources merge in order, later wins. The transform runs on every leaf value.</p>

        <H3>Live config</H3>
        <p>
          Mark the configuration <code>live</code> and Stone reloads it on every incoming event, its
          native live-config mechanism, no restart. Loaded once by default.
        </p>
        <Code file='app/LiveConfig.ts'>{`@Configuration({ live: true })
export class LiveConfig {
  async configure (blueprint) {
    await loadConfigSources(blueprint, [ssmSource({ path: '/my-app/' })])
  }
}`}</Code>

        <Callout kind='note' title='Secrets stay secret'>
          Keep ciphertext in SSM or a file and decrypt at load with <code>kmsDecryptor()</code>: any
          string prefixed <code>kms:</code> is replaced by its KMS plaintext, everything else passes
          through. The AWS SDKs are optional peers, imported lazily only when a driver runs.
        </Callout>

        <H2>Sources</H2>
        <PropsTable nameHeader='source' rows={[
          { name: 'envSource', type: 'built-in', desc: 'Environment variables; an optional prefix is stripped from the keys.' },
          { name: 'fileSource', type: 'built-in', desc: 'A local JSON or YAML file; tolerate a missing one with optional.' },
          { name: 'ssmSource', type: '@aws-sdk', desc: 'AWS SSM Parameter Store, nested by path (/app/db/url -> db.url).' },
          { name: 'secretsSource', type: '@aws-sdk', desc: 'AWS Secrets Manager; the JSON secret becomes the config object.' },
          { name: 'httpSource', type: 'built-in', desc: 'Any URL: a GitHub raw file, a gist, a config server.' },
          { name: 'kmsDecryptor', type: '@aws-sdk', desc: 'A transform that decrypts kms:-prefixed values via AWS KMS.' }
        ]} />

        <SeeAlso links={[
          { title: 'Configuration', path: '/docs/essentials/configuration' },
          { title: 'Ephemeral context', path: '/docs/foundations/ephemeral-context' },
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
