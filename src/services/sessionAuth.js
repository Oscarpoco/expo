import { signInAnonymously } from 'firebase/auth'

import { auth } from '../firebase.js'

/**
 * Lightweight session after a member verifies or registers.
 *
 * Requires Anonymous sign-in enabled in Firebase Console → Authentication → Sign-in method.
 */
export async function signInMemberSession() {
  await signInAnonymously(auth)
}
