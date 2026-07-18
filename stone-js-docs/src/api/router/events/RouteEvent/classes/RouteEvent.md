# Class: RouteEvent

Class representing a Route Event.

## Extends

- `Event`

## Constructors

### Constructor

```ts
protected new RouteEvent(options): RouteEvent;
```

Create an Event.

#### Parameters

##### options

`EventOptions`

The options to create an Event.

#### Returns

`RouteEvent`

#### Inherited from

```ts
Event.constructor
```

## Methods

### create()

```ts
static create(options): RouteEvent;
```

Create a RouteEvent.

#### Parameters

##### options

`EventOptions`

The options to create a RouteEvent.

#### Returns

`RouteEvent`

A new RouteEvent instance.

## Events

### ROUTED

```ts
readonly static ROUTED: string = 'stonejs@router:routed';
```

ROUTE_MATCHED Event name, fires after event matched route.

 RouteEvent#ROUTE_MATCHED

***

### ROUTING

```ts
readonly static ROUTING: string = 'stonejs@router:routing';
```

ROUTING Event name, fires before event match route.

 RouteEvent#ROUTING
