import { WebpayPlus } from 'transbank-sdk'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { token_ws } = req.body

            // Commit the transaction
            const commitResponse = await WebpayPlus.Transaction.commit(token_ws)

            // Here you should update your database with the transaction result
            // For example, update the order status, save transaction details, etc.

            // Redirect to a success or failure page based on the transaction result
            if (commitResponse.status === 'AUTHORIZED') {
                res.redirect(302, '/payment-success')
            } else {
                res.redirect(302, '/payment-failure')
            }
        } catch (error) {
            console.error('Error processing Webpay result:', error)
            res.redirect(302, '/payment-failure')
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}