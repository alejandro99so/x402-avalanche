'use client'

import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

export function ConnectButton() {
  const { open } = useAppKit()
  const { isConnected, address } = useAccount()

  return (
    <button
      onClick={() => open()}
      className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer"
    >
      {isConnected
        ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
        : 'Connect Wallet'}
    </button>
  )
}
