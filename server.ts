import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Stripe from "stripe";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  let stripeClient: Stripe | null = null;

  function getStripe(): Stripe {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error('STRIPE_SECRET_KEY environment variable is required');
      }
      stripeClient = new Stripe(key);
    }
    return stripeClient;
  }

  // API routes
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { roomName, price, totalPrice, reservationId, origin, roomId } = req.body;
      
      if (!roomName || !price || !reservationId) {
        return res.status(400).json({ error: "Faltan datos requeridos (roomName, price, reservationId)" });
      }

      // Use the origin from the frontend as the base for redirects
      const baseUrl = origin || process.env.APP_URL || 'http://localhost:3000';
      
      // Check if Stripe key is available
      const key = process.env.STRIPE_SECRET_KEY;
      
      if (!key || key === "" || key.includes("TODO")) {
        console.warn("STRIPE_SECRET_KEY not found or invalid. Using local simulated checkout.");
        
        const roomIdParam = roomId ? `&roomId=${roomId}` : '';
        
        // Point to our internal simulated checkout page
        return res.json({ 
          url: `${baseUrl}/checkout-simulado?roomName=${encodeURIComponent(roomName)}&price=${price}&totalPrice=${totalPrice}&reservationId=${reservationId}${roomIdParam}`,
          simulated: true 
        });
      }

      const stripe = getStripe();

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
              unit_amount: Math.round(price * 100), // Stripe expects cents
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

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ 
        error: "Error al crear la sesión de pago", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
