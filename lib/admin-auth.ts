import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "hcs-admin-session";
export const ADMIN_LOGIN_PATH = "/admin-login";

const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

interface AdminSessionPayload {
  username: string;
  issuedAt: number;
}

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD?.trim() || "";
  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET?.trim() || password || "";

  return {
    username,
    password,
    sessionSecret,
    isConfigured: Boolean(password && sessionSecret),
  };
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function encodePayload(payload: AdminSessionPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(value: string) {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(decoded) as AdminSessionPayload;
  } catch {
    return null;
  }
}

function buildLoginUrl(nextPath?: string) {
  if (!nextPath) {
    return ADMIN_LOGIN_PATH;
  }

  const search = new URLSearchParams({ next: nextPath });
  return `${ADMIN_LOGIN_PATH}?${search.toString()}`;
}

export function createAdminSessionToken(username: string) {
  const { sessionSecret } = getAdminConfig();
  const payload = encodePayload({
    username,
    issuedAt: Date.now(),
  });
  const signature = signPayload(payload, sessionSecret);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  const { sessionSecret, username, isConfigured } = getAdminConfig();

  if (!token || !isConfigured) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(payload, sessionSecret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return false;
  }

  const decodedPayload = decodePayload(payload);

  if (!decodedPayload || decodedPayload.username !== username) {
    return false;
  }

  return Date.now() - decodedPayload.issuedAt <= ADMIN_SESSION_MAX_AGE * 1000;
}

export function isAdminConfigured() {
  return getAdminConfig().isConfigured;
}

export function validateAdminCredentials(
  submittedUsername: string,
  submittedPassword: string,
) {
  const { username, password, isConfigured } = getAdminConfig();

  if (!isConfigured) {
    return {
      ok: false,
      message:
        "Admin auth is not configured yet. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET to your env.",
    };
  }

  if (
    submittedUsername.trim() !== username ||
    submittedPassword !== password
  ) {
    return {
      ok: false,
      message: "The admin username or password is incorrect.",
    };
  }

  return { ok: true, message: "" };
}

export async function setAdminSessionCookie(username: string) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(username), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSessionToken(token)) {
    return null;
  }

  return {
    username: getAdminConfig().username,
  };
}

export async function requireAdminSession(nextPath = "/admin") {
  const session = await getAdminSession();

  if (!session) {
    redirect(buildLoginUrl(nextPath));
  }

  return session;
}

export function isAdminRequestAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  return verifyAdminSessionToken(token);
}

export function buildAdminRedirectPath(pathname: string, search = "") {
  return buildLoginUrl(`${pathname}${search}`);
}
