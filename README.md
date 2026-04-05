```
   ------++                                                 ------++                              ------++#        
  ------+++                                                ------+++                              -----++++        
  ------+++                                                -----++++                              -----+++         
  ------------      ---------      --------------  -------------++++----------      ---------    ------+++-------  
  -------------++ ------------++  --------------+++-------------+++------------+  ------------++ -----+++-----+++++
 ------++++----+++-----+++----+++-----++++-----+++-----+++-----+++-----++++----+++-----+++-----++-----------+++++  
 -----++++------+++-----------+++----++++------++-----++++-----++-----++++------++----++++---++++---------+++++    
 -----+++ -----++-------------++-----+++ ------++----++++ -----++-----+++ ------+-----+++       -----------++      
 -----+++ -----++----++++-----++-----+++ -----+++----++++-----+++-----+++------++-----+++-------------+-----++     
--------------+++----++------+++--------------+++-------------+++-------------++++------------++-----+++-----++    
-------------++++------------++++-------------+++-------------+++ ----------+++++ ----------++++----+++ -----+++   
--++++++++++++++   -+++++++++++++- -++++-----+++   -+++++++++++++    ++++++++++      ++++++++++ -++++++  -+++++++  
                               -------------++++                                                                   
                               -----------+++++                                                                    
                                  +++++++++++                                                                      
```

# @bagdock/hive-react

React components for embedding the Bagdock Hive experience — AI chat, unit booking, and gate access widgets with built-in theming.

[![npm version](https://img.shields.io/npm/v/@bagdock/hive-react.svg)](https://www.npmjs.com/package/@bagdock/hive-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Install

```bash
npm install @bagdock/hive-react @bagdock/hive react react-dom
```

## Quick start

```tsx
import { HiveProvider, HiveChat, HiveBooking } from '@bagdock/hive-react'

function App() {
  return (
    <HiveProvider apiKey="hk_live_..." operatorId="opreg_wisestorage">
      <HiveChat />
      <HiveBooking />
    </HiveProvider>
  )
}
```

## Components

### `<HiveProvider>`

Wraps your app (or a subtree) to configure the Hive client and apply theming.

| Prop | Type | Description |
|------|------|-------------|
| `apiKey` | `string` | Your Bagdock API key |
| `embedToken` | `string` | Embed token (alternative to apiKey) |
| `baseUrl` | `string` | API base URL override |
| `operatorId` | `string` | Scope to a specific operator |
| `auth` | `AuthAdapterConfig` | Pluggable auth config |
| `appearance` | `HiveAppearance` | Theming object |

### `<HiveChat>`

Embeddable AI chat widget for answering tenant questions.

### `<HiveBooking>`

Unit booking flow — search, select, and checkout.

### `<HiveAccess>`

Displays gate access codes (PIN, QR, NFC) for a tenant's unit.

## Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useHive()` | `HiveContextValue` | Access the Hive context (client, theme) |
| `useHiveClient()` | `BagdockHive` | Direct access to the typed HTTP client |

## Theming

Customize the look with a Stripe/Clerk-style `appearance` prop:

```tsx
<HiveProvider
  apiKey="hk_live_..."
  appearance={{
    theme: 'dark',
    variables: {
      colorPrimary: '#6366f1',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif',
    },
  }}
>
  <HiveChat />
</HiveProvider>
```

All variables are exposed as CSS custom properties (`--hive-color-primary`, etc.) for further customization.

## License

MIT
