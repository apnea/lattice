# opencode-lattice

Lattice skill framework plugin for [opencode](https://opencode.ai).

Provides two capabilities:

1. **Server plugin** — resolves `` `framework:xxx` `` references in Lattice skill commands, inlining referenced skill content before the AI sees it. This is the mechanical equivalent of Claude Code's `framework:` resolution.

2. **TUI plugin** — registers all installed Lattice skills as slash commands in the autocomplete dropdown. Type `/` in a session to see skills like `/lattice-init`, `/code-forge`, `/review`, etc.

## Install

First, install the Lattice skills:

```bash
# Clone Lattice
git clone https://github.com/nichochar/lattice.git

# Install skills globally for opencode
./lattice/tools/install.sh ~/.config/opencode/skills/lattice
```

Then install this plugin:

```bash
opencode plugin opencode-lattice
```

Or install from a local checkout:

```bash
opencode plugin /path/to/lattice/tools/opencode-plugin
```

## How it works

### Framework resolution (server)

Lattice skills reference other skills using `` `framework:skill-name` `` syntax. When a skill command is executed, this plugin intercepts the `command.execute.before` hook and replaces each reference with the full content of the referenced skill — including its base directory, file listing, and markdown body. Transitive references (atoms referencing other atoms) are resolved with up to 3 passes.

### Slash commands (TUI)

The TUI plugin discovers all installed skills at startup and registers each as a keymap command with a `slashName`. When selected from the autocomplete dropdown, it calls the opencode session command API to execute the skill.

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
# Run tests (requires Lattice skills installed at /tmp/lattice-plugin-test/.agents/skills/)
cd /path/to/lattice/tools/opencode-plugin
node test.mjs
```

## License

MIT
