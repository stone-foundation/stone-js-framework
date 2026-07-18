# Type Alias: BindingKey

```ts
type BindingKey = number | boolean | string | Function | object | symbol;
```

A union type representing the possible keys that can be used to bind values in the container.

Binding keys can be of various types, such as numbers, booleans, strings, functions, objects, or symbols.
These types are used because they provide a broad range of ways to uniquely identify a binding.

- `number`, `boolean`, `string`: These are basic types that are easy to use and uniquely identify a binding.
- `Function`: Useful for identifying bindings by constructor or other functions.
- `object`: Allows more complex key types, like instances of classes.
- `symbol`: Guarantees a unique identifier, which can prevent conflicts.

## Example

```typescript
const key1: BindingKey = 42; // Using a number as a key
const key2: BindingKey = 'serviceName'; // Using a string as a key
const key3: BindingKey = Symbol('uniqueKey'); // Using a symbol for uniqueness
const key4: BindingKey = MyServiceClass; // Using a function (constructor) as a key
const key5: BindingKey = { custom: 'objectKey' }; // Using an object as a key
```
