
# Shopify Remix Template: Setup Process For Non-Embedded App

Follow these steps to set up your Shopify Remix template for a non-embedded app:

### Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.

## Installation

```bash
npm install -g @shopify/cli@latest
npm install
npx prisma generate
npm run dev
```

## Additional Non Embedded App Configuration (Optional)

### 1. Update `shopify.server.ts`

```ts
const shopify = shopifyApp({
  isEmbeddedApp: false,
  forceRedirect: false,
});
```

### 2. Update `app.tsx`

```tsx
<AppProvider isEmbeddedApp={false} apiKey={apiKey}>
```

### 3. Update `shopify.app.toml`

```toml
embedded = false
```

## Shopify Partner Account Configuration

- Go to [Shopify Partners](https://partners.shopify.com)
- Navigate to **Apps** -> **Configuration**
- Under **Embedded in Shopify admin**, set **Embed app in Shopify admin** to **false**

## Remove Usage of Shopify App Bridge

### 1. In `app.tsx` (inside `app/routes`)

- Remove the following import:
  ```tsx
  import { NavMenu } from "@shopify/app-bridge-react";
  ```
- Remove any usage of `<NavMenu>`

### 2. In `app._index.tsx` (inside `app/routes`)

- Remove the following imports:
  ```tsx
  import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
  ```
- Remove all usage of `<TitleBar>` and `<useAppBridge>`

### 3. In `app.additional.tsx` (inside `app/routes`)

- Remove the following import:
  ```tsx
  import { TitleBar } from "@shopify/app-bridge-react";
  ```
- Remove any remaining usage of the Shopify App Bridge.

You're now all set to run your Shopify app in non-embedded mode.

## Run Development Server

```bash
shopify run dev || npm run dev
```
