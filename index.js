const dotenv = require('dotenv');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 8000;

const storeItems = new Map([
    [1, { priceInCents: 10000, name: "Learn ReactJs"}],
    [2, { priceInCents: 20000, name: "Learn NodeJs"}]
]);

// app.get('/', (_, res)=> {
//     return res.status(200).json({success: `server up and running on PORT ${PORT}`});
// });

// app.post('/create-checkout-session', async (req, res) => {
//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             mode: 'payment',
//             success_url: `http://localhost:5000/success.html`,
//             cancel_url:  `http://localhost:5000/cancel.html`
//         });
//         return res.json({ url: session.url});
//     } catch (error) {
//         return res.status(500).json({ error: e.message });
//     }
// });
app.post("/create-checkout-session", async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.items.map(item => {
          const storeItem = storeItems.get(item.id)
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: storeItem.name,
              },
              unit_amount: storeItem.priceInCents,
            },
            quantity: item.quantity,
          }
        }),
        success_url: `${process.env.CLIENT_URL}/success.html`,
        cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
      })
      res.json({ url: session.url })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

app.listen(process.env.PORT, ()=>{
    console.log(`server up and running on PORT ${PORT}`);
});