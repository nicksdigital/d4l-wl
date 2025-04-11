import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* CSP Meta Tag - This is a fallback in case the headers in next.config.js don't work */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="
            default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;
            script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob:;
            style-src * 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src * 'self' https://fonts.gstatic.com data:;
            img-src * 'self' data: blob:;
            media-src * 'self' data: blob:;
            connect-src * 'self' https://* wss://* http://* ws://* data:;
            frame-src * 'self';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            upgrade-insecure-requests;
          "
        />
        
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Fonts */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </Head>
      <body className="bg-gray-900 text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
