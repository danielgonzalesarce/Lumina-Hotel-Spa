import Stripe from "stripe";

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { roomName, price, totalPrice, reservationId, origin, roomId } = req.body;
    
    if (!roomName || !price || !reservationId) {
      return res.status(400).json({ error: "Faltan datos requeridos (roomName, price, reservationId)" });
    }

    const baseUrl = origin || process.env.APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    
    const key = process.env.STRIPE_SECRET_KEY;
    
    if (!key || key === "" || key.includes("TODO")) {
      console.warn("STRIPE_SECRET_KEY not found or invalid. Using local simulated checkout.");
      const roomIdParam = roomId ? `&roomId=${roomId}` : '';
      return res.json({ 
        url: `${baseUrl}/checkout-simulado?roomName=${encodeURIComponent(roomName)}&price=${price}&totalPrice=${totalPrice}&reservationId=${reservationId}${roomIdParam}`,
        simulated: true 
      });
    }

    const stripe = new Stripe(key);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Adelanto 10% - Reserva: ${roomName}`,
              description: `ID: ${reservationId} | Total: $${totalPrice.toFixed(2)} | Saldo pendiente a pagar en hotel: $${(totalPrice - price).toFixed(2)}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/reserva?success=true&session_id={CHECKOUT_SESSION_ID}&reservationId=${reservationId}&roomId=${roomId}`,
      cancel_url: `${baseUrl}/reserva?canceled=true&reservationId=${reservationId}&roomId=${roomId}`,
      metadata: {
        reservationId: reservationId,
        totalPrice: totalPrice.toString(),
        depositPaid: price.toString()
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ 
      error: "Error al crear la sesión de pago", 
      message: error.message
    });
  }
}
