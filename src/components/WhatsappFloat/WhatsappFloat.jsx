import { useState, useEffect } from "react";
import "./whatsappFloat.css";
import { MessageCircle } from "lucide-react";

function WhatsAppFloat() {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="whatsapp-wrapper">

      {showBubble && (
        <div className="whatsapp-bubble">
          Need Our Services? Chat with us!
        </div>
      )}

      <a
        href="https://wa.me/2349134991239?text=Hello%20BuiltRight%20Services%20Ltd,%20I%20would%20like%20to%20make%20an%20enquiry%20about%20your%20facility%20management,%20energy,%20or%20solar%20solutions."
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={24} />
        <span className="whatsapp-text">WhatsApp</span>
      </a>

    </div>
  );
}

export default WhatsAppFloat;