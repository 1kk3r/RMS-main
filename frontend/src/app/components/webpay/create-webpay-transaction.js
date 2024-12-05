import { WebpayPlus } from 'transbank-sdk'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { amount, items } = req.body

            // Generate a unique buy order (you might want to use a more robust method in production)
            const buyOrder = `ORDEN-${Date.now()}`

            // Generate a session ID (you might want to use a more robust method in production)
            const sessionId = `SESSION-${Date.now()}`

            // The URL where Webpay will redirect after the transaction
            const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webpay-result`

            // Create a new Webpay Plus transaction
            const response = await WebpayPlus.Transaction.create(
                buyOrder,
                sessionId,
                amount,
                returnUrl
            )

            // Return the URL and token to the client
            res.status(200).json({ url: response.url, token: response.token })
        } catch (error) {
            console.error('Error creating Webpay transaction:', error)
            res.status(500).json({ error: 'Failed to create Webpay transaction' })
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}