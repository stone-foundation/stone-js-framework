# Function: autodetectStarters()

```ts
function autodetectStarters(cwd): ResolvedStarter[];
```

Auto-detects installed starter packages: any dependency whose `package.json` declares
`stone.starters`. This is the zero-config, plug-and-play path — install a starter pack and
it shows up, without passing any link.

## Parameters

### cwd

`string`

The project directory to scan.

## Returns

[`ResolvedStarter`](../interfaces/ResolvedStarter.md)[]

The auto-detected starters.
