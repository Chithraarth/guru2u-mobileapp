interface UserLike {
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

/** First name from the display name, else the email's local part. */
export function displayNameOf(user: UserLike | null): string {
  if (user?.displayName) return user.displayName.split(' ')[0];
  if (user?.email) {
    const local = user.email.split('@')[0];
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return '';
}

/** The best contact line for a user: email, then phone. */
export function contactOf(user: UserLike | null): string {
  return user?.email ?? user?.phoneNumber ?? '';
}
