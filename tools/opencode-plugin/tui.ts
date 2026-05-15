import { discoverSkills } from "./skills.ts"

/**
 * opencode-lattice TUI plugin — registers Lattice skills as slash commands
 * in the autocomplete dropdown, so users can type `/lattice-init` etc.
 */

function currentSessionID(api: { route: { current: { name: string; params?: Record<string, unknown> } } }): string | undefined {
  const current = api.route.current
  if (current.name !== "session") return undefined
  const sessionID = current.params?.sessionID
  return typeof sessionID === "string" ? sessionID : undefined
}

const tui = async (api) => {
  const projectDir = api.state.path.directory
  const skills = await discoverSkills(projectDir)

  if (skills.length === 0) return

  api.keymap.registerLayer({
    commands: skills.map((skill) => ({
      name: `lattice.${skill.name}`,
      title: skill.description || skill.name,
      category: "Lattice",
      namespace: "palette" as const,
      slashName: skill.name,
      run() {
        const sessionID = currentSessionID(api)
        if (!sessionID) return
        api.ui.dialog.clear()
        void api.client.session.command({
          sessionID,
          command: skill.name,
          arguments: "",
        })
      },
    })),
  })
}

export default { id: "opencode-lattice", tui }
