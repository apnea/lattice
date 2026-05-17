import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "index.ts",
    tui: "tui.ts",
    skills: "skills.ts",
  },
  format: ["esm"],
  dts: {
    resolve: true,
  },
  clean: true,
  splitting: false,
  sourcemap: true,
})
