'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ConnectButton } from '@/components/connect-button'
import { AvalanchePaymentButton } from '@/components/avalanche-payment-button'
import { AvalancheContent } from '@/components/avalanche-content'
import Link from 'next/link'
import { Hash } from 'viem'

const CONTENT_CONFIG = {
  mystery: {
    price: '10',
    title: 'Mystery Box Unlocked!',
  },
} as const

type ContentType = keyof typeof CONTENT_CONFIG

interface AvalancheCuriosity {
  title: string
  message: string
  image: string
  fact: string
}

interface ContentData {
  title: string
  curiosity: AvalancheCuriosity
  type: string
}

export default function AvalancheContentPage() {
  const params = useParams()
  const type = params?.type as string
  const [content, setContent] = useState<ContentData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<{
    stage: 'idle' | 'submitting' | 'pending' | 'confirming' | 'verifying' | 'complete'
    message: string
    txHash?: string
  }>({ stage: 'idle', message: '' })

  const contentType = type as ContentType
  const config = CONTENT_CONFIG[contentType] || CONTENT_CONFIG.mystery

  // Check if content is already paid for
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch(`/api/content/${type}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setContent(data.content)
          }
        } else if (response.status === 402) {
          const data = await response.json()
          setPaymentInfo(data.payment)
        }
      } catch (err) {
        console.error('Error checking access:', err)
      }
    }
    checkAccess()
  }, [type])

  const handlePaymentSuccess = async (txHash: Hash) => {
    setIsLoading(true)
    setError(null)

    setPaymentStatus({
      stage: 'confirming',
      message: 'Transaction confirmed on blockchain',
      txHash,
    })

    console.log('🔄 Payment transaction confirmed:', txHash)
    console.log('⏳ Verifying payment on backend...')

    try {
      setPaymentStatus({
        stage: 'verifying',
        message: 'Verifying payment details on-chain',
        txHash,
      })

      // Retry logic for transaction verification
      let attempts = 0
      const maxAttempts = 10
      let verified = false

      while (attempts < maxAttempts && !verified) {
        attempts++
        console.log(`Verification attempt ${attempts}/${maxAttempts}`)

        setPaymentStatus({
          stage: 'verifying',
          message: `Verifying transaction (attempt ${attempts}/${maxAttempts})`,
          txHash,
        })

        // Wait before each attempt (exponential backoff)
        if (attempts > 1) {
          const waitTime = Math.min(1000 * attempts, 5000)
          console.log(`Waiting ${waitTime}ms before retry...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }

        // Fetch content with payment proof
        const paymentProof = {
          txHash,
          network: 'avalanche-fuji',
          amount: config.price,
        }

        const response = await fetch(`/api/content/${type}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-PAYMENT': JSON.stringify(paymentProof),
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Payment verified successfully!', data)

          setPaymentStatus({
            stage: 'complete',
            message: 'Payment verified! Unlocking content...',
            txHash,
          })

          setContent(data.content)
          verified = true
        } else {
          const data = await response.json()
          console.log(`❌ Verification failed (attempt ${attempts}):`, data.error)

          // If we've exhausted attempts, show error
          if (attempts >= maxAttempts) {
            setPaymentStatus({
              stage: 'idle',
              message: '',
            })
            setError(data.error || 'Payment verification failed after multiple attempts. Your payment was sent but verification timed out. Please refresh the page.')
          }
        }
      }
    } catch (err) {
      console.error('💥 Payment verification error:', err)
      setPaymentStatus({
        stage: 'idle',
        message: '',
      })
      setError('Failed to verify payment. Please refresh the page and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentError = (error: Error) => {
    setError(error.message)
    setPaymentStatus({
      stage: 'idle',
      message: '',
    })
  }

  const handlePaymentSubmit = () => {
    setPaymentStatus({
      stage: 'submitting',
      message: 'Submitting transaction to blockchain...',
    })
    setError(null)
  }

  const handlePaymentPending = (txHash: Hash) => {
    setPaymentStatus({
      stage: 'pending',
      message: 'Transaction pending confirmation...',
      txHash,
    })
  }

  if (type !== 'mystery') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-400 via-red-500 to-red-600">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Content not found</h1>
          <Link href="/" className="text-red-600 hover:underline mt-4 inline-block cursor-pointer">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  if (content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 font-sans p-4">
        <main className="flex w-full max-w-3xl flex-col items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden w-full">
            {/* Confetti animation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="animate-bounce absolute top-4 left-4 text-4xl">🎉</div>
              <div className="animate-bounce absolute top-8 right-8 text-4xl delay-100">✨</div>
              <div className="animate-bounce absolute bottom-8 left-8 text-4xl delay-200">🎊</div>
              <div className="animate-bounce absolute bottom-4 right-4 text-4xl delay-300">⭐</div>
            </div>

            {/* Gift box opening animation */}
            <div className="mb-6 relative">
              <div className="animate-pulse text-8xl mb-4">🎁</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-ping text-8xl opacity-20">🎁</div>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
              🎉 Mystery Box Unlocked! 🎉
            </h2>

            <div className="mb-6">
              <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg mb-4">
                Payment Verified ✅
              </div>
              <p className="text-sm text-gray-600">
                You paid <span className="font-bold">{config.price} Tokens</span> on{' '}
                <span className="font-bold">Avalanche Fuji</span>
              </p>
            </div>

            <AvalancheContent curiosity={content.curiosity} />

            <div className="flex gap-4 justify-center mt-8">
              <Link
                href="/"
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                🏠 Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-400 via-red-500 to-red-600 font-sans p-4">
      <main className="flex w-full max-w-2xl flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center relative">
          <div className="absolute top-4 right-4">
            <ConnectButton />
          </div>

          {/* Locked Mystery Box */}
          <div className="mb-6">
            <div className="text-8xl mb-4">🔒</div>
            <div className="text-6xl">🎁</div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Mystery Box Locked
          </h1>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 sm:p-8 mb-8 border-2 border-red-200">
            <p className="text-lg sm:text-xl text-gray-700 mb-6">
              Pay <span className="font-bold text-red-600">{config.price} Tokens</span> on{' '}
              <span className="font-bold text-orange-600">Avalanche Fuji</span> to unlock a random Avalanche curiosity!
            </p>

            <div className="mb-6 p-4 bg-white rounded-lg border border-red-200">
              <p className="text-sm text-gray-600 mb-2">✨ What's inside?</p>
              <ul className="text-xs text-gray-500 text-left space-y-1">
                <li>🚀 Avalanche speed records</li>
                <li>⛓️ Architecture secrets</li>
                <li>🌐 L1 innovations</li>
                <li>🌱 Eco-friendly facts</li>
              </ul>
            </div>

            {paymentInfo && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left text-sm">
                <h3 className="font-bold mb-2">Payment Details:</h3>
                <p>
                  <span className="text-gray-600">Network:</span> Avalanche Fuji (Chain ID: 43113)
                </p>
                <p>
                  <span className="text-gray-600">Amount:</span> {paymentInfo.amount} {paymentInfo.tokenSymbol}
                </p>
                <p className="break-all">
                  <span className="text-gray-600">Token:</span> {paymentInfo.token}
                </p>
                <p className="break-all">
                  <span className="text-gray-600">Recipient:</span> {paymentInfo.recipient}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-700 font-semibold mb-2">⏳ Verifying your payment...</p>
                <p className="text-sm text-gray-600 mb-2">
                  Checking transaction on Avalanche Fuji blockchain
                </p>
                <p className="text-xs text-gray-500">
                  This may take a few seconds while we verify the transaction was successful
                  and the correct amount was sent to the recipient.
                </p>
              </div>
            ) : (
              paymentInfo && (
                <AvalanchePaymentButton
                  amount={paymentInfo.amount}
                  recipient={paymentInfo.recipient}
                  onSubmit={handlePaymentSubmit}
                  onPending={handlePaymentPending}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  label={`Pay ${paymentInfo.amount} ${paymentInfo.tokenSymbol}`}
                />
              )
            )}

            {/* Payment Status Indicator */}
            {paymentStatus.stage !== 'idle' && paymentStatus.stage !== 'complete' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{paymentStatus.message}</p>
                    {paymentStatus.txHash && (
                      <a
                        href={`https://testnet.snowtrace.io/tx/${paymentStatus.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View on Snowtrace →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 underline text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
