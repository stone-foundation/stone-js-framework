# Function: PageLayout()

```ts
function PageLayout<T>(options): ClassDecorator;
```

A class decorator for defining a class as a React Page layout.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options

[`PageLayoutOptions`](../../../declarations/interfaces/PageLayoutOptions.md)

Configuration options for the layout definition.

## Returns

`ClassDecorator`

A method decorator to be applied to a class method.

## Example

```typescript
import { PageLayout } from '@stone-js/use-react';

@PageLayout({ name: 'UserPageLayout' })
class UserPageLayout {
  render({ data }) {
    return <h1>User name: {data.name}</h1>;
  }
}
```
