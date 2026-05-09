import { defineConfig } from "@trigger.dev/sdk";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const projectRef = process.env.TRIGGER_PROJECT_REF || process.env.TRIGGER_DEV_PROJECT_REF;

if (!projectRef) {
  throw new Error("Missing Trigger.dev Project Ref. Please set TRIGGER_PROJECT_REF or TRIGGER_DEV_PROJECT_REF in your environment variables.");
}

export default defineConfig({
  project: projectRef,
  maxDuration: 3600,
  dirs: ["./trigger"],
});