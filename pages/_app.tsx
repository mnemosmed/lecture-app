import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

const GTM_ID = "G-XSYZXG5P3M";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Inject GTM script only once
      if (!document.getElementById("gtm-script")) {
        const script = document.createElement("script");
        script.id = "gtm-script";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`;
        document.head.appendChild(script);

        const inlineScript = document.createElement("script");
        inlineScript.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GTM_ID}');`;
        document.head.appendChild(inlineScript);
      }
    }
  }, []);

  return (
    <>
      <Head>
        {/* Google Tag Manager (GTM) */}
        <meta name="google-tag-manager" content={GTM_ID} />
      </Head>
      <Component {...pageProps} />
      {/* GTM noscript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        ></iframe>
      </noscript>
    </>
  );
}
