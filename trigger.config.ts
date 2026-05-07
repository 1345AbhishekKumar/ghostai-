import { defineConfig } from "@trigger.dev/sdk";

const projectRef = process.env.NODE_ENV === "production" ? process.env.TRIGGER_PROJECT_REF : process.env.TRIGGER_DEV_PROJECT_REF;

if (!projectRef) {
  throw new Error("Set TRIGGER_PROJECT_REF before running Trigger.dev.");
}

export default defineConfig({
  project: projectRef,
  maxDuration: 3600,
  dirs: ["./trigger"],
});