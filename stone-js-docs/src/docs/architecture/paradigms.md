---
title: Paradigms - Declarative vs Imperative
---

In software, a paradigm is a way of thinking about and organizing code. It’s like choosing between building LEGO models by following the instructions (**declarative**) or by creating your own design from scratch (**imperative**).

**Why does Stone.js support both?**  
Because developers are like Jedi: some prefer the light side (structured, opinionated), others the dark side (raw power and freedom). Stone.js embraces both, so you can build apps the way *you* want.


## Declarative API

**Short definition**  
You *describe what* you want, not *how* to do it.

**Philosophy**  
Let the framework do the heavy lifting through annotations and metadata by introspecting your code. You declare your intent, Stone.js figures out the structure.

**Core idea**  
Use **decorators** to tag your classes, methods, and properties.

```ts
import { Get } from '@stone-js/router'
import { EventHandler, IncomingEvent } from '@stone-js/core'

@EventHandler()
export class WelcomeEventHandler {
  @Get('/')
  welcome(event: IncomingEvent): { message: string } {
    const message = `Hello ${event.get<string>('name', 'World')}!`
    return { message }
  }
}
```

Feels like magic 🪄, but it’s really just metadata and reflection behind the scenes.


## Imperative API

**Short definition**  
You *explicitly define* how to wire up the app, step by step.

**Philosophy**  
Clarity and control. You compose your app like functions in math: input → transform → output.

**Core idea**  
Use **functions** like `defineRoute`, `defineRoutes`, etc., and assemble them into blueprints.

```ts
import { defineRoute } from '@stone-js/router'

export const welcomeHandler = (event: IncomingEvent): { message: string } => {
  const message = `Hello ${event.get<string>('name', 'World')}!`
  return { message }
}

export const WelcomeEventHandler = defineRoute(welcomeHandler, { path: '/' })
```

Feels like assembling an engine from scratch, but it's clean, testable, and no magic.

## Declarative vs Imperative: Comparison

| Feature        | Declarative API           | Imperative API               |
|----------------|---------------------------|------------------------------|
| Syntax         | Class + Decorators        | Pure functions               |
| Flexibility    | Convention-friendly       | Fully customizable           |
| Testability    | Moderate                  | High                         |
| IDE support    | Good (with decorator support) | Excellent                |
| Composition    | Implicit via metadata     | Explicit via function calls  |
| Learning curve | Lower                     | Slightly higher              |


## When to Use Which?

Stone.js supports **both declarative and imperative** styles, and both work great for **frontend** and **backend** development.

So… which one should you pick?

**Use *Declarative* when:**
- You prefer using **decorators** to describe structure
- You want faster DX and cleaner syntax
- You enjoy a more **magical, convention-based** approach
- You're building apps where simplicity and readability matter

**Use *Imperative* when:**
- You want full **transparency and control**
- You prefer functional composition over metadata
- You need maximum **testability, flexibility, or configurability**
- You're building systems where explicit logic is key (like CLIs, or complex flows)


## Final Thoughts

Stone.js gives you both power and flexibility, declarative for speed and elegance, imperative for control and composition.

Use the paradigm that fits your brain *and* your context.  
Stone.js doesn’t force your hand, it extends it. 🫱🏾‍🫲🏻

