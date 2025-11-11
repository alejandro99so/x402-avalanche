'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { parseUnits, Hash } from 'viem'
import { FACILITATOR_CONFIG, FACILITATOR_CONTENT_PRICES, FacilitatorContentType } from '@/lib/facilitator-config'

const CONTENT_TITLES = {
  'ai-content': 'AI Agent Content',
  'agent-data': 'Premium Agent Data',
  premium: 'Premium AI Features',
}

export default function FacilitatorContentPage({ params }: { params: Promise<{ type: string }> }) {
  const { address, isConnected, chain } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentRequirement, setPaymentRequirement] = useState<any>(null)
  const [unwrappedParams, setUnwrappedParams] = useState<{ type: string } | null>(null)

  // Unwrap params
  useEffect(() => {
    Promise.resolve(params).then(setUnwrappedParams)
  }, [params])

  const contentType = unwrappedParams?.type as FacilitatorContentType

  useEffect(() => {
    if (contentType) {
      fetchContent()
    }
  }, [contentType])

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/facilitator/${contentType}`)

      if (response.status === 402) {
        const data = await response.json()
        setPaymentRequirement(data)
      } else if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      } else {
        throw new Error('Failed to fetch content')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    if (chain?.id !== FACILITATOR_CONFIG.network.chainId) {
      setError(`Please switch to ${FACILITATOR_CONFIG.network.name}`)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const amount = parseUnits(paymentRequirement.payment.amount, FACILITATOR_CONFIG.token.decimals)

      // Generate EIP-3009 typed data for meta-transaction
      const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const nonce = `0x${Date.now().toString(16).padStart(64, '0')}` as Hash

      const domain = {
        name: FACILITATOR_CONFIG.token.symbol,
        version: '1',
        chainId: FACILITATOR_CONFIG.network.chainId,
        verifyingContract: FACILITATOR_CONFIG.token.address,
      }

      const types = {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
        ],
      }

      const message = {
        from: address,
        to: FACILITATOR_CONFIG.facilitatorAddress,
        value: amount,
        validAfter: 0,
        validBefore: deadline,
        nonce,
      }

      // Sign the meta-transaction
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'TransferWithAuthorization',
        message,
      })

      // Create payment proof
      const paymentProof = {
        scheme: 'eip3009',
        signature,
        message,
        domain,
      }

      // Retry content fetch with payment proof
      const response = await fetch(`/api/facilitator/${contentType}`, {
        headers: {
          'x-payment': JSON.stringify(paymentProof),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
        setPaymentRequirement(null)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Payment verification failed')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (!unwrappedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!FACILITATOR_CONTENT_PRICES.hasOwnProperty(contentType)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900">
        <div className="text-white text-xl">Invalid content type</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{CONTENT_TITLES[contentType]}</h1>
            <div className="text-sm text-gray-600">
              Powered by <span className="font-semibold text-red-600">Ultravioleta DAO</span>
            </div>
          </div>

          {!isConnected && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800">Please connect your wallet to access this content</p>
            </div>
          )}

          {chain?.id !== FACILITATOR_CONFIG.network.chainId && isConnected && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
              <p className="text-orange-800">
                Please switch to {FACILITATOR_CONFIG.network.name} (Chain ID: {FACILITATOR_CONFIG.network.chainId})
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {paymentRequirement && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Required</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {paymentRequirement.payment.amount} {paymentRequirement.payment.tokenSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span className="font-semibold">{paymentRequirement.payment.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protocol:</span>
                    <span className="font-semibold text-red-600">x402 (Gasless)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Facilitator:</span>
                    <span className="font-semibold">Ultravioleta DAO</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">How It Works:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li>1. {paymentRequirement.instructions.step1}</li>
                    <li>2. {paymentRequirement.instructions.step2}</li>
                    <li>3. {paymentRequirement.instructions.step3}</li>
                    <li>4. {paymentRequirement.instructions.step4}</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !isConnected || chain?.id !== FACILITATOR_CONFIG.network.chainId}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Pay ${paymentRequirement.payment.amount} ${paymentRequirement.payment.tokenSymbol} (Gasless)`}
              </button>
            </div>
          )}

          {content && (
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-green-800 font-semibold">Payment verified! Content unlocked.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h2>
                <p className="text-gray-700 mb-6">{content.message}</p>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(content.data, null, 2)}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => {
                  setContent(null)
                  fetchContent()
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Request New Content
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-white hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
