import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base } from "@reown/appkit/networks";


const projectId = "b5177ed9c756b72ea8a9cb11f7aab606";

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [base],
  ssr: true,
  connectors: [
  ],
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId,
  metadata: {
    name: "TaptoMining",
    description: "Tap to Mining",
    url: "https://wedev.xyz",
    icons: ["https://wedev/logo.png"],
  },
  features: {
  },
  themeMode: "dark",
});

export const config = wagmiAdapter.wagmiConfig;