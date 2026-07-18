# Interface: IEventEmitter

Event emitter for handling application events.

## Properties

### emit

```ts
emit: (event) => Promiseable<void> & (event) => Promiseable<void> & (event, ...args) => Promiseable<void>;
```

***

### off

```ts
off: (event, listener) => void & (event, listener) => void & (event, listener) => void;
```

***

### on

```ts
on: (event, listener) => void & (event, listener) => void & (event, listener) => void;
```
