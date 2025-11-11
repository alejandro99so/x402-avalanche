'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseAbi } from 'viem'
import { avalancheFuji } from 'viem/chains'

const TOKEN_ADDRESS = '0x81FeDE901c8415A412f3407f6cEDBCDDC89D888c' as const

const FAUCET_ABI = parseAbi([
  'function claimFromFaucet() external',
  'function canClaimFromFaucet(address user) external view returns (bool)',
  'function getNextFaucetClaimTime(address user) external view returns (uint256)',
  'function lastFaucetClaim(address user) external view returns (uint256)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function balanceOf(address account) external view returns (uint256)',
  'event FaucetClaimed(address indexed user, uint256 amount, uint256 timestamp)',
])

const FAUCET_AMOUNT = '1000' // 1000 tokens
const FAUCET_COOLDOWN = 24 * 60 * 60 // 24 hours in seconds

export function TokenFaucet() {
  const { address, isConnected } = useAccount()
  const [timeUntilClaim, setTimeUntilClaim] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Read token info
  const { data: tokenName } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'name',
    chainId: avalancheFuji.id,
  })

  const { data: tokenSymbol } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'symbol',
    chainId: avalancheFuji.id,
  })

  const { data: balance, refetch: refetchBalance, isLoading: isLoadingBalance, error: balanceError } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  // Log balance for debugging
  useEffect(() => {
    if (address) {
      console.log('Faucet - Connected Address:', address)
      console.log('Faucet - Balance:', balance?.toString())
      console.log('Faucet - Loading:', isLoadingBalance)
      console.log('Faucet - Error:', balanceError)
    }
  }, [address, balance, isLoadingBalance, balanceError])

  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'canClaimFromFaucet',
    args: address ? [address] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  })

  const { data: nextClaimTime, refetch: refetchNextClaimTime } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'getNextFaucetClaimTime',
    args: address ? [address] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  })

  // Write contract
  const { data: hash, writeContract, isPending, isError: isWriteError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    chainId: avalancheFuji.id,
  })

  // Update countdown timer
  useEffect(() => {
    if (!nextClaimTime) return

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const timeLeft = Number(nextClaimTime) - now
      setTimeUntilClaim(Math.max(0, timeLeft))
    }, 1000)

    return () => clearInterval(interval)
  }, [nextClaimTime])

  // Refetch data after successful claim
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
      refetchCanClaim()
      refetchNextClaimTime()
    }
  }, [isConfirmed, refetchBalance, refetchCanClaim, refetchNextClaimTime])

  const handleClaim = async () => {
    setError(null)
    try {
      writeContract({
        address: TOKEN_ADDRESS,
        abi: FAUCET_ABI,
        functionName: 'claimFromFaucet',
        chainId: avalancheFuji.id,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens')
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-200">
        <div className="text-center">
          <div className="text-6xl mb-4">💧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Token Faucet</h2>
          <p className="text-gray-600">Please connect your wallet to claim tokens</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-200">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4 animate-bounce">💧</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {tokenName || 'Token'} Faucet
        </h2>
        <p className="text-gray-600">
          Claim {FAUCET_AMOUNT} {tokenSymbol || 'tokens'} every 24 hours
        </p>
      </div>

      {/* Balance Display - Large and Prominent */}
      <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-8 mb-6 border-2 border-orange-300">
        <p className="text-sm text-gray-600 mb-2 text-center">YOUR BALANCE</p>
        <div className="text-center">
          {isLoadingBalance ? (
            <p className="text-4xl font-bold text-gray-400 animate-pulse">Loading...</p>
          ) : balanceError ? (
            <p className="text-2xl font-bold text-red-600">Error loading balance</p>
          ) : (
            <>
              <p className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {balance ? Number(formatUnits(balance, 18)).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}
              </p>
              <p className="text-2xl font-semibold text-gray-700">{tokenSymbol || 'tokens'}</p>
            </>
          )}
        </div>
        {address && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Wallet: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
      </div>

      {/* Token Info */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Token Name</p>
            <p className="font-bold text-gray-800">{tokenName || 'Loading...'}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Symbol</p>
            <p className="font-bold text-gray-800">{tokenSymbol || 'Loading...'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600 mb-1">Contract Address</p>
            <p className="font-mono text-xs text-gray-800 break-all">{TOKEN_ADDRESS}</p>
          </div>
        </div>
      </div>

      {/* Claim Status */}
      {canClaim ? (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 mb-6 border-2 border-green-300">
          <p className="text-lg font-bold text-green-800 mb-2">✅ Ready to Claim!</p>
          <p className="text-green-700">
            You can claim {FAUCET_AMOUNT} {tokenSymbol} tokens now
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 mb-6 border-2 border-yellow-300">
          <p className="text-lg font-bold text-yellow-800 mb-2">⏰ Cooldown Active</p>
          <p className="text-yellow-700 mb-2">Next claim available in:</p>
          <p className="text-2xl font-mono font-bold text-yellow-900">{formatTime(timeUntilClaim)}</p>
        </div>
      )}

      {/* Error Display */}
      {(error || isWriteError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Transaction failed'}
        </div>
      )}

      {/* Success Display */}
      {isConfirmed && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          🎉 Successfully claimed {FAUCET_AMOUNT} {tokenSymbol}!
        </div>
      )}

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={!canClaim || isPending || isConfirming}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${
          canClaim && !isPending && !isConfirming
            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:scale-105 shadow-lg cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isPending
          ? '⏳ Confirming Transaction...'
          : isConfirming
          ? '⏳ Claiming Tokens...'
          : isConfirmed
          ? '✅ Claimed!'
          : canClaim
          ? `💧 Claim ${FAUCET_AMOUNT} ${tokenSymbol}`
          : `⏰ Cooldown Active`}
      </button>

      {hash && (
        <div className="mt-4 text-center">
          <a
            href={`https://testnet.snowtrace.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-orange-600 hover:text-orange-700 underline"
          >
            View transaction on Snowtrace →
          </a>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ How it works:</strong> You can claim {FAUCET_AMOUNT} tokens from this faucet
          once every 24 hours. The tokens will be sent directly to your connected wallet.
        </p>
      </div>
    </div>
  )
}
