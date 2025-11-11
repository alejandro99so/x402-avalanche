import Link from 'next/link'
import { NetworkDisplay } from '@/components/network-display'
import { ConnectButton } from '@/components/connect-button'

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 font-sans dark:bg-black p-4 sm:p-8">
        <NetworkDisplay />

        {/* Decorative corner elements */}
        <div className="fixed top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-red-400 rounded-tl-3xl opacity-50"></div>
        <div className="fixed top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-orange-400 rounded-tr-3xl opacity-50"></div>
        <div className="fixed bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-pink-400 rounded-bl-3xl opacity-50"></div>
        <div className="fixed bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-red-400 rounded-br-3xl opacity-50"></div>

        <main className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-4 border-gradient-to-r from-red-400 via-orange-400 to-pink-400 overflow-hidden">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-pink-400 opacity-10"></div>

        {/* Gradient border */}
        <div className="absolute inset-0 p-1 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 rounded-3xl">
          <div className="h-full w-full bg-white dark:bg-gray-900 rounded-3xl"></div>
        </div>

        <div className="relative z-10 p-8 sm:p-12">
          <div className="mb-6 flex justify-end">
            <ConnectButton />
          </div>
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">🔺</div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                Avalanche Payment Gateway
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Pay with custom ERC20 tokens on Avalanche to unlock premium content using the x402 standard!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Connect your wallet and pay directly on Avalanche Fuji testnet.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Unlock the Mystery:
            </h2>
            <div className="flex justify-center">
              <Link
                href="/content/mystery"
                className="group relative inline-block cursor-pointer"
              >
                <div className="relative bg-gradient-to-br from-red-600 via-orange-600 to-pink-600 rounded-2xl p-8 transform transition-all hover:scale-105 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-orange-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative text-center">
                    <div className="text-7xl mb-4 animate-pulse">🎁</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Mystery Box</h3>
                    <p className="text-white/90 mb-3">Discover Avalanche secrets!</p>
                    <div className="inline-block px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <span className="text-white font-bold">10 Tokens to unlock</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Pay 10 tokens to reveal exclusive Avalanche content and curiosities! 🔺✨
            </p>
          </div>


          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Need Tokens?
            </h2>
            <div className="flex gap-4">
              <Link
                href="/faucet"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg cursor-pointer"
              >
                💧 Token Faucet
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Claim free test tokens every 24 hours from our faucet!
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              How it works
            </h2>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>1. Click on the Mystery Box above</li>
              <li>2. Connect your wallet (must be on Avalanche Fuji testnet)</li>
              <li>3. Pay 10 tokens to unlock the box</li>
              <li>4. Discover a random Avalanche curiosity with an animated GIF!</li>
            </ol>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500">
                💡 Get test AVAX from the{' '}
                <a
                  href="https://core.app/tools/testnet-faucet/?subnet=c&token=c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline"
                >
                  Core Faucet
                </a>
              </p>
              <p className="text-xs text-gray-500">
                💰 Get test tokens from our{' '}
                <a
                  href="/faucet"
                  className="text-red-600 hover:underline"
                >
                  Token Faucet
                </a>
                {' '}(1,000 tokens every 24 hours)
              </p>
            </div>
          </div>
        </div>

          <footer className="relative z-10 w-full pt-2 pb-4 text-center text-sm text-gray-500 border-t border-gray-200 dark:border-gray-700 mt-0">
            <div className="flex items-center justify-center gap-2 mb-0">
              <span className="text-2xl">🔺</span>
              <p>
                Powered by{' '}
                <a
                  href="https://www.avax.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline font-semibold"
                >
                  Avalanche
                </a>
              </p>
            </div>
            <p className="text-xs text-gray-400">Native HTTP 402 Payment Protocol Implementation</p>
          </footer>
        </main>
      </div>
    </>
  )
}
