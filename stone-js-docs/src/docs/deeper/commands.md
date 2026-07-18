---
title: Commands
---

Stone.js offers a powerful and unified command system made of two complementary parts:

* **The Stone CLI**, which provides built-in commands like `serve`, `build`, or `init`, and helps automate development workflows across all types of Stone.js projects.
* **Custom Commands**, which let you define your own CLI commands directly in your application, turning any Stone.js app into a fully functional CLI tool.

With this system, you can run, build, scaffold, or extend your projects, and even publish your own CLI tools, using the same familiar Stone.js architecture.

### Why It Exists

CLI tools are essential in any developer’s workflow. Instead of reinventing the wheel for each tool, Stone.js lets you:

* Use one consistent, event-driven system to handle CLI input/output.
* Write CLI commands just like you would write HTTP handlers or frontend page handlers.
* Reuse your application logic, services, and configuration across all execution modes (web, serverless, CLI).

The goal is clear: **one continuum, one skillset**, from server to script.

### Where It Fits in the Continuum

In the Continuum Architecture:

* CLI commands are triggered from the **Integration dimension** via the **CLI adapter**.
* This produces an `IncomingEvent`, just like HTTP, browser or Lambda triggers.
* Your event handler (in the **Functional dimension**) processes the intention and returns a response, or just prints it to the console.

Whether you're writing a complex admin tool or a quick script, you're still operating inside the same contextual flow as the rest of your Stone.js app.

## Stone CLI

The **Stone CLI** is the official command-line tool for Stone.js. It helps you bootstrap new projects, run development servers, build production bundles, and export third-party configurations, all from a single entry point.

Stone CLI comes preinstalled in every Stone.js project, but to unlock its full potential, you should install it globally on your machine.

It offers a consistent, developer-friendly interface to perform essential tasks across all environments, whether you're building a backend API, frontend app, fullstack project, or CLI tool.

### Installation

#### Global Installation (Recommended)

To use the Stone CLI everywhere from your terminal, install it globally from the npm registry:

::: code-tabs#shell
@tab:active npm

```bash
npm i -g @stone-js/cli
```

@tab yarn

```bash
yarn add -g @stone-js/cli
```

@tab pnpm

```bash
pnpm add -g @stone-js/cli
```

:::

#### Local Usage

If you prefer not to install globally, you can still use the CLI in a local project via `npx`:

```bash
npx stone
```

### Built-in Commands

Once installed, you can view all available built-in commands using:

```bash
stone --help
```

Each command also has its own help screen:

```bash
stone export --help
```

#### Main Commands

* `stone serve`
  Start your application in development mode.

* `stone build`
  Build your application for production.

* `stone preview`
  Preview the production build locally.

* `stone init`
  Create a new Stone.js application. A questionnaire will guide you through the setup.

* `stone export`
  Export preconfigured settings for third-party libraries. Example:

  ```bash
  stone export rollup
  ```

* `stone typings`
  Perform static type validation for TypeScript projects.

* `stone cache-clear`
  Clear internal cache, useful during development.

* `stone list`
  List all available custom commands, including your custom ones and those provided by third-party libraries.

* `stone --version`
  Show the current version of the Stone CLI.

## Custom Commands

In addition to built-in commands, Stone.js lets you create your own custom commands.

A **custom command** is an event handler designed to respond to a CLI-triggered `IncomingEvent`.
You write it just like you would write an HTTP event handler or a browser event handler, same shape, same lifecycle, same power.

Not only can you build your own CLI tools, but third-party libraries can also expose their own custom commands. This makes the Stone CLI ecosystem modular, extensible, and highly adaptable to real-world project needs.

### CLI Adapter Installation

To run your custom commands, you’ll need to install the CLI adapter package:

```bash
npm i @stone-js/node-cli-adapter
```

Important, this adapter is **not** the same as `@stone-js/cli`.

* `@stone-js/cli` is the command orchestrator. It launches your app, parses the CLI input, and wires up the system.
* `@stone-js/node-cli-adapter` is what allows your application to receive command events and act on them.

The CLI tool talks to your app through the CLI adapter. Without it, your custom commands won’t be executed.

::: tip Fun Fact
No better demonstration of Stone.js's power than its own CLI, it was the first application built with Stone.js.  
Talk about dogfooding!  
We used Stone.js to build the tool that builds Stone.js apps. 🤓 
:::

### CLI Adapter Activation

Like any other adapter in Stone.js, you must activate the CLI adapter before it can process command line events.

::: tabs#declarative-imperative
@tab:active Declarative
#### Declarative Activation

You can activate the CLI adapter declaratively, by adding the `@NodeConsole()` decorator to your main application handler.

```ts
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, IEventHandler, IncomingEvent } from '@stone-js/core'

@StoneApp()
@NodeConsole()
export class Application implements IEventHandler<IncomingEvent> {
  handle(event: IncomingEvent): void {
    // Your code here
  }
}
```

@tab:active Imperative
#### Imperative Activation

You can activate the CLI adapter imperatively, by adding it's blueprint `nodeConsoleAdapterBlueprint` to your app's configuration.

```ts
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'
import { IncomingEvent, stoneBlueprint, defineEventHandler } from '@stone-js/core'

export const Application = () => (event: IncomingEvent) {
  // Your code here
}

export const AppBlueprint = defineBlueprintConfig((blueprint) => {
  blueprint
    .set(stoneBlueprint)
    .set(nodeConsoleAdapterBlueprint)
    .set(defineEventHandler(Application, true))
})
```
:::

::: important
All your global initialization middleware are disabled when your app runs in CLI mode.
:::

##### Fallback
By default, when the CLI adapter is active and no custom command handler is defined, your main application handler will act as a fallback for any command not explicitly defined.
This means that if you run a command that doesn't match any custom command, or you don't have any custom command defined, the CLI adapter will call your main application handler.

To avoid this, simply remove the `handle` method from the main application handler and Stone.js will handle the command as an unrecognized command.

##### Contextual decoherence
You can add the CLI adapter to **any existing Stone.js project**, just like any other adapter.
Stone.js supports **adapter overlay**, which means you can combine CLI, HTTP, Browser, and more within the same app.

Thanks to **contextual decoherence**, Stone.js automatically infers the runtime environment and uses the appropriate adapter during execution. Don’t worry, the CLI adapter is automatically stripped out of frontend bundles, since it only applies to backend runtimes.

If you’re building a mono app, your `Application` handler can receive events from **any environment**, including CLI input, HTTP requests, cloud functions, or browser app.

Just activate the adapters you need, and your handler will serve them all.

```ts
@Browser()
@UseReact()
@NodeHttp()
@StoneApp()
@NodeConsole()
@AwsLambdaHttp()
export class Application {
  handle(event: IncomingEvent): { message: string } {
    const message = `Hello ${event.get<string>('name', 'World')}!`
    this.logger.info(message)
    return { message }
  }

  render({ data }: RenderContext<{ message: string }>): ReactNode {
    return <h1>{data?.message}</h1>
  }
}
```

This React app can now run custom commands and run as a serverless function or as a web app in both Node.js and browser environments, all from the same codebase.

### Defining a Custom Command

Stone.js treats every CLI command as an event handler. This means your command can be structured just like a web route or background task, and it will benefit from the same context injection, introspection, and modularity.

There are **three ways** to define a custom command in Stone.js:

* Class-based
* Function-based
* Factory-based

You can pick the shape that best suits your needs, from structured applications to one-off utilities.

No matter which shape you choose, your command handler always receives an `IncomingEvent` and optionally returns a response.

::: tabs#class-factory-function
@tab:active Class-based

#### Class-based Command Handler

This is the most robust and introspectable shape, recommended for production apps or when using the declarative API.

```ts
import { IncomingEvent } from "@stone-js/core"
import { ICommandHandler } from "@stone-js/node-cli-adapter"

export class MyCommand implements ICommandHandler<IncomingEvent> {
  handle(event: IncomingEvent): void {
    // Handle the event here
  }
}
```

@tab Function-based

#### Function-based Command Handler

Ideal for small scripts, automation tasks, or single-purpose tools.

```ts
import { IncomingEvent } from "@stone-js/core"

export const MyCommand = (event: IncomingEvent): void => {
  // Handle CLI input here
}
```

Lightweight, testable, and expressive.

@tab Factory-based

#### Factory-based Command Handler

When you need runtime dependencies from the service container, use a factory.

```ts
import { IContainer, IncomingEvent } from "@stone-js/core"

export const MyCommand = (container: IContainer) => {
  return (event: IncomingEvent): { message: string } => {
    const name = event.get<string>('name', 'World')
    return { message: `Hello ${name}!!` }
  }
}
```

Factory-based commands give you maximum flexibility and seamless access to your internal services.
:::

Each shape is valid, and they’re all interoperable.
Use the one that matches your command’s complexity, lifecycle, and ecosystem needs.

### Registering the Command Handler

Once your command handler is defined, you need to register it so that Stone.js can recognize it and execute it when a matching CLI event occurs.

Stone.js offers **two registration styles**, depending on how much control you want:

* Declarative API, using the `@Command()` decorator (for class-based handlers only)
* Imperative API, using `defineCommand()` (for any shape)

::: tabs#declarative-imperative

@tab:active Declarative

#### Declarative Registration

This is the most concise and recommended approach for most CLI commands.

You decorate your handler class with `@Command`, passing its metadata like name, alias, description, arguments, and options:

```ts
import { IncomingEvent } from "@stone-js/core"
import { ICommandHandler, Command } from "@stone-js/node-cli-adapter"

@Command({ name: 'greet', desc: 'Say hello to someone' })
export class GreetCommand implements ICommandHandler<IncomingEvent> {
  handle(event: IncomingEvent): void {
    const name = event.get('name', 'World')
    console.log(`Hello ${name}!`)
  }
}
```

Once your class is decorated, and your app is bootstrapped with `@StoneApp()`, it will be automatically detected and registered at runtime.

@tab Imperative

#### Imperative Registration

If you prefer more manual control, or want to use function or factory-based shapes, you can register your commands using `defineCommand`.

###### Function-based Handler

```ts
import { defineCommand } from '@stone-js/node-cli-adapter'

export const GreetCommand = (event: IncomingEvent) => {
  console.log('Hello from function!')
}

blueprint.set(defineCommand(GreetCommand, { name: 'greet' }))
```

###### Factory-based Handler

```ts
export const GreetCommandFactory = () => (event: IncomingEvent) => {
  const name = event.get('name', 'World')
  console.log(`Hello ${name}!`)
}

blueprint.set(defineCommand(GreetCommandFactory, { name: 'greet' }, true))
```

This mode gives you flexibility for dynamic registration, runtime assembly, or advanced CLI composition.

:::

Once registered, your command handler becomes available to the kernel, and will be executed every time a matching CLI event is received.

### Command Signature

Stone.js gives you full control over how your CLI commands are defined and invoked, including their names, aliases, descriptions, arguments, and options.

You can declare the signature through:

* The `@Command({...})` decorator (declarative)
* The `defineCommand(..., options)` function (imperative)

Both approaches support the same set of metadata.

#### Name

Every command needs a unique `name`. This is the string the user types in the terminal to invoke your command:

```ts
@Command({ name: 'user:list' })
```

```sh
stone user:list
```

#### Alias

You can define one or more shortcuts using the `alias` property:

```ts
@Command({ name: 'user:list', alias: 'ul' })
```

```sh
stone ul
```

Multiple aliases can be defined as an array:

```ts
@Command({ name: 'user:list', alias: ['ul', 'usli'] })
```

#### Description

The `desc` property provides a human-readable explanation of what your command does. It’s shown in the help screen:

```ts
@Command({ name: 'user:list', desc: 'List application users' })
```

```sh
stone user:list --help
```

This helps users understand your command’s purpose at a glance.

#### Arguments

Arguments are positional inputs passed after the command name.
You define them using the `args` property:

* Required arguments are wrapped in angle brackets: `<email>`
* Optional arguments are wrapped in square brackets: `[status]`

```ts
@Command({
  name: 'user:list',
  args: '<email> [status]'
})
```

Used like this:

```sh
stone user:list jonh.doe@domain.com active
```

Stone.js will throw a helpful error and show the command signature if required arguments are missing.

#### Options

Options are named inputs prefixed by `--`, useful for flags and toggles.

You define them using the `options` property. Each key defines an option name and accepts an object of metadata:

```ts
@Command({
  name: 'user:list',
  options: {
    admin: {
      alias: 'ad',
      default: false,
      describe: 'List only admins',
      type: 'boolean'
    }
  }
})
```

Used like this:

```sh
stone user:list --admin
```

#### Supported Option Parameters

* `alias`, shortcut for the option
* `default`, default value if not provided
* `describe`, description shown in help output
* `type`, one of `'boolean'`, `'string'`, `'number'`, etc.

Stone.js uses [Yargs](https://yargs.js.org/docs/#api-reference-optionskey-opt) behind the scenes to parse arguments and options. You can refer to their documentation for even more advanced configurations.

### Custom Matching Logic

Sometimes, you may want more control over which handler responds to a command, especially when multiple handlers are available.
Stone.js provides a clean solution for this through the optional `match` method.

The `match` method allows your handler to inspect the `IncomingEvent` and decide whether it should handle it.
This is particularly useful when:

* You have multiple command handlers registered
* You want to filter by arguments, options, or context
* You’re building dynamic CLI tools

#### Supported Shapes

* ✅ **Class-based handlers**: just define a `match(event)` method alongside your `handle(event)` method.
* ✅ **Factory-based handlers**: return an object with both `match` and `handle` functions.
* ❌ **Function-based handlers**: do not support custom matching. They're always treated as default handlers for the given command name.

::: tabs#class-factory-function
@tab:active Class-based
#### Example, Class-based

```ts
export class MyCommand implements ICommandHandler<IncomingEvent> {
  match(event: IncomingEvent): boolean {
    return event.get<string>('role') === 'admin'
  }

  handle(event: IncomingEvent): void {
    // Executed only if match returns true
  }
}
```

@tab Factory-based

#### Example, Factory-based

```ts
export const MyCommand = () => {
  return {
    match: (event: IncomingEvent) => event.get('env') === 'production',
    handle: (event: IncomingEvent) => {
      // Only runs in production
    }
  }
}
```
:::

If the `match` function returns `false`, Stone.js will skip this handler and continue searching for another match.
If no handler matches, the main handler will act as fallback (unless disabled).

This small function can be the gatekeeper for complex CLI logic, keep it focused and efficient.

### Command Input API

Once your command is running, you’ll want to interact with the user, whether by reading passed arguments and options, or by asking for input dynamically.

Stone.js provides two powerful tools to help you handle CLI input:

* The `IncomingEvent` object, which gives you access to parsed arguments and options
* The `CommandInput` class, which allows interactive user prompts

#### Accessing Parsed Input

Every command handler receives an `IncomingEvent` instance.
You can use the `.get()` method to retrieve values by key, whether it's an argument or an option.

```ts
handle(event: IncomingEvent) {
  const email = event.get('email')             // From args
  const status = event.get('status')           // From args
  const isAdmin = event.get('admin')           // From options
}
```

You can also provide a default value as the second argument:

```ts
const isAdmin = event.get('admin', false)
const email = event.get('email', 'unknown@stone.dev')
```

This gives you a safe, consistent way to extract CLI data.

#### Prompting for Input (Interactive)

Stone.js goes further by offering a set of async utilities for interactive input, such as asking questions or requesting confirmation.

You access these through the `CommandInput` instance, which is injected into your command via the factory shape or constructor.

###### Example with Factory Injection

```ts
import { CommandInput } from '@stone-js/node-cli-adapter'

export const askCommand = ({ input }: { input: CommandInput }) => {
  return async (event: IncomingEvent): Promise<void> => {
    const name = await input.ask('What is your name?')
    console.log(`Welcome ${name}`)
  }
}
```

#### Prompt Methods

###### ask

Ask the user for a string input.

```ts
const email = await input.ask('Provide your email?')
```

With default value:

```ts
const email = await input.ask('Provide your email?', 'jonh.doe@domain.com')
```

###### askNumber

Prompt for a numeric input. If the user enters invalid data, the system will re-prompt.

```ts
const age = await input.askNumber('Your age?')
```

###### secret

Same as `ask`, but input is hidden (e.g., for passwords):

```ts
const password = await input.secret('Enter your password')
```

###### confirm

Ask a yes/no question. Returns `true` or `false`.

```ts
const confirm = await input.confirm('Proceed with deployment?')
```

With default value:

```ts
const confirm = await input.confirm('Proceed?', true)
```

###### choice

Let the user select from a predefined list of options.

```ts
const color = await input.choice('Choose a color', ['Red', 'Green', 'Blue'], 0)
```

Enable multiple selections by passing `true` as the fourth argument:

```ts
const colors = await input.choice('Pick your favorite', ['Red', 'Green'], 0, true)
```

###### editor

Let the user enter a large amount of text in their preferred system editor.

```ts
const bio = await input.editor('Your biography?')
```

With fallback content:

```ts
const bio = await input.editor('Your biography?', 'I am a passionate developer.')
```

Stone.js uses [Prompts](https://www.npmjs.com/package/prompts) under the hood to provide these prompts, but you never have to touch it directly.

### Command Output API

When building CLI tools, presenting information clearly is just as important as receiving input.
Stone.js offers a rich `CommandOutput` utility to help you format and display your messages cleanly and efficiently.

This object is injected into your command the same way as `CommandInput`, either via the class constructor or factory parameters.

#### Example with Factory Injection

```ts
import { CommandInput, CommandOutput } from '@stone-js/node-cli-adapter'

export const greetCommand = (
  { input, output }: { input: CommandInput, output: CommandOutput }
) => {
  return async (event: IncomingEvent): Promise<void> => {
    const name = await input.ask('Your name?')
    output.info(`Hello ${name}`)
  }
}
```

#### Basic Output Methods

###### info

Display a general message (usually blue):

```ts
output.info('Processing complete.')
```

###### warn

Display a warning message (yellow):

```ts
output.warn('Some entries were skipped.')
```

###### error

Display an error message (red):

```ts
output.error('Failed to connect to database.')
```

###### succeed

Display a success message (green):

```ts
output.succeed('All users imported successfully!')
```

###### breakLine

Insert a blank line in the terminal:

```ts
output.breakLine()
```

Useful to improve readability between sections.

#### Advanced Output

###### table

Display tabular data in rows and columns.

```ts
const users = [
  { name: 'Jonh Doe', email: 'jonh.doe@domain.com' },
  { name: 'Jane Doe', email: 'jane.doe@domain.com' }
]

output.table(users, ['name', 'email'])
```

You can pass either an array of objects, or a single object, and optionally filter specific columns.

###### spin

Start a loading spinner, great for tasks that take time.

```ts
const spinner = output.spin('Uploading file...')
```

Stop the spinner when done:

```ts
spinner.stop()
```

This gives your commands a polished, responsive feel.

###### progressBar

Display a visual progress bar for iterative tasks.

```ts
const progress = output.progressBar(':bar', { total: 10 })

const interval = setInterval(() => {
  progress.tick()
  if (progress.complete) clearInterval(interval)
}, 100)
```

Stone.js uses the [`progress`](https://www.npmjs.com/package/progress) library under the hood, so you can pass any supported format and options.

Clear, styled output helps users understand what your CLI is doing, and turns scripts into professional tools.

## Extensibility

Stone.js was designed to be modular and library-friendly. That means you can not only create your own commands, but also consume commands from third-party packages, or provide them yourself if you’re building reusable libraries.

### Third-party Commands

Any third-party library can register its own built-in commands. These commands can be implemented using:

* Class-based handlers
* Factory-based handlers
* Function-based handlers

They behave just like your own commands and are executed through the same CLI interface.
For example:

```sh
stone router list
```

This command could come from an external library that provides routing features, and it will be seamlessly available in your CLI once the library is activated.

### Registration Requirements

Third-party commands **must** use the **Imperative API** for registration.

Why? Because commands are attached to the CLI adapter, and the adapter is only resolved at runtime. This means the command registration must be dynamic, during the blueprint resolution phase.

Libraries do this by registering a **Blueprint Middleware**, which adds their command definitions when the current platform is `node-console`.

### Example: Router Command from a Third-party Library

#### Step 1, Define Command Options and Handler

```ts
export const routerCommandOptions: CommandOptions = {
  name: 'router',
  alias: 'r',
  args: ['<action>'],
  desc: 'Router utility commands',
  options: (yargs: IArgv) => {
    return yargs.positional('action', {
      type: 'string',
      choices: ['list'],
      desc: 'Display route definitions'
    })
  }
}

export class RouterCommand {
  constructor(private readonly container: IContainer) {}

  async handle(event: IncomingEvent): Promise<void> {
    const action = event.get<string>('action')
    if (action === 'list') {
      console.table(await Router.create(this.getRouterOptions()).dumpRoutes())
    }
  }

  private getRouterOptions(): RouterOptions {
    const routerOptions = this.container
      .make<IBlueprint>('blueprint')
      .get<RouterOptions>('stone.router', {} as any)
    return { ...routerOptions, dependencyResolver: this.container }
  }
}
```

#### Step 2, Register Commands Dynamically via Middleware

```ts
export const SetRouterCommandsMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get('stone.adapter.platform') === NODE_CONSOLE_PLATFORM) {
    context.blueprint.add('stone.adapter.commands', [
      { options: routerCommandOptions, isClass: true, module: RouterCommand }
    ])
  }

  return await next(context)
}
```

#### Step 3, Expose the Middleware in Your Library's Blueprint

```ts
export const myLibBlueprint = {
  stone: {
    blueprint: {
      middleware: [
        { module: SetRouterCommandsMiddleware }
      ]
    }
  }
}
```

Once your library is used and its blueprint is registered, the command becomes available to the user automatically.

This mechanism ensures:

* Third-party commands are only registered when relevant (CLI context)
* Registration is dynamic and scoped to the CLI adapter
* No pollution of environments like browser or Lambda

Stone.js makes sure that commands defined in libraries remain lightweight, discoverable, and executable, all while keeping full control over the CLI namespace.

## Best Practices

#### Choose the Right Handler Shape

Each handler shape has its own sweet spot. Here’s how to pick the right one:

* **Class-based**
  Best for structured CLI tools with decorators, metadata, and clear organization.
  Recommended when using the Declarative API.

* **Function-based**
  Ideal for scripts, automation, or quick utilities.
  Simple and direct, but limited (no dependency injection, no match function).

* **Factory-based**
  Perfect when you need runtime access to services, containers, or need to inject `input` and `output` explicitly.
  Best choice for advanced CLI applications.

#### Register Explicit Handlers

Avoid defining a `handle()` method in your main `Application` class unless you're using a wildcard pattern.

Once the CLI adapter is activated, the main handler will be invoked for **any command** that doesn’t match a custom handler.
To prevent accidental fallbacks, leave `handle()` undefined when you're only using explicit commands.

#### Use Descriptions and Aliases

Always define:

* A `desc` so users understand the command’s purpose
* One or more `alias` values for convenience

This improves `--help` output and makes your CLI friendlier to use.

#### Use CommandInput When Appropriate

Don’t overload your command signature with arguments and options.
Instead, use `CommandInput` to collect additional or sensitive data interactively:

* Ask for passwords with `secret()`
* Confirm destructive actions with `confirm()`
* Get long input with `editor()`

Your users will thank you.

#### Structure Your Output

Use `CommandOutput` to:

* Group steps visually with `breakLine()`
* Display lists with `table()`
* Handle longer operations with `spin()` and `progressBar()`
* Keep things colorful and readable using `info()`, `warn()`, `error()`, and `succeed()`

Avoid `console.log()` unless you’re printing raw data for scripting purposes.

#### One Command, One Purpose

Keep each command focused on a single task. If your command does too many things, break it down into subcommands or split logic into services.

#### Prefer Declarative API for Simplicity

Unless you need manual control, prefer `@Command()` for its clarity and automatic wiring.
If you're building a library, you can even expose reusable command classes with their own decorators.

## Summary

Stone.js provides a unified, flexible, and extensible system for building CLI tools, whether you're working on a single project or an entire ecosystem of libraries.

Here’s what you’ve learned:

* **Stone CLI** is the official command-line tool, installed globally or locally, offering built-in commands like `serve`, `build`, and `init`.
* **Custom Commands** let you turn your application into a full CLI tool by defining handlers that respond to CLI input.
* You can define commands using **class-based**, **function-based**, or **factory-based** shapes depending on your needs.
* You can register command handlers via:

  * **Declarative API** using the `@Command()` decorator
  * **Imperative API** using `defineCommand(...)`
* Stone.js allows you to define your command’s **name**, **alias**, **description**, **arguments**, and **options** using a clean and declarative format.
* Use the `IncomingEvent.get()` method to retrieve arguments and options, and the `CommandInput` class for interactive prompts like `ask`, `secret`, `choice`, etc.
* Use the `CommandOutput` class to print messages, render tables, spin loaders, and show progress bars.
* You can create libraries that expose CLI commands by dynamically registering them through **Blueprint Middleware**, targeting the CLI adapter only when relevant.

Whether you’re building dev tools, setup scripts, admin CLIs, or internal utilities, the Stone.js command system gives you power, clarity, and consistency, across every dimension of the Continuum.

Welcome to the CLI continuum, where your terminal just got a whole lot smarter.
