# Interface: ConfigurationOptions

Configuration options.

This interface defines the configuration options for marking a class as a Configuration.

## Properties

### live?

```ts
optional live: boolean;
```

Live configurations are loaded on each request.
By default, configurations loaded once when the application starts.
Usefull to define dynamic configurations.
No need to restart the application to apply changes.
