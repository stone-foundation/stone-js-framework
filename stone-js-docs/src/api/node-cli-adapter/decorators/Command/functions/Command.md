# Function: Command()

```ts
function Command<T>(options): ClassDecorator;
```

Command decorator to mark a class as a command and automatically bind it to the container.

This decorator is useful for marking classes that should be treated as commands by the Stone.js framework,
making them easily injectable and manageable by the command container.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options

`Partial`\<[`CommandOptions`](../interfaces/CommandOptions.md)\> = `{}`

The configuration options for the command, including singleton and alias settings.

## Returns

`ClassDecorator`

A decorator function to set metadata on the target class.

## Example

```typescript
@Command({ alias: 'MyCommand' })
class MyCommand {
  // Command class logic here.
}
```
