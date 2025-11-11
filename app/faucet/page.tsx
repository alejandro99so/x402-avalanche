'use client'

import Link from 'next/link'
import { ConnectButton } from '@/components/connect-button'
import { TokenFaucet } from '@/components/token-faucet'

export default function FaucetPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 font-sans">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 underline text-sm"
            >
              ← Back to home
            </Link>
            <ConnectButton />
          </div>

          <TokenFaucet />

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Faucet Information</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">🔸</span>
                <span>
                  <strong>Amount per claim:</strong> 1,000 tokens
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔸</span>
                <span>
                  <strong>Cooldown period:</strong> 24 hours between claims
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔸</span>
                <span>
                  <strong>Network:</strong> Avalanche Fuji Testnet
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔸</span>
                <span>
                  <strong>Gas fees:</strong> You need AVAX to pay for transaction fees
                </span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-600">
                <strong>Need AVAX for gas?</strong> Get testnet AVAX from the{' '}
                <a
                  href="https://core.app/tools/testnet-faucet/?subnet=c&token=c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  Core faucet
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
