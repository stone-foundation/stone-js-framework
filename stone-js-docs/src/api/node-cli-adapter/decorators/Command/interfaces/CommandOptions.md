# Interface: CommandOptions

Command options.

Represents the configuration options for a CLI command.

## Properties

### alias?

```ts
optional alias: string | string[];
```

Alias or aliases for the command, used for identification or access.
Can be a single alias or an array of aliases.

***

### args?

```ts
optional args: string | string[];
```

The arguments required or accepted by the command.
Can be a single argument or an array of arguments.

***

### desc?

```ts
optional desc: string;
```

The description of the command.

***

### name

```ts
name: string;
```

The unique name of the command.

***

### options?

```ts
optional options: Partial<CommandBuilder<{
}>>;
```

A map of additional options for the command, where the key is the option name
and the value is its description.
