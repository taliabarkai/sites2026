/**
 * Stand-in for authentication.
 *
 * Shaped like the endpoints that will replace it: async, in credentials, out a
 * discriminated result rather than a thrown error — a wrong password is an
 * ordinary answer, not an exception. Swapping these for real calls should not
 * touch the modal.
 */

export interface AuthUser {
  firstName: string
  lastName:  string
  email:     string
}

export type SignInResult =
  | { ok: true;  user: AuthUser }
  | { ok: false; reason: 'invalid_credentials' }

export type CreateAccountResult =
  | { ok: true;  user: AuthUser }
  | { ok: false; reason: 'email_taken' }

export interface CreateAccountData {
  firstName: string
  lastName:  string
  email:     string
  password:  string
}

/** The one account that signs in, matching the order the tracker knows about. */
const KNOWN_EMAIL = 'johndoe@gmail.com'

const KNOWN_USER: AuthUser = {
  firstName: 'John',
  lastName:  'Doe',
  email:     KNOWN_EMAIL,
}

/** Long enough to be worth typing; the real rule will come from the backend. */
export const MIN_PASSWORD_LENGTH = 8

/** Stand-in for network latency, so the loading state is actually reachable. */
const AUTH_DELAY_MS = 700

export async function signIn(email: string, password: string): Promise<SignInResult> {
  await new Promise(resolve => setTimeout(resolve, AUTH_DELAY_MS))

  const matches =
    email.trim().toLowerCase() === KNOWN_EMAIL &&
    password.length >= MIN_PASSWORD_LENGTH

  return matches ? { ok: true, user: KNOWN_USER } : { ok: false, reason: 'invalid_credentials' }
}

export async function createAccount(data: CreateAccountData): Promise<CreateAccountResult> {
  await new Promise(resolve => setTimeout(resolve, AUTH_DELAY_MS))

  /* The known account already exists, which is what makes the "already
     registered" path reachable without a backend. */
  if (data.email.trim().toLowerCase() === KNOWN_EMAIL) {
    return { ok: false, reason: 'email_taken' }
  }

  return {
    ok: true,
    user: { firstName: data.firstName, lastName: data.lastName, email: data.email.trim() },
  }
}
