# Interface: IPageLayout

Represents a Page layout.

## Properties

### head()?

```ts
optional head: () => Promiseable<HeadContext>;
```

#### Returns

`Promiseable`\<`HeadContext`\>

***

### render()

```ts
render: (context) => ReactNode;
```

#### Parameters

##### context

`any`

#### Returns

`ReactNode`
