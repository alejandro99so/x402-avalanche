import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseUnits, Address, Hash } from 'viem'
import { avalancheFuji } from 'viem/chains'

// Custom ERC20 Token on Avalanche Fuji
const TOKEN_ADDRESS = '0x81FeDE901c8415A412f3407f6cEDBCDDC89D888c' as const
const TOKEN_DECIMALS = 18

// Viem client for Avalanche Fuji
const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http('https://api.avax-test.network/ext/bc/C/rpc'),
})

// https://www.4byte.directory/event-signatures/?bytes_signature=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
const TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export interface PaymentRequirement {
  amount: string // In USD, e.g., "0.01"
  resource: string
  description: string
  recipient: Address // Who receives the payment
}

export interface PaymentProof {
  txHash: Hash
  network: 'avalanche-fuji'
  amount: string
}

/**
 * Check if payment is required and return 402 with payment requirements
 */
export async function requirePayment(
  request: NextRequest,
  requirement: PaymentRequirement
): Promise<NextResponse | null> {
  const paymentHeader = request.headers.get('x-payment')

  if (!paymentHeader) {
    // No payment provided - return 402 Payment Required
    return NextResponse.json(
      {
        error: 'Payment Required',
        payment: {
          network: 'avalanche-fuji',
          chainId: 43113,
          amount: requirement.amount,
          amountWei: parseUnits(requirement.amount, TOKEN_DECIMALS).toString(),
          token: TOKEN_ADDRESS,
          tokenSymbol: 'Tokens',
          recipient: requirement.recipient,
          description: requirement.description,
          resource: requirement.resource,
        },
      },
      { status: 402 }
    )
  }

  // Verify payment
  try {
    const payment: PaymentProof = JSON.parse(paymentHeader)
    const isValid = await verifyPayment(payment, requirement)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment' },
        { status: 402 }
      )
    }

    // Payment verified - allow request to continue
    return null
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid payment format' },
      { status: 402 }
    )
  }
}

/**
 * Verify that a payment transaction is valid
 */
async function verifyPayment(
  payment: PaymentProof,
  requirement: PaymentRequirement
): Promise<boolean> {
  try {
    console.log('🔍 Starting payment verification...')
    console.log('Transaction hash:', payment.txHash)
    console.log('Expected network:', 'avalanche-fuji')
    console.log('Expected recipient:', requirement.recipient)
    console.log('Expected amount:', requirement.amount)

    if (payment.network !== 'avalanche-fuji') {
      console.error('❌ Wrong network:', payment.network)
      return false
    }

    console.log('⏳ Fetching transaction receipt...')
    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: payment.txHash,
    })

    if (!receipt) {
      console.error('❌ Transaction receipt not found - transaction may not be mined yet')
      return false
    }

    console.log('📄 Transaction receipt received')
    console.log('Status:', receipt.status)
    console.log('Block number:', receipt.blockNumber)
    console.log('Logs count:', receipt.logs.length)

    if (receipt.status !== 'success') {
      console.error('❌ Transaction not successful, status:', receipt.status)
      return false
    }

    // Find token transfer event
    console.log('🔍 Looking for token transfer event...')
    console.log('Expected token address:', TOKEN_ADDRESS)

    const transferLog = receipt.logs.find(
      (log) =>
        log.address.toLowerCase() === TOKEN_ADDRESS.toLowerCase() &&
        log.topics[0] === TRANSFER_EVENT_SIGNATURE
    )

    if (!transferLog) {
      console.error('❌ No token transfer found in transaction')
      console.log('Available logs:', receipt.logs.map(l => ({ address: l.address, topics: l.topics })))
      return false
    }

    console.log('✅ Token transfer event found')

    // Decode transfer event
    // topics[1] = from, topics[2] = to, data = amount
    const from = `0x${transferLog.topics[1]?.slice(26)}` as Address
    const to = `0x${transferLog.topics[2]?.slice(26)}` as Address
    const amountHex = transferLog.data
    const amount = BigInt(amountHex)

    console.log('📊 Transfer details:')
    console.log('  From:', from)
    console.log('  To:', to)
    console.log('  Amount (wei):', amount.toString())

    // Verify recipient
    console.log('🔍 Verifying recipient...')
    if (to.toLowerCase() !== requirement.recipient.toLowerCase()) {
      console.error('❌ Wrong recipient!')
      console.error('  Received:', to)
      console.error('  Expected:', requirement.recipient)
      return false
    }
    console.log('✅ Recipient verified')

    // Verify amount
    console.log('🔍 Verifying amount...')
    const requiredAmount = parseUnits(requirement.amount, TOKEN_DECIMALS)
    console.log('  Required amount (wei):', requiredAmount.toString())
    console.log('  Actual amount (wei):', amount.toString())

    if (amount < requiredAmount) {
      console.error('❌ Insufficient amount!')
      console.error('  Received:', amount.toString())
      console.error('  Required:', requiredAmount.toString())
      return false
    }
    console.log('✅ Amount verified')

    console.log('🎉 Payment fully verified!')
    console.log('Summary:', {
      txHash: payment.txHash,
      from,
      to,
      amount: amount.toString(),
      requiredAmount: requiredAmount.toString(),
      blockNumber: receipt.blockNumber,
    })

    return true
  } catch (error) {
    console.error('Payment verification error:', error)
    return false
  }
}

/**
 * Create a payment proof from a transaction hash
 */
export function createPaymentProof(txHash: Hash): PaymentProof {
  return {
    txHash,
    network: 'avalanche-fuji',
    amount: '0', // Will be verified from the transaction
  }
}
