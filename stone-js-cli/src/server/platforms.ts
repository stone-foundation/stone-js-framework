/**
 * Every first-party adapter package, and the platform identifier it provides.
 *
 * A targeted build keeps the selected platform's adapter and leaves the others out of the artefact.
 * Measured on a lab application: dropping `@stone-js/node-cli-adapter` alone takes 2.47 MB down to
 * 1.97 MB, because it brings `yargs`, `prompts`, `ora`, `chalk` and `progress` with it. A serverless
 * artefact that will never run a command should not carry a command-line stack. The cloud adapters are
 * cheap by comparison, about 30 KB each, so the win is mostly in not shipping what the target cannot use.
 */
export const ADAPTER_PLATFORMS: Record<string, string> = {
  '@stone-js/alibaba-fc-adapter': 'alibaba_fc',
  '@stone-js/alibaba-fc-http-adapter': 'alibaba_fc_http',
  '@stone-js/aws-apigw-ws-adapter': 'aws_apigw_ws',
  '@stone-js/aws-lambda-adapter': 'aws_lambda',
  '@stone-js/aws-lambda-http-adapter': 'aws_lambda_http',
  '@stone-js/azure-functions-adapter': 'azure_functions',
  '@stone-js/azure-functions-http-adapter': 'azure_functions_http',
  '@stone-js/browser-adapter': 'browser',
  '@stone-js/fetch-adapter': 'fetch',
  '@stone-js/gcp-cloud-functions-adapter': 'gcp_cloud_functions',
  '@stone-js/gcp-cloud-functions-http-adapter': 'gcp_cloud_functions_http',
  '@stone-js/node-cli-adapter': 'node_console',
  '@stone-js/node-http-adapter': 'node_http',
  '@stone-js/node-ws-adapter': 'node_ws',
  '@stone-js/tencent-scf-adapter': 'tencent_scf',
  '@stone-js/tencent-scf-http-adapter': 'tencent_scf_http'
}

/**
 * Every platform a targeted build can be asked for.
 */
export const KNOWN_PLATFORMS: string[] = [...new Set(Object.values(ADAPTER_PLATFORMS))]
  .sort((a, b) => a.localeCompare(b))

/**
 * The adapter packages that must stay out of an artefact built for one platform.
 *
 * `node_console` is never excluded: a build that targets a platform still needs the console adapter
 * for the build itself, and excluding it would break the very command doing the building.
 *
 * @param platform - The selected platform.
 * @param installed - The adapter packages the project actually depends on.
 * @returns The packages to leave out.
 */
export function packagesToExclude (platform: string, installed: string[]): string[] {
  return installed.filter((pkg) => {
    const provided = ADAPTER_PLATFORMS[pkg]
    return provided !== undefined && provided !== platform
  })
}

/**
 * The adapter package providing a platform, if it is one this CLI knows.
 *
 * @param platform - The platform identifier.
 * @returns The package name, or `undefined`.
 */
export function packageProviding (platform: string): string | undefined {
  return Object.keys(ADAPTER_PLATFORMS).find((pkg) => ADAPTER_PLATFORMS[pkg] === platform)
}
