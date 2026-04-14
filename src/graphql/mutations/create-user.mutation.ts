export const CREATE_USER_MUTATION = `
  mutation CreateUser(
    $username: String!
    $email: String!
    $password: String!
    $displayName: String
    $firstName: String
    $lastName: String
  ) {
    createUser(
      input: {
        username: $username
        email: $email
        password: $password
        displayName: $displayName
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      user {
        id
      }
    }
  }
`;

export interface CreateUserMutationData {
  createUser?: {
    user?: {
      id?: string | null;
    } | null;
  } | null;
}

export interface CreateUserMutationVariables extends Record<string, unknown> {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
}