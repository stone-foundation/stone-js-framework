# Interface: InputConfig

Configuration for automatically loading modules during buildtime.

Specifies glob patterns to identify modules for transpilation.

## Properties

### all?

```ts
optional all: string;
```

The input path pattern for the entire application.

***

### app?

```ts
optional app: string;
```

The input path pattern for the application modules expect views.
We need to separate the rest of the application modules from the views
For the lazy loading of views.

***

### mainCSS?

```ts
optional mainCSS: string;
```

The input path for the application Main CSS stylesheet.

***

### views?

```ts
optional views: string;
```

The input path pattern for only the application views.
We need to separate views from the rest of the application modules
For the lazy loading of views.
