"use client";

import Script from "next/script";

export function FacebookSDK() {
  return (
    <Script
      id="facebook-sdk"
      strategy="lazyOnload"
      src="https://connect.facebook.net/en_US/sdk.js"
      onLoad={() => {
        window.FB?.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v21.0",
        });
      }}
    />
  );
}

declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string | undefined;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      getLoginStatus: (
        callback: (response: {
          status: "connected" | "not_authorized" | "unknown";
          authResponse?: {
            accessToken: string;
            expiresIn: string;
            signedRequest: string;
            userID: string;
          };
        }) => void
      ) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        options: { scope: string }
      ) => void;
      logout: (callback?: () => void) => void;
      api: (path: string, callback: (response: unknown) => void) => void;
    };
  }
}
