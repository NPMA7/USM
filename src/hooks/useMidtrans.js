import { useEffect, useState } from "react";

export default function useMidtrans() {
  const [snapLoaded, setSnapLoaded] = useState(false);
  
  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    
    if (!document.querySelector(`script[src="${midtransScriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = midtransScriptUrl;
      script.setAttribute("data-client-key", clientKey);
      script.onload = () => {
        setSnapLoaded(true);
      };
      script.onerror = (error) => {
        // Tetap kosong, tidak perlu console.error
      };
      document.body.appendChild(script);
    } else {
      setSnapLoaded(true);
    }
  }, []);

  return { snapLoaded };
}
