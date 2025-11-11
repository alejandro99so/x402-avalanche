'use client'

import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider, type Config } from 'wagmi'
import { avalanche, avalancheFuji } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { ReactNode } from 'react'

// Get Reown project ID and network from environment
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Reown features will be limited.')
}

// FORCE Avalanche Fuji as the ONLY network
const networks = [avalancheFuji]

console.log('Reown Provider: FORCED Avalanche Fuji - Chain ID:', avalancheFuji.id, 'RPC:', avalancheFuji.rpcUrls.default.http[0])

// Create Wagmi adapter - ONLY Avalanche Fuji
const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId,
})

// Create the Reown AppKit instance - FORCED to Avalanche Fuji
createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as any,
  projectId,
  defaultNetwork: avalancheFuji as any,
  metadata: {
    name: 'X402 Avalanche Fuji',
    description: 'X402 Payment Protocol on Avalanche Fuji Testnet',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com',
    icons: ['/logos/x402-examples.png'],
  },
  features: {
    analytics: true,
  },
  themeMode: 'light',
})

// Create query client for React Query
const queryClient = new QueryClient()

export function ReownProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
