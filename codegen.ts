import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    process.env.WORDPRESS_API_URL ||
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
      './schema.graphql',
  ],
  ignoreNoDocuments: true,
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/graphql/__gen__/': {
      preset: 'client',
      plugins: [],
      config: {
        documentMode: 'string',
      },
    },
  },
};

export default config;
