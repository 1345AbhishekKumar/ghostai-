import { task } from "@trigger.dev/sdk";

interface HelloWorldPayload {
  name: string;
}

interface HelloWorldResult {
  message: string;
}

export const helloWorld = task({
  id: "hello-world",
  run: async (payload: HelloWorldPayload): Promise<HelloWorldResult> => {
    return {
      message: `Hello, ${payload.name}!`,
    };
  },
});