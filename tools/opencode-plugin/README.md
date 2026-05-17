# @apnea/opencode-lattice

Lattice skill framework plugin for [opencode](https://opencode.ai). See the [Lattice](https://github.com/apnea/lattice) repo for the full framework.

Provides two capabilities:

1. **Server plugin** — resolves `` `framework:xxx` `` references in Lattice skill commands, inlining referenced skill content before the AI sees it. This is the mechanical equivalent of Claude Code's `framework:` resolution.

2. **TUI plugin** — registers all installed Lattice skills as slash commands in the autocomplete dropdown. Type `/` in a session to see skills like `/lattice-init`, `/code-forge`, `/review`, etc. Slash commands work both inside an active session and from the home screen (a new session is created automatically).

## Install

First, install the Lattice skills:

```bash
# Clone Lattice
git clone https://github.com/apnea/lattice.git

# Install skills globally for opencode
./lattice/tools/install.sh ~/.config/opencode/skills/lattice
```

Then install this plugin:

```bash
opencode plugin install @apnea/opencode-lattice
```

Or install from a local checkout:

```bash
opencode plugin install /path/to/lattice/tools/opencode-plugin
```

## Compatibility

The package declares `engines.opencode` in `package.json` for version compatibility checks. The plugin requires opencode >= 1.0.0.

## How it works

### Framework resolution (server)

Lattice skills reference other skills using `` `framework:skill-name` `` syntax. When a skill command is executed, this plugin intercepts the `command.execute.before` hook and replaces each reference with the full content of the referenced skill — including its base directory, file listing, and markdown body. Transitive references (atoms referencing other atoms) are resolved with up to 3 passes.

### Slash commands (TUI)

The TUI plugin discovers all installed skills at startup and registers each as a keymap command with a `slashName`. When selected from the autocomplete dropdown:

- **In an active session** — sends the command directly to the current session
- **On the home screen** — creates a new session, navigates to it, then sends the command

Errors are surfaced as toast notifications rather than failing silently.

### Skill search paths

Both plugins search for skills in these directories (in order):

- `~/.config/opencode/skills/lattice/` — opencode global
- `<project>/.opencode/skills/lattice/` — opencode project
- `~/.agents/skills/` — opencode external compatibility
- `<project>/.agents/skills/` — opencode external compatibility
- `~/.claude/skills/` — Claude Code compatibility
- `<project>/.claude/skills/` — Claude Code compatibility

First match wins; duplicate names are skipped.

## Development

```bash
cd /path/to/lattice/tools/opencode-plugin

# Build
npm run build

# Type check
npm run typecheck

# Run tests (requires Lattice skills installed at /tmp/lattice-plugin-test/.agents/skills/)
node test.mjs
```

## License

MIT
