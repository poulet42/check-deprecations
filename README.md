# check-deprecations

Scan a source file for usage of symbols marked `@deprecated` in their JSDoc. Outputs nothing and exits `0` when the file is clean; prints each hit and exits `1` when deprecated usage is found.

Relies on TypeScript's language service, so it understands type resolution, re-exports, and overloads — not just grep.

## Installation

```bash
npm install -g check-deprecations
```

Or run without installing:

```bash
npx check-deprecations <file>
```

## Usage

```
check-deprecations <file>
```

**Exit codes**

| Code | Meaning |
|------|---------|
| `0` | No deprecated usage |
| `1` | Deprecated usage found |
| `2` | Error (file not found, missing argument) |

**Example**

```
$ check-deprecations src/api/client.ts
src/api/client.ts:12:3 - 'sendRequest' is deprecated. Use 'fetch' instead.
  sendRequest(url, opts);

src/api/client.ts:27:1 - The signature '(cb: Callback): void' of 'connect' is deprecated.
  connect(handleResponse);
```

If the file is clean, nothing is printed.

## TypeScript / JavaScript support

The tool automatically looks for a `tsconfig.json` or `jsconfig.json` walking up from the target file and uses its compiler options. If none is found it defaults to `allowJs + checkJs`, so plain `.js` files work too.

## Claude Code skill

This package ships a Claude Code skill at [`skills/SKILL.md`](skills/SKILL.md). Install it with [dotagents](https://github.com/getsentry/dotagents):

```bash
npx @sentry/dotagents add poulet42/check-deprecations
```

Or declare it manually in `agents.toml`:

```toml
[[skills]]
name = "check-deprecations"
source = "poulet42/check-deprecations"
path = "skills"
```

Then run:

```bash
npx @sentry/dotagents install
```

Once installed, ask Claude to check a file for deprecated usage:

```
/check-deprecations src/api/client.ts
```
