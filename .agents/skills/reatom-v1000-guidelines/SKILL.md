---
name: reatom-v1000-guidelines
description: Project-specific Reatom v1000 conventions for atoms, computed values, actions, async data, forms, routing, React bindings, and undefined initial state. Use when editing or reviewing Reatom code in this frontend repo, including @reatom/core, @reatom/react, reatomComponent, reatomRoute, reatomForm, withAsyncData, withAsync, wrap, effects, and atomized models.
---

# Reatom v1000 Guidelines

Use these rules when implementing or reviewing Reatom code in this repo.

## Core Model

- `atom` manages immutable state.
- `computed` is lazy derived state with dependency tracking.
- `effect` auto-subscribes for side effects and cleans up on abort/unmount.
- `action` is a callable event and observable flow.
- `extend` attaches capabilities, actions, hooks, or middleware.
- Always name atoms, actions, computeds, routes, and forms for tracing.
- Treat atom values as possibly `undefined` when atoms are created without an initial value, even if the backend field is required.

## Async Data

Use `computed(async () => ...)` extended by `withAsyncData()` by default for idempotent reads/query data:

```ts
const list = computed(async () => {
  return await wrap(api.getList({ page: page() }));
}, 'list').extend(withAsyncData({ initState: [] }));
```

`withAsyncData` adds `data()`, `ready()`, `error()`, `status()`, `retry()`, and `reset()`. It also uses abort behavior to prevent races.

Use `action(async () => ...)` extended by `withAsync()` for mutations and commands:

```ts
const submit = action(async (payload: FormValues) => {
  return await wrap(api.submit(payload));
}, 'form.submit').extend(withAsync());
```

## Wrap Rules

Use `wrap` on async boundaries that interact with Reatom context.

Good:

```ts
const response = await wrap(fetch('/api/me'));
const data = await wrap(response.json());
fetch(url).then(wrap((res) => status.set(res.statusText)));
```

Avoid:

```ts
await wrap(fetch(url)).then((res) => res.json());
fetch(url).then((res) => status.set(res.statusText));
```

Do not wrap callbacks passed directly to Reatom hooks such as `withCallHook`.

## State Patterns

- Use `atom.set(value)` or `atom.set((state) => nextState)` for local updates.
- Avoid one-line forwarding actions around `atom.set`.
- Use `computed` for derived state.
- Use `effect` only for side effects.
- Use `ifChanged` inside `effect` or `computed` when only actual value changes matter.
- Use `getCalls(action)` only for calls in the current batch; it is not history.

## Primitives

Prefer semantic primitives where useful:

```ts
const isOpen = reatomBoolean(false, 'modal.isOpen');
isOpen.setTrue();
isOpen.setFalse();
isOpen.toggle();

const role = reatomEnum(['hr', 'recruiter', 'manager', 'employee'], 'user.role');
role.setEmployee();
```

## Atomization

- Keep readonly backend fields as plain values.
- Lift mutable fields into atoms.
- Create per-item actions/atoms in factories.
- Name dynamic atoms with `#${id}` when useful, for example `users#${id}.name`.
- Prefer atomizing backend entities with local state/actions over normalizing backend data only to create separate UI-state maps.

## Lifecycle And Events

- Use `withConnectHook` to start polling, subscriptions, websockets, or external listeners only while data is subscribed.
- Use `onEvent` instead of raw `addEventListener` when event handling should be abort-aware.
- Use `take(actionOrAtom)` when an async flow needs to await the next action call or atom update.
- Use `withAbort()` for last-in-win async actions; use other modes only when intentional.

## Routing

- Use `reatomRoute` for route state, typed params, search params, loaders, and render composition.
- Use layout routes with `layout: true` and `outlet()`.
- Prefer route `render` over manual `if (!route.match()) return null` checks in components.
- Route loaders are async computeds with `withAsyncData` behavior and auto-abort on navigation.
- Use zod or another Standard Schema for params/search validation when URL values need parsing.

## React Binding

- Use `reatomComponent` for components that read Reatom state.
- Use `bindField` for Reatom form fields.
- Keep UI defensive around async or initially missing atom data.
