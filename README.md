# 📱 mPay — High-Fidelity USDT MiniPay Super App

mPay is a beautifully crafted, professional-grade MiniPay micro-payments super-application module built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS v4**. Optimized for mobile viewport accuracy inside Opera's **MiniPay** environment on the Celo network, it provides a stunning layout, authentic branding, high-precision animations, and a rich, spatial audio feedback engine.

---

## ✨ Features & Architecture

### 🎨 Authentic Brand Identity
*   **True Color System**: Replaced the default orange and yellow templates with the beautiful, eye-safe, and high-contrast official **MiniPay Green** (`#03D475`) and **MiniPay Emerald** (`#10B981`) brand guidelines.
*   **Display Typography**: Integrates the premium sans-serif **Plus Jakarta Sans** paired with **Inter** for clean readability, alongside **JetBrains Mono** for low-latency transaction hashes and block states.
*   **Adaptive Dual-Themes**: Toggle seamlessly between a clean, soft-contrast Light Mode and an immersive, cosmic-tinted Dark Mode (`minipay-bg-gradient-dark`).

### 🎹 Immersive Audio System
*   **Haptic Sound Feedback**: Built-in spatial audio waveforms (using browser synthesizers via dynamic oscillators) representing user states:
    *   `keypress`: Subtle clicking upon typing numbers/address inputs.
    *   `click`: Tactile button toggle feedback.
    *   `woosh`: Soft swoops during QR scanning actions or slide transitions.
    *   `confirm`: Clear chord triggering the slide-to-send action.
    *   `success`: Harmonious major scale chords for fully settled on-chain blocks.
    *   `error`: Low-pitched warning frequencies alerting validation issues.
*   **Global Mute Toggle**: Simple volume control within the header to accommodate quiet or public environments.

### ⚙️ Interactive Hybrid-Web3 Engine
*   **Demo Sandbox Mode**: Enabled by default so reviewers can experience fully functional payment flows, interactive frequent contacts, and instant balance topping-up with Celo Sandbox Stable Faucet ($100 USDT).
*   **Real Web3 Injector**: Binds instantly with Opera MiniPay, MetaMask, or any other injected `window.ethereum` compatible provider. When disabled, the app operates under live on-chain mainnet/testnet specifications with real transaction block sign-offs.

### 🔄 Native Mento Swap Engine
*   **In-App Gasless Swap Experience**: When the card is expanded, users can instantly trade **Native CELO** for **Testnet USDT** (`0x624923e5957e627471659D1872179E735522e97A`) directly inside the application using the `@mento-protocol/mento-sdk` and `ethers.js` provider context.
*   **Real-time Price Impact Indicator**: Fetches instantaneous price quotes from the Mento Protocol swap contracts. Standardizes the quote calculation against a microscopic unit baseline (0.001 CELO) to dynamically display exact price impact and protect against slippage.
*   **Slippage Tolerance Protection**: Executes trade transactions with rigid 2% contract-level slippage guidelines (`amountOutMin`) passed dynamically with the transaction payload.

### 🌪️ Studio-Grade Animations (`motion/react`)
*   **Spring Physics Popups**: Modals and transaction receipts scale with custom stiffness and damping ratios (inspired by Emil Kowalski's guidelines) for elastic, zero-lag visual responsiveness.
*   **Slide-to-Send**: Drag slider confirmation with dynamic velocity thresholds to replicate native fintech app interactions. Optimally styled without unneeded flashing/dimming animations for a highly polished, premium, professional appearance.

---

## ⚡ Vercel Deployment Guide

Deploying mPay to Vercel takes less than a minute and requires no manual backend setup.

### 🚀 Direct Deployment Method

1.  Sign in to [Vercel](https://vercel.com).
2.  Click **Add New Project** and import your repository.
3.  Vercel automatically detects **Vite** as your preset. Keep the default settings:
    *   **Build Command**: `vite build`
    *   **Output Directory**: `dist`
4.  Click **Deploy**.

### 🛠️ Configuration Details (`vercel.json`)
The included `vercel.json` ensures that Vercel routes all nested paths directly back to the SPA's entry document:
```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📲 Loading in the MiniPay Developer Environment

To test and debug mPay directly inside the native MiniPay developer context:

1.  Deploy the code to Vercel (or obtain the public URL of your instance).
2.  Ensure you have downloaded the **Opera Mini / Crypto Browser** on a mobile test device.
3.  Open the MiniPay Developer Suite or connect via Opera's native debug companion.
4.  Specify your deployed URL (e.g., `https://your-mpay-app.vercel.app/`).
5.  Experience the native micro-payments workflow running securely at 60 FPS.

---

## 🧬 Scientific System Architecture
All core blocks are organized into modular, clean components:
*   `/src/components/Header.tsx` — Controls network selection, Light/Dark themes, sounds, and active wallet connectivity.
*   `/src/components/BalanceCard.tsx` — High-visibility stablecoin display with native Mento Swap form expansion.
*   `/src/components/SendForm.tsx` — Form validation, contacts carousel, QR simulation, and the elastic Slide-to-Confirm handle.
*   `/src/components/RecentTransactions.tsx` — Real-time filterable blockchain ledger logging alongside receipt modal screens.

---

## 🛠️ Under the Hood: How We Built Each Feature

### 1. 🔄 Native Mento Protocol Swapping
*   **The Problem**: Transitioning users from CELO to USDT typically requires navigating outside the app, introducing high churn.
*   **The Architecture**: We integrated `@mento-protocol/mento-sdk` along with `@ethersproject` providers. By hooking directly into the existing injected `window.ethereum` MiniPay provider, we instantiate a responsive Web3 connection to Celo Alfajores Testnet contracts.
*   **The Math & Logic**:
    *   **Price Quote fetching**: We call `mento.getAmountOut(CELO_ADDRESS, USDT_ADDRESS, amountInWei)` to calculate the exact USDT receipt.
    *   **Real-time Price Impact**: Designed an active baseline mechanism where we query a microscopic amount (0.001 CELO) to get an expected market price. The active slippage/price impact is calculated as:
        $$\text{Price Impact \%} = \frac{Price_{\text{Expected}} - Price_{\text{Effective}}}{Price_{\text{Expected}}} \times 100$$
        If price impact elevates, we flag it in orange/red to alert users before signing.
    *   **Slippage Protection**: A static 2% slippage constraint (`amountOutMin`) is computed locally using ethers.js `BigNumber` methods (`amountOutWei.mul(98).div(100)`) and passed to Mento's `swapIn` transaction assembler to prevent front-running.

### 2. 🎛️ Non-Blinking Slide-to-Confirm Slider
*   **The Problem**: The indicator text "Slide to Confirm" utilized standard flashing styles (`animate-pulse`) which caused visually distracting brightness shifts that degraded professional credibility.
*   **The Solution**: We stripped out the blinking animators from the label containers, replacing them with static, premium semi-transparent overlay typography. This retains readability, keeps the design steady, and ensures that the focal point is the sliding gesture.
*   **The Animation**: Programmed using `motion/react` with an active `useMotionValue(0)` and `useTransform` to scale the green progress track proportionally behind the finger/cursor drag coordinates.

### 3. Latency-Insensitive Multi-Network Switching
*   **The Problem**: Users opening apps in MiniPay are frequently on different networks (Mainnet or Alfajores Testnet).
*   **The Solution**: Implemented proactive network check and automatic network-switch prompt in `switchOrAddCeloNetwork`. If the user is on Celo Mainnet but flips to Testnet (or vice versa), we programmatically request a wallet override via:
    ```js
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }]
    });
    ```
    If the network is not yet added to the wallet, the applet gracefully falls back to register the network context automatically via `wallet_addEthereumChain`.

