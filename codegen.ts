import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: ["./schema.graphql"],
  ignoreNoDocuments: true,
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/graphql/__gen__/": {
      preset: "client",
      plugins: [],
      config: {
        documentMode: "string",
      },
    },
  },
};

export default config;
