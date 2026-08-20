/**
 * Represents the user making a request.
 * Extracted from JWT token.
 */
export interface Actor {
  userId: string;
  email: string;
  name: string;
  organisationId: string;
}
