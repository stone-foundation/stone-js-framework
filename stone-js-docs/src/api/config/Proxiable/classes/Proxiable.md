# Class: `abstract` Proxiable

Class representing a Proxiable.

This class allows instances to be wrapped in a Proxy, enabling custom behaviors for property access, assignment, etc.

## Author

Mr. Stone <evensstone@gmail.com>

## Extended by

- [`Config`](../../Config/classes/Config.md)

## Constructors

### Constructor

```ts
new Proxiable(handler): Proxiable;
```

Creates a Proxiable instance wrapped in a Proxy.

#### Parameters

##### handler

`ProxyHandler`\<`Proxiable`\>

A trap object for the proxy, which defines custom behavior for fundamental operations (e.g., property lookup, assignment, etc.).

#### Returns

`Proxiable`

A new proxy object for this instance.
