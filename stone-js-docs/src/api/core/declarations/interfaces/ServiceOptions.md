# Interface: ServiceOptions

Service options.

This interface defines the configuration options for marking a class as a service.

## Properties

### alias

```ts
alias: string | string[];
```

Alias or aliases for the service, used for identification or access.
Can be a single alias or an array of aliases.

***

### singleton?

```ts
optional singleton: boolean;
```

Whether the service should be treated as a singleton.
A singleton service will only have one instance in the container.
Optional.
