import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import React, { useEffect } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "./tailwind.css" },
  { rel: "stylesheet", href: "./src/custom/custom.css" },
]; 

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <img src="./src/custom/preloader.gif" alt="Loading..." className="cls-preloader"/>
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // This effect will run when the component mounts
    const handleLoad = () => {
      setIsLoading(false); // Hide loader when content is loaded
    };

    // Check if the document is already loaded
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100">
        {isLoading ? <Loader /> : <Outlet />}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
