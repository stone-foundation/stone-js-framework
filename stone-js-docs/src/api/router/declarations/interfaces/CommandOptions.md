# Interface: CommandOptions

Command options.

Represents the configuration options for a CLI command.

## Properties

### alias?

```ts
optional alias: string | string[];
```

***

### args?

```ts
optional args: string | string[];
```

***

### desc?

```ts
optional desc: string;
```

***

### name

```ts
name: string;
```

***

### options()?

```ts
optional options: (yargs) => IArgv;
```

#### Parameters

##### yargs

[`IArgv`](IArgv.md)

#### Returns

[`IArgv`](IArgv.md)
