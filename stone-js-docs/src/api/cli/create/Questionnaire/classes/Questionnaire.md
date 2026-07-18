# Class: Questionnaire

Represents a Questionnaire to guide users in creating a Stone.js application.

## Constructors

### Constructor

```ts
new Questionnaire(context): Questionnaire;
```

Initializes a new Questionnaire instance.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`Questionnaire`

## Methods

### getAnswers()

```ts
getAnswers(): Promise<Record<string, unknown>>;
```

Runs the questionnaire and collects user answers.

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

A promise that resolves with the user's answers.

***

### create()

```ts
static create(context): Questionnaire;
```

Factory method to create a new Questionnaire instance.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`Questionnaire`

A new instance of Questionnaire.
