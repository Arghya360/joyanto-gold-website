export async function submitFooterNewsletter(email: string): Promise<void> {
  if (!email.trim()) {
    throw new Error('Enter a valid email address.');
  }

  await new Promise<void>(resolve => window.setTimeout(resolve, 350));
}
