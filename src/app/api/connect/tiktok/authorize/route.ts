import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;

// Generate a random code verifier for PKCE
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Generate code challenge from verifier using SHA-256
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  // Convert to base64url format
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!TIKTOK_CLIENT_KEY) {
    console.error("TIKTOK_CLIENT_KEY is not configured");
    return NextResponse.json({ error: "TikTok configuration error" }, { status: 500 });
  }

  // Build the redirect URI based on the current request
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/connect/tiktok/callback`;

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Generate a random state for CSRF protection
  const state = crypto.randomUUID();

  // TikTok scopes to request
  const scopes = [
    "user.info.basic",
    "user.info.profile",
    "user.info.stats",
    "video.list",
  ].join(",");

  // Build TikTok authorization URL
  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", TIKTOK_CLIENT_KEY);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  // Create response with redirect
  const response = NextResponse.redirect(authUrl.toString());

  // Store code verifier in a secure HTTP-only cookie for the callback
  response.cookies.set("tiktok_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
