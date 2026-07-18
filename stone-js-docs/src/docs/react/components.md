---
title: Components
---

In Stone.js, components are **100% React**.

They are not wrapped, extended, abstracted, or intercepted by the framework. You write them the same way you would in any standalone React project, with hooks, props, state, refs, and whatever libraries you choose.

::: important Not a limitation
That’s not a limitation. It’s a design decision, a deliberate boundary drawn by the Continuum Architecture.
:::

Stone.js handles the **functional dimension** of your app: routing, lifecycle, service injection, SSR orchestration, hydration, error handling, and system context. React handles the **view dimension**: rendering, DOM interaction, local state, event delegation, animations, component logic, and user input. Your components live entirely in the view dimension.

Stone.js never touches them. And that’s exactly why they remain:

* Clean
* Portable
* Reusable
* Easy to test
* Framework-agnostic

This separation of responsibility means:

* You can use your components in another React app without changes
* You can structure your view layer freely
* You’re never forced into a framework-specific component syntax or lifecycle

::: info Clean and free.
If a page is the bridge between system and interface, a component is pure interface, clean and free.
:::

### Components stay framework-free
Once a page returns a React tree, Stone.js exits the stage.
From that point forward, your components are fully in React’s hands, and only React’s.

This means your components:

- Are never wrapped or intercepted
- Aren’t injected with magic props or decorators
- Stay portable and testable across any project

::: tip Fact
Stone.js governs **context**, not rendering. React governs rendering, not **context**.
:::

By keeping your components cleanly outside the system boundary, you get the best of both worlds: **architectural orchestration without UI coupling.**


## File and Folder Structure

Stone.js doesn’t impose a folder layout.
But it encourages a clear architectural separation between:

* Pages → operate in the **functional dimension**
* Components → operate in the **view dimension**

This keeps your application modular, testable, and future-proof.

### Suggested structure

```bash
app/
├── components/         # React-only components
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.css
│   └── LoginForm/
│       ├── LoginForm.tsx
│       └── LoginForm.css
├── pages/              # Stone.js pages (handlers)
│   ├── LoginPage.tsx
│   └── HomePage.tsx
```

::: tip Fact
Components are pure React.  
Pages are where Stone.js meets React.
:::

### What goes in a component?

Anything that is:

* Reusable UI
* Stateless or local-stateful
* Declarative
* React-specific (hooks, effects, JSX)

✅ Yes:

```tsx title="app/components/ProfileCard/ProfileCard.tsx"
export const ProfileCard = ({ name }: { name: string }) => {
  return <div className="card">Welcome, {name}!</div>
}
```

❌ No:

* Avoid resolving services here
* Avoid accessing `event` or system context directly
* Don’t handle app-level logic inside components

Let the page do that.

### What goes in a page?

A page is a **Stone.js handler**. It:

* Handles the incoming event
* Fetches data via services
* Manages redirection, errors, and context
* Renders your components

```tsx title="app/pages/ProfilePage.tsx"
export class ProfilePage implements IComponentEventHandler<ReactIncomingEvent> {
  constructor(private readonly userService: UserService) {}

  async handle(event: ReactIncomingEvent) {
    return await this.userService.getProfile()
  }

  render({ data }: RenderContext) {
    return <ProfileCard name={data.name} />
  }
}
```

::: tip Fact
The page gives you logic. 
The component gives you visuals.
:::

## Pages Render Components, Not the Other Way Around

In Stone.js, your **pages own the orchestration**.
They live in the **functional dimension**. They intercept the event, resolve dependencies, process logic, and then, and only then, call React to render the interface.

That means:

* Your **pages render components**
* Your **components don’t call pages**, inject services, or interact with the container

This clear flow of responsibility keeps both sides clean.

### Flow: From Incoming Event to UI

```txt
Incoming Event → handle() → data → render() → React component
```

### A simple example

Let’s walk through a full example that demonstrates the boundary clearly.

#### `LoginPage` – Stone.js Page

This is where we:

* Intercept the route (`/login`)
* Inject the `AuthService`
* Handle submission logic
* Manage render lifecycle

```ts
export class LoginPage implements IComponentEventHandler<ReactIncomingEvent> {
  private readonly auth: AuthService

  constructor(container: IContainer) {
    this.auth = container.resolve(AuthService)
  }

  async login(user: UserLogin, setError: Dispatch<SetStateAction<boolean>>) {
    try {
      await this.auth.login(user)
    } catch {
      setError(true)
    }
  }

  render(): React.ReactNode {
    const [error, setError] = useState(false)

    return (
      <LoginForm
        error={error}
        onSubmit={async (user) => await this.login(user, setError)}
      />
    )
  }
}
```

This page does not render any HTML directly. It passes context to a **React component** and lets React take over.

#### `LoginForm` – Pure React Component

This is a reusable UI component.
It has no knowledge of Stone.js, lifecycle hooks, or services.

```ts
export const LoginForm: FC<LoginFormOptions> = ({ error, onSubmit }) => {
  const ref = useRef<UserLogin>({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(ref.current)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">Login failed</p>}

      <input
        type="email"
        placeholder="Email"
        onChange={e => ref.current.email = e.target.value}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => ref.current.password = e.target.value}
      />

      <button type="submit">Login</button>
    </form>
  )
}
```

This component is portable:

* You can use it in any React project
* It doesn’t rely on decorators, DI, or event logic
* It does one thing: render a form

Together, they demonstrate the **core principle of the Continuum**:

::: tip Fact
The functional dimension prepares the world.  
The view dimension reflects it.
:::

This is the optimal way to build a Stone.js app. It keeps your components clean, portable, and reusable.  
But you are free to choose your own structure and flow. Stone.js is flexible and lets you decide how to build your app.

## Writing Idiomatic Components

Stone.js doesn’t introduce a new component model.
It doesn’t replace React. It doesn’t abstract it. It respects it.

That means your components should follow the same practices you’d use in any high-quality React project.

### Use functional components

Stone.js is optimized for **React functional components**, for performance, readability, and compatibility with modern features like hooks, Suspense, and lazy loading.

```tsx
export const Counter = () => {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Click: {count}</button>
}
```

No decorators. No magic wrappers. Just React.

### Favor composition over inheritance

React is built around composition, and so is Stone.js.

```tsx
export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
```

You can build layout components, shared widgets, context providers, or entire feature modules, just like in any other app.

### Use standard React patterns

Stone.js does not block or alter:

* `useState`, `useEffect`, `useContext`
* CSS modules, Emotion, Tailwind, or any styling system
* Third-party component libraries like MUI, Chakra UI, or Headless UI

You can use them all, because your components are just… React components.

### Freedom ≠ Anarchy

While you’re free to design your view layer however you like, it’s still wise to:

* Keep components focused and declarative
* Avoid side effects inside render methods
* Use hooks instead of class-based logic
* Separate styles, logic, and structure when it improves clarity

You get the entire React ecosystem. And Stone.js stays out of your way.


## Best Practices

Designing components in a Stone.js application is no different from designing components in a well-structured React project. But the added **architectural clarity** provided by the Continuum means you can make better decisions about what belongs where.

Here are some guidelines to keep your components clean, maintainable, and fully decoupled from the system layer.

#### Organize your components outside of Stone.js

* Keep reusable UI in a `components/` folder
* Keep Stone.js pages in a separate `pages/` folder
* Avoid importing services or handlers into your components

```bash
src/
├── components/
│   └── Button/
├── pages/
│   └── HomePage.tsx
```

This keeps responsibilities isolated: components render, pages orchestrate.

#### Make components pure and declarative

* Use props to pass data and callbacks
* Avoid direct system access unless explicitly needed
* Favor composability, reusability, and clarity

```tsx
export const WelcomeBanner = ({ name }: { name: string }) => (
  <h2>Welcome, {name}</h2>
)
```

#### Use hooks for local behavior

Stone.js doesn’t restrict your use of:

* `useState`, `useEffect`, `useRef`, `useMemo`, etc.
* `useContext` for theming or composition
* External hooks libraries like React Query or Zustand (manually integrated)

You’re free to design your UI logic with modern React patterns.

#### Don’t resolve services inside components

Avoid doing this:

```tsx
// ❌ Bad practice
const router = useContext(StoneContext).container.resolve(Router)
```

Use this sparingly and only when your component truly needs to interact with application context. Prefer passing props instead.

#### Treat components as portable

Everything inside your `components/` folder should work:

* In a any React app
* In a plain CRA app
* In a test harness
* In isolation

That’s the beauty of the view dimension being free from framework constraints.

## Summary

In Stone.js, your components are truly your own.

They live entirely in the **view dimension**, untouched by framework constraints or system logic. You build them using the full power of React, hooks, composition, styling libraries, third-party tools, with zero interference.

This isn’t a compromise. It’s architecture done right.

Stone.js governs the system. React governs the view.
Pages act as the bridge, and components stay clean.

By:

* Keeping components outside the system
* Passing data and actions through props
* Writing pure, functional components
* Avoiding tight coupling with system logic

You gain the flexibility to evolve your UI **independently** of your infrastructure.

In the Continuum, your React skills are not replaced, they’re **respected**.
You stay free. You stay future-proof.

And your components? 
They stay **React**.
