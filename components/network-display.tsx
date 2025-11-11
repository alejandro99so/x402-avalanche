'use client'

import { useAccount, useChainId } from 'wagmi'

export function NetworkDisplay() {
  const { address, isConnected, chain } = useAccount()
  const chainId = useChainId()

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg text-sm">
        ⚠️ Wallet not connected
      </div>
    )
  }

  const isAvalancheFuji = chainId === 43113
  const bgColor = isAvalancheFuji ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'

  return (
    <div className={`fixed top-4 right-4 ${bgColor} border px-4 py-2 rounded-lg text-sm`}>
      <div className="font-semibold">
        {isAvalancheFuji ? '✅ Avalanche Fuji' : `❌ Wrong Network`}
      </div>
      <div className="text-xs mt-1">
        Chain ID: {chainId} {chain?.name && `(${chain.name})`}
      </div>
      {address && (
        <div className="text-xs mt-1">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}
      {!isAvalancheFuji && (
        <div className="text-xs mt-2 font-semibold">
          Please switch to Avalanche Fuji (43113)
        </div>
      )}
    </div>
  )
}
