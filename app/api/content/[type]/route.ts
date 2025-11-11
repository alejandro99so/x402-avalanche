import { NextRequest, NextResponse } from 'next/server'
import { requirePayment } from '@/lib/avalanche-payment'

// Replace this with your wallet address where you want to receive payments
const PAYMENT_RECIPIENT = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS as `0x${string}`

const AVALANCHE_CURIOSITIES = [
  {
    title: 'Avalanche Speed Record',
    message: 'Avalanche can process over 4,500 transactions per second and achieve finality in under 2 seconds - one of the fastest blockchain platforms in the world!',
    image: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXVwM3NrczRiMThhdmhhenF4b3ZlN2t3OHIwMmI0dTdlaWZxMXN6ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7ZePMv221orZKz84/giphy.gif',
    fact: '🚀 Lightning Fast Performance',
  },
  {
    title: 'The Three-Chain Architecture',
    message: 'Avalanche uses a unique three-chain system: X-Chain for asset exchange, C-Chain for smart contracts, and P-Chain for validator coordination. This innovative design maximizes efficiency!',
    image: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzJlZ2thNmVnbXd4am0yZzZlbDk1b21kZGl0ODY5eXpudGV3c3NvbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DwsOh9IbCquaCnwJJw/giphy.gif',
    fact: '⛓️ Triple Chain Innovation',
  },
  {
    title: 'L1 Revolution',
    message: 'Avalanche pioneered L1s - custom blockchain networks that can have their own rules, validators, and virtual machines while benefiting from Avalanche security!',
    image: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWIzenpvMzd5eGk2eDVjcDNvMDRtZ3ozN2I0ZzVzaGN4ZXBrMXdteSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4qsokBIDFxwYAgAllg/giphy.gif',
    fact: '🌐 Infinite Scalability',
  },
  {
    title: 'Energy Efficient Consensus',
    message: 'The Avalanche consensus protocol is incredibly energy-efficient compared to Proof-of-Work blockchains, using just a fraction of the energy while maintaining security!',
    image: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjF2eXBnamY3d2dtd3g4aHlxdWc0OGU0MjJlcXh4MXBnMjd0dGJ5dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/23xN9cYQSKwFy/giphy.gif',
    fact: '🌱 Eco-Friendly Blockchain',
  },
]

const CONTENT_CONFIG = {
  mystery: {
    price: '10',
    title: 'Mystery Box Unlocked!',
  },
} as const

type ContentType = keyof typeof CONTENT_CONFIG

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params

  if (type !== 'mystery') {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 404 })
  }

  const contentType = type as ContentType
  const config = CONTENT_CONFIG[contentType]

  // Check if payment is required
  const paymentRequired = await requirePayment(request, {
    amount: config.price,
    resource: `/api/content/${type}`,
    description: `Access to ${config.title}`,
    recipient: PAYMENT_RECIPIENT,
  })

  if (paymentRequired) {
    return paymentRequired
  }

  // Payment verified - return random Avalanche curiosity
  const randomCuriosity = AVALANCHE_CURIOSITIES[Math.floor(Math.random() * AVALANCHE_CURIOSITIES.length)]

  return NextResponse.json({
    success: true,
    content: {
      title: config.title,
      curiosity: randomCuriosity,
      type: contentType,
    },
  })
}
