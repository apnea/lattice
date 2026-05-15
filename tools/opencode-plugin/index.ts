import { buildSkillBlock } from "./skills.ts"

/**
 * opencode-lattice server plugin — resolves `framework:xxx` skill references
 * in Lattice skill commands, inlining referenced skill content before the
 * AI sees it.
 *
 * This is the mechanical equivalent of Claude Code's framework: resolution,
 * adapted for opencode's plugin system.
 */

// ── Resolve all framework:xxx references in a template ────────────────

const FRAMEWORK_RE = /`framework:([a-z0-9-]+)`/g

async function resolveTemplate(
  template: string,
  projectDir: string,
): Promise<string> {
  const cache = new Map<string, string | null>()
  const MAX_PASSES = 3

  let result = template
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const names = new Set<string>()
    for (const [, name] of result.matchAll(FRAMEWORK_RE)) {
      names.add(name)
    }
    if (names.size === 0) break

    for (const name of names) {
      if (!cache.has(name)) {
        cache.set(name, await buildSkillBlock(name, projectDir))
      }
    }

    result = result.replace(FRAMEWORK_RE, (fullMatch, name: string) => {
      const block = cache.get(name)
      if (block) return block
      return `<!-- lattice: skill "${name}" not found -->\n${fullMatch}`
    })
  }

  return result
}

// ── Plugin entry point ────────────────────────────────────────────────

export default {
  server: async function LatticePlugin(input) {
    return {
      "command.execute.before": async (cmd, output) => {
        for (const part of output.parts) {
          if (part.type === "text" && typeof part.text === "string") {
            if (!part.text.includes("framework:")) continue
            part.text = await resolveTemplate(part.text, input.directory)
          }
          if (part.type === "subtask" && typeof part.prompt === "string") {
            if (!part.prompt.includes("framework:")) continue
            part.prompt = await resolveTemplate(part.prompt, input.directory)
          }
        }
      },
    }
  },
}
