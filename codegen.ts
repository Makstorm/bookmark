import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: ['./graphql/schema.graphql'],
  documents: ['./graphql/**/*.graphql'],
  overwrite: true,
  generates: {
    './graphql/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        commentDescriptions: true // Adds comments as descriptions in the schema output
      }
    },
    './__generated__/graphql.tsx': {
      plugins: [
        'typescript', // Generates TypeScript types for your schema
        'typescript-operations', // Generates TypeScript types for your queries, mutations, and subscriptions
        'typescript-react-apollo' // Generates Apollo React hooks
      ],
      config: {
        withHooks: true, // Generates hooks for queries and mutations
        reactApolloVersion: 3, // Specify Apollo Client v3
        maybeValue: 'T | undefined' // Use `T | undefined` for optional values
      }
    }
  },
  ignoreNoDocuments: true // Avoids errors if no GraphQL documents are found
}

export default config
