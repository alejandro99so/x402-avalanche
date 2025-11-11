'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, Address, Hash } from 'viem'
import { avalancheFuji } from 'viem/chains'

const TOKEN_ADDRESS = '0x81FeDE901c8415A412f3407f6cEDBCDDC89D888c' as const
const TOKEN_DECIMALS = 18

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

interface PaymentButtonProps {
  amount: string // In USD
  recipient: Address
  onSuccess: (txHash: Hash) => void
  onError?: (error: Error) => void
  onSubmit?: () => void
  onPending?: (txHash: Hash) => void
  label?: string
}

export function AvalanchePaymentButton({
  amount,
  recipient,
  onSuccess,
  onError,
  onSubmit,
  onPending,
  label = 'Pay with Tokens on Avalanche',
}: PaymentButtonProps) {
  const { address, isConnected, chain } = useAccount()
  const [isPaying, setIsPaying] = useState(false)
  const [showStars, setShowStars] = useState(false)

  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
    chainId: avalancheFuji.id,
  })

  // Track when transaction hash is received (submitted to network)
  useEffect(() => {
    if (hash && !isConfirming && !isSuccess) {
      console.log('📤 Transaction submitted to network:', hash)
      onPending?.(hash)
    }
  }, [hash, isConfirming, isSuccess, onPending])

  // Track when transaction is being confirmed
  useEffect(() => {
    if (hash && isConfirming) {
      console.log('⏳ Waiting for transaction confirmation:', hash)
    }
  }, [hash, isConfirming])

  // Track when transaction is confirmed and call onSuccess
  useEffect(() => {
    if (isSuccess && hash) {
      console.log('✅ Transaction confirmed on-chain:', hash)
      setIsPaying(false)
      onSuccess(hash)
    }
  }, [isSuccess, hash, onSuccess])

  // Handle errors
  useEffect(() => {
    if (writeError) {
      console.error('❌ Write contract error:', writeError)
      setIsPaying(false)
      onError?.(writeError as Error)
    }
  }, [writeError, onError])

  useEffect(() => {
    if (receiptError) {
      console.error('❌ Transaction receipt error:', receiptError)
      setIsPaying(false)
      onError?.(receiptError as Error)
    }
  }, [receiptError, onError])

  const handlePayment = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    if (chain?.id !== avalancheFuji.id) {
      alert('Please switch to Avalanche Fuji Testnet')
      return
    }

    try {
      // Trigger stars animation
      setShowStars(true)
      setTimeout(() => setShowStars(false), 2000)

      setIsPaying(true)
      onSubmit?.()

      const amountWei = parseUnits(amount, TOKEN_DECIMALS)

      console.log('🚀 Initiating payment transaction...')
      console.log('  Amount:', amount, 'tokens')
      console.log('  Amount (wei):', amountWei.toString())
      console.log('  Recipient:', recipient)

      writeContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient, amountWei],
        chainId: avalancheFuji.id,
      })
    } catch (error) {
      console.error('Payment error:', error)
      setIsPaying(false)
      onError?.(error as Error)
    }
  }

  const isProcessing = isPending || isConfirming || isPaying

  return (
    <div className="relative inline-block">
      {/* Stars Animation */}
      {showStars && (
        <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-40px)`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            >
              <span className="text-yellow-400 text-2xl">⭐</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={!isConnected || isProcessing}
        className={`
          px-8 py-4 rounded-xl font-bold text-lg transition-all transform relative
          ${
            isConnected && !isProcessing
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 hover:shadow-xl cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {!isConnected
          ? 'Connect Wallet First'
          : isProcessing
          ? '⏳ Processing Payment...'
          : label}
      </button>
    </div>
  )
}
