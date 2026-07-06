export const DEMO_MODE =
  process.env.DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_USER_COOKIE = "demo-user";

export function isDemoMode(): boolean {
  return DEMO_MODE;
}
