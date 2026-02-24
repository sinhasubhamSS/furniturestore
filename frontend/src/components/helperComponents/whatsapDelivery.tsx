"use client";

interface WhatsAppDeliveryButtonProps {
  pincode?: string;
  items?: {
    name: string;
    quantity: number;
  }[];
  total?: number;
}

export default function WhatsAppDeliveryButton({
  pincode,
  items,
  total,
}: WhatsAppDeliveryButtonProps) {
  const handleClick = () => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    if (!phone) return;

    const hasItems = Array.isArray(items) && items.length > 0;

    const message = `
Hi, I want delivery assistance.

${pincode ? `Pincode: ${pincode}` : ""}

${
  hasItems
    ? `Items:
${items.map((item) => `${item.name} (Qty: ${item.quantity})`).join("\n")}`
    : ""
}

${typeof total === "number" ? `Total: ₹${total}` : ""}

Please assist.
`.trim();

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%",
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 10,
        fontWeight: 700,
        background: "#25D366",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      💬 Get Delivery Help on WhatsApp
    </button>
  );
}
