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

async function sendCommand(api: any, sessionID: string, skillName: string) {
  api.client.session.command({
    sessionID,
    command: skillName,
    arguments: "",
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    api.ui.toast({ variant: "error", message: `/${skillName} failed: ${message}` })
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tui = async (api: any) => {
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
        api.ui.dialog.clear()

        const sessionID = currentSessionID(api)
        if (sessionID) {
          sendCommand(api, sessionID, skill.name)
          return
        }

        // No active session (e.g. on home screen) — create one, select it, then send the command
        api.client.session.create().then((result: any) => {
          const newID: string | undefined = result?.id ?? result?.data?.id
          if (!newID) {
            api.ui.toast({ variant: "error", message: `/${skill.name}: session created but ID not found in response` })
            return
          }
          api.client.tui.selectSession({ sessionID: newID }).then(() => {
            sendCommand(api, newID, skill.name)
          }).catch(() => {
            sendCommand(api, newID, skill.name)
          })
        }).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          api.ui.toast({ variant: "error", message: `/${skill.name}: failed to create session: ${message}` })
        })
      },
    })),
  })
}

export default { id: "opencode-lattice", tui }
