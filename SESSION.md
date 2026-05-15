# Lattice x opencode — Session State

Date: 2025-05-13

## What We Did

### 1. Explored the Lattice repo
- Located at `/home/pete/src/lattice/`
- Framework of composable AI skills in three tiers: atoms (10), molecules (8), refiners (7)
- Designed for Claude Code's plugin system, uses `framework:xxx` syntax for skill composition
- Pipeline: `requirement-forge → design-blueprint → code-forge → review`
- Living context layer in `.lattice/` folder accumulates across sessions

### 2. Created documentation
- `/home/pete/src/lattice/DIAGRAMS.md` — 10 Mermaid diagrams explaining architecture, pipeline, data flow
- `/home/pete/src/lattice/walkthrough.html` — collapsible HTML walkthrough (adding Password Reset to existing .NET service)
- `/home/pete/src/lattice/walkthrough-greenfield.html` — collapsible HTML walkthrough (building LinkStash from scratch, Python/FastAPI, hexagonal architecture, multi-epic requirement-forge)

### 3. Researched opencode plugin system
- opencode source at `/home/pete/src/opencode/`
- Plugin interface: export default `{ server: async (input) => Hooks }`
- `command.execute.before` hook lets plugins modify command parts before AI sees them
- opencode has built-in skill discovery: scans `~/.agents/skills/**/SKILL.md`, `.claude/skills/**/SKILL.md`, custom paths
- Skills auto-register as slash commands
- Skill content injected as text parts in user messages
- Plugin can load `.ts` directly, no build step needed
- Can be loaded from `file:///` paths in opencode.json

### 4. Built the opencode-lattice plugin
- `/home/pete/src/lattice/tools/opencode-plugin/index.ts` (~165 lines)
- `/home/pete/src/lattice/tools/opencode-plugin/package.json`
- `/home/pete/src/lattice/tools/opencode-plugin/test.mjs` (28 tests, all passing)

**What the plugin does:**
- Hooks `command.execute.before`
- Scans for `` `framework:xxx` `` references in skill content
- Loads referenced skill's SKILL.md from `~/.agents/skills/xxx/` or `{project}/.agents/skills/xxx/`
- Wraps each with base directory metadata and file listing (same format as opencode's built-in `skill` tool)
- Replaces references with inline content blocks
- Handles transitive references (atoms referencing other atoms) with up to 3 passes
- Caches skills so each is loaded once
- Handles both text parts (standard mode) and subtask parts
- Missing skills get a comment fallback, nothing breaks

**What we did NOT change:**
- Zero modifications to any Lattice source files (all 25 SKILL.md files untouched)
- install.sh untouched

## Current State of Files

```
/home/pete/src/lattice/
├── DIAGRAMS.md                          ← new (Mermaid diagrams)
├── walkthrough.html                     ← new (existing-codebase walkthrough)
├── walkthrough-greenfield.html          ← new (greenfield walkthrough)
├── tools/
│   ├── install.sh                       ← unchanged
│   └── opencode-plugin/                 ← new
│       ├── index.ts                     ← the plugin (165 lines)
│       ├── package.json                 ← npm package definition
│       └── test.mjs                     ← 28 tests, all passing
├── skills/                              ← unchanged
│   ├── atoms/ (10 skills)
│   ├── molecules/ (8 skills)
│   └── refiners/ (7 skills)
└── docs/                                ← unchanged
```

## To Do Next

### Immediate: test the plugin live
1. Run `./tools/install.sh` (defaults to `~/.config/opencode/skills/lattice/`)
2. Add to `~/.config/opencode/opencode.json`:
   ```json
   "plugin": ["opencode-codebase-index", "opencode-throughput", "file:///home/pete/src/lattice/tools/opencode-plugin"]
   ```
3. Restart opencode
4. Try `/code-forge` or `/lattice-init` and verify the AI receives composed content
5. Verify config resolution works (the AI reads `.lattice/config.yaml`, resolves overlays)

### If live testing reveals issues
- The `framework:xxx` regex is `` /`framework:([a-z0-9-]+)`/g `` — if Lattice uses variants without backticks or with different casing, the regex needs adjustment
- Config resolution relies on the AI following SKILL.md instructions to read `.lattice/config.yaml` and resolve overlay/override — if the AI skips this, may need to inject a preamble

### Potential follow-ups
- Add opencode-specific install instructions to Lattice README
- Consider contributing the plugin back to the Lattice repo as a PR
- If config resolution is unreliable, add a second hook that pre-resolves `.lattice/config.yaml` and injects the resolved atom rules

## Key Decisions Made
- Install target: `~/.config/opencode/skills/lattice/` (opencode native global skill dir, with `lattice` subdirectory for namespace)
- Plugin resolves `framework:xxx` mechanically, not via AI interpretation
- Base directory metadata injected (not inlining `references/defaults.md`) to preserve config resolution logic
- Transitive resolution (atoms referencing atoms) handled with iterative passes, max 3
- No changes to Lattice source files — plugin is a pure adapter
