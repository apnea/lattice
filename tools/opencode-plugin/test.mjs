/**
 * Test harness for opencode-lattice plugin.
 *
 * Simulates what opencode does: loads the plugin, creates mock command parts,
 * fires the hook, and verifies the output. No running opencode instance needed.
 *
 * Usage: node test.mjs
 *
 * Requires Lattice skills available at /tmp/lattice-plugin-test/.agents/skills/
 * (symlink from ~/.config/opencode/skills/lattice/ works).
 */

import { readFileSync } from "node:fs"
import { join } from "node:path"

const PROJECT_DIR = "/tmp/lattice-plugin-test"
const SKILLS_DIR = join(PROJECT_DIR, ".agents", "skills")

function readSkill(name) {
  try {
    const raw = readFileSync(join(SKILLS_DIR, name, "SKILL.md"), "utf-8")
    return raw.replace(/^---\n[\s\S]*?\n---\n*/, "").trim()
  } catch {
    return null
  }
}

// ── Import and instantiate the server plugin ────────────────────────────

const pluginModule = await import("./index.ts")
const pluginFactory = pluginModule.default.server
const hooks = await pluginFactory(
  { directory: PROJECT_DIR, worktree: PROJECT_DIR },
  {}
)

const hook = hooks["command.execute.before"]

// ── Test runner ────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ok ${message}`)
    passed++
  } else {
    console.log(`  FAIL ${message}`)
    failed++
  }
}

// ── Test 1: Molecule with multiple framework: references ────────────────

console.log("\nTest 1: /code-forge (molecule with 8 atom references)")

const codeForgeContent = readSkill("code-forge")
const parts1 = [{ type: "text", text: codeForgeContent }]

await hook(
  { command: "code-forge", sessionID: "test", arguments: "" },
  { parts: parts1 }
)

const result1 = parts1[0].text

assert(result1.includes(`<skill_content name="clean-code">`), "clean-code atom inlined")
assert(result1.includes(`<skill_content name="architecture">`), "architecture atom inlined")
assert(result1.includes(`<skill_content name="knowledge-priming">`), "knowledge-priming atom inlined")
assert(result1.includes(`<skill_content name="domain-driven-design">`), "domain-driven-design atom inlined")
assert(result1.includes(`<skill_content name="secure-coding">`), "secure-coding atom inlined")
assert(result1.includes(`<skill_content name="test-quality">`), "test-quality atom inlined")
assert(result1.includes(`<skill_content name="context-anchoring">`), "context-anchoring atom inlined")
assert(result1.includes(`<skill_content name="collaborative-judgment">`), "collaborative-judgment atom inlined")
assert(!result1.includes("`framework:"), "no unresolved framework: references remain")
assert(result1.includes("Base directory for this skill:"), "base directory metadata injected")
assert(result1.includes("<file>references/defaults.md</file>"), "references/defaults.md listed in skill files")

// ── Test 2: Standalone atom (no framework: references) ─────────────────

console.log("\nTest 2: /clean-code (standalone atom, no references)")

const cleanCodeContent = readSkill("clean-code")
const originalLength = cleanCodeContent.length
const parts2 = [{ type: "text", text: cleanCodeContent }]

await hook(
  { command: "clean-code", sessionID: "test", arguments: "" },
  { parts: parts2 }
)

assert(parts2[0].text.length === originalLength, "content unchanged (no framework: refs to resolve)")

// ── Test 3: Refiner (no framework: references) ──────────────────────────

console.log("\nTest 3: /architecture-refiner (refiner, no references)")

const refinerContent = readSkill("architecture-refiner") || ""
const parts3 = [{ type: "text", text: refinerContent }]

await hook(
  { command: "architecture-refiner", sessionID: "test", arguments: "" },
  { parts: parts3 }
)

assert(!parts3[0].text.includes("<skill_content"), "no skill content injected for refiner")

// ── Test 4: Missing skill reference ─────────────────────────────────────

console.log("\nTest 4: Missing skill reference")

const parts4 = [{ type: "text", text: "Use `framework:nonexistent-skill` for testing" }]

await hook(
  { command: "test", sessionID: "test", arguments: "" },
  { parts: parts4 }
)

assert(parts4[0].text.includes('lattice: skill "nonexistent-skill" not found'), "missing skill gets fallback comment")
assert(parts4[0].text.includes("`framework:nonexistent-skill`"), "original reference preserved for AI to see")

// ── Test 5: Subtask part type ───────────────────────────────────────────

console.log("\nTest 5: Subtask part type")

const parts5 = [
  {
    type: "subtask",
    prompt: codeForgeContent,
    agent: "general",
    description: "test",
    command: "code-forge",
    model: { providerID: "test", modelID: "test" },
  },
]

await hook(
  { command: "code-forge", sessionID: "test", arguments: "" },
  { parts: parts5 }
)

assert(parts5[0].prompt.includes(`<skill_content name="clean-code">`), "subtask prompt resolved correctly")
assert(!parts5[0].prompt.includes("`framework:"), "no unresolved references in subtask prompt")

// ── Test 6: Multiple text parts ─────────────────────────────────────────

console.log("\nTest 6: Multiple parts, only one with framework: refs")

const parts6 = [
  { type: "text", text: "Some user context" },
  { type: "text", text: codeForgeContent },
  { type: "text", text: "More user context" },
]

await hook(
  { command: "code-forge", sessionID: "test", arguments: "" },
  { parts: parts6 }
)

assert(parts6[0].text === "Some user context", "first text part unchanged")
assert(parts6[1].text.includes(`<skill_content name="clean-code">`), "second text part resolved")
assert(parts6[2].text === "More user context", "third text part unchanged")

// ── Test 7: All molecules resolve ───────────────────────────────────────

console.log("\nTest 7: All molecules resolve their references")

const molecules = [
  "lattice-init",
  "requirement-forge",
  "design-blueprint",
  "code-forge",
  "bug-fix",
  "refactor-safely",
  "review",
  "architecture-compass",
]

for (const mol of molecules) {
  const content = readSkill(mol)
  if (!content) {
    assert(false, `${mol} - SKILL.md not found`)
    continue
  }
  const parts = [{ type: "text", text: content }]
  await hook(
    { command: mol, sessionID: "test", arguments: "" },
    { parts }
  )
  const hasUnresolved = parts[0].text.includes("`framework:")
  assert(!hasUnresolved, `${mol} - all references resolved`)
}

// ── Test 8: Shared module ───────────────────────────────────────────────

console.log("\nTest 8: Shared skills module")

const { discoverSkills, findSkillDir, skillSearchDirs } = await import("./skills.ts")

const dirs = skillSearchDirs(PROJECT_DIR)
assert(dirs.length > 0, "skillSearchDirs returns paths")

const skillDir = await findSkillDir("clean-code", PROJECT_DIR)
assert(skillDir !== null, "findSkillDir finds clean-code")

const skills = await discoverSkills(PROJECT_DIR)
assert(skills.length > 0, "discoverSkills finds skills")
assert(skills.some((s) => s.name === "clean-code"), "discoverSkills includes clean-code")
assert(skills.some((s) => s.name === "lattice-init"), "discoverSkills includes lattice-init")
assert(skills.every((s) => typeof s.description === "string"), "all skills have descriptions")

// ── Summary ────────────────────────────────────────────────────────────

console.log(`\n${"=".repeat(50)}`)
console.log(`  ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log("  FAILURES DETECTED")
  process.exit(1)
} else {
  console.log("  ALL TESTS PASSED")
}
