import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function WebpayCheckout({ amount, items }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleWebpayCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/create-webpay-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, items }),
      })

      if (!response.ok) {
        throw new Error('Failed to create Webpay transaction')
      }

      const { url, token } = await response.json()

      // Redirect to Webpay
      router.push(url, { scroll: false })
    } catch (error) {
      console.error('Error creating Webpay transaction:', error)
      alert('Hubo un error al procesar el pago. Por favor, intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleWebpayCheckout}
      disabled={isLoading}
      className="mt-6 w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors"
    >
      {isLoading ? 'Procesando...' : 'Pagar con Webpay Plus'}
    </button>
  )
}