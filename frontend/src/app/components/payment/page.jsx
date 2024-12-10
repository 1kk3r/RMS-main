import { useState } from "react";
import { useRouter } from "next/navigation";
import { WebpayPlus } from "transbank-sdk";

// Configura Transbank para pruebas
WebpayPlus.configureForTesting();

export function WebpayCheckout({ amount, items }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleWebpayCheckout = async () => {
    setIsLoading(true);
    try {
      const buyOrder = `O-${Date.now()}`;
      const sessionId = `S-${Date.now()}`;
      const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webpay/commit`;

      const createResponse = await new WebpayPlus.Transaction().create(
        buyOrder,
        sessionId,
        amount,
        returnUrl
      );

      const token = createResponse.token;
      const url = createResponse.url;

      const viewData = {
        buyOrder,
        sessionId,
        amount,
        returnUrl,
        token,
        url,
      };

      if (createResponse && createResponse.token && createResponse.url) {
        router.push(createResponse.url);
      } else {
        throw new Error("La respuesta no contiene una URL válida.");
      }
    } catch (error) {
      console.error("Error creando la transacción:", error);
      alert(
        "Hubo un error al procesar el pago. Por favor, intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleWebpayCheckout}
      disabled={isLoading}
      className="mt-6 w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors"
    >
      {isLoading ? "Procesando..." : "Pagar con Webpay Plus"}
    </button>
  );
}
