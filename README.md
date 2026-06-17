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

### 🌪️ Studio-Grade Animations (`motion/react`)
*   **Spring Physics Popups**: Modals and transaction receipts scale with custom stiffness and damping ratios (inspired by Emil Kowalski's guidelines) for elastic, zero-lag visual responsiveness.
*   **Slide-to-Send**: Drag slider confirmation with dynamic velocity thresholds to replicate native fintech app interactions.

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
*   `/src/components/BalanceCard.tsx` — High-visibility stablecoin display with sandbox minting facilities.
*   `/src/components/SendForm.tsx` — Form validation, contacts carousel, QR simulation, and the elastic Slide-to-Confirm handle.
*   `/src/components/RecentTransactions.tsx` — Real-time filterable blockchain ledger logging alongside receipt modal screens.
