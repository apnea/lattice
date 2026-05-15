/**
 * Shared skill discovery for opencode-lattice plugins.
 *
 * Provides the search paths and reading logic used by both the server plugin
 * (framework:xxx resolution) and the TUI plugin (slash command registration).
 */

import { readdir, readFile, stat } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

// ── Skill directory search paths ──────────────────────────────────────

export function skillSearchDirs(projectDir: string): string[] {
  const home = homedir()
  return [
    // opencode native: global
    join(home, ".config", "opencode", "skills", "lattice"),
    // opencode native: project
    join(projectDir, ".opencode", "skills", "lattice"),
    // opencode external compatibility
    join(home, ".agents", "skills"),
    join(projectDir, ".agents", "skills"),
    // Claude Code compatibility
    join(home, ".claude", "skills"),
    join(projectDir, ".claude", "skills"),
  ]
}

// ── Find a skill's SKILL.md by name ──────────────────────────────────

export async function findSkillDir(
  name: string,
  projectDir: string,
): Promise<string | null> {
  const dirs = skillSearchDirs(projectDir)
  for (const base of dirs) {
    const candidate = join(base, name)
    const skillFile = join(candidate, "SKILL.md")
    try {
      const s = await stat(skillFile)
      if (s.isFile()) return candidate
    } catch {
      // not found in this dir, try next
    }
  }
  return null
}

// ── Load SKILL.md content (strips YAML frontmatter) ──────────────────

export async function loadSkillMarkdown(skillDir: string): Promise<string | null> {
  const skillFile = join(skillDir, "SKILL.md")
  try {
    const raw = await readFile(skillFile, "utf-8")
    return raw.replace(/^---\n[\s\S]*?\n---\n*/, "").trim()
  } catch {
    return null
  }
}

// ── List files in skill directory (sampled, excludes SKILL.md) ───────

export async function listSkillFiles(
  skillDir: string,
  limit = 15,
): Promise<string[]> {
  try {
    const entries = await readdir(skillDir, { recursive: true, withFileTypes: false })
    return entries
      .filter((f) => typeof f === "string" && !f.endsWith("SKILL.md"))
      .map((f) => String(f))
      .slice(0, limit)
  } catch {
    return []
  }
}

// ── Build an inline skill block (mirrors opencode's skill tool format) ─

export async function buildSkillBlock(
  name: string,
  projectDir: string,
): Promise<string | null> {
  const skillDir = await findSkillDir(name, projectDir)
  if (!skillDir) return null

  const content = await loadSkillMarkdown(skillDir)
  if (!content) return null

  const baseUrl = pathToFileURL(skillDir).href
  const files = await listSkillFiles(skillDir)

  const fileLines = files.map((f) => `<file>${f}</file>`).join("\n")

  return [
    `<skill_content name="${name}">`,
    `# Skill: ${name}`,
    "",
    content,
    "",
    `Base directory for this skill: ${baseUrl}`,
    "Relative paths in this skill (e.g., references/) are relative to this base directory.",
    "",
    "<skill_files>",
    fileLines,
    "</skill_files>",
    "</skill_content>",
  ].join("\n")
}

// ── Discover all installed skills with metadata ──────────────────────

export interface SkillMeta {
  name: string
  description: string
}

export async function discoverSkills(projectDir: string): Promise<SkillMeta[]> {
  const dirs = skillSearchDirs(projectDir)
  const seen = new Set<string>()
  const skills: SkillMeta[] = []

  for (const base of dirs) {
    let entries: string[]
    try {
      entries = await readdir(base)
    } catch {
      continue
    }

    for (const entry of entries) {
      if (seen.has(entry)) continue
      const skillFile = join(base, entry, "SKILL.md")
      try {
        const s = await stat(skillFile)
        if (!s.isFile()) continue
      } catch {
        continue
      }

      const raw = await readFile(skillFile, "utf-8")
      const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ""
      const nameMatch = frontmatter.match(/^name:\s*(.+)$/m)
      const descMatch = frontmatter.match(/^description:\s*["']?(.+?)["']?\s*$/m)

      const name = nameMatch?.[1]?.trim() ?? entry
      const rawDesc = descMatch?.[1]?.trim() ?? ""
      const description = rawDesc.length > 80 ? rawDesc.slice(0, 77) + "..." : rawDesc

      if (name) {
        seen.add(entry)
        skills.push({ name, description })
      }
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}
