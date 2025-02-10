# project-management-board

Starter project for ST0526 CICD

## Getting Started

1. Procure 2 Postgres Database (e.g. from Neon DB), one would be used for development and the other for test environment
2. Create 2 `.env` file named `.env.development` and `.env.test` both with the following content:

   ```
   DATABASE_URL=
   PORT=
   ```

   2.1 `DATABASE_URL`: Paste the connection string for development and test environment into the `.env` files respectively.
   2.2 Set PORT to `3000` for `.env.development` and `3001` for `.env.test`

3. Install dependencies: `npm install`
4. Setup database: `npm run migrate:reset`
5. Start server: `npm start`
6. Run end-2-end test: `npm test`


# Payment using Strip and installation of stripe, ngrok for webhook

## Getting Started

1. Create a Stripe Account: `If you don't already have a Stripe account, sign up at https://stripe.com.`
2. Obtain API Keys: `Go to the Dashboard in Stripe. https://dashboard.stripe.com/test/dashboard`
3. Under the `Developer tab` find for `API keys`.
4. You’ll find two types of keys: 
   `Publishable Key` (used on the client-side) which will be used in `cart.js`, `Secret Key` (used on the server-side) which will use in `app.js` and also in the .env
5. Set Up Your `.env` File
   ```
   STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXX # Your Secret Key
   STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX # Your Publishable Key
   ```
6. Install Stripe's Node.js Library: `npm install stripe`
7. Install ngrok: `Download ngrok from https://ngrok.com/download.`
   Or 
   If you have chocolatey you can install by usign this cmd:
   `choco install ngrok`
   `ngrok config add-authtoken 2pZDNUWmQRs2ForbxMhXOJ35T9U_824dki3bB531Lzci56MwR`
8. Once downloaded, unzip the file and move it to a directory in your PATH, or run it directly from the folder.
9. Start Your Local Server
10. In a new terminal window, run ngrok to expose your local development server on port 3000 
   `ngrok http 3000`
11. This will generate a public URL (e.g., https://.......ngrok-free.app) that you can use to test Stripe webhooks and copy 
    the link.
12. Go to your Stripe Dashboard. `https://dashboard.stripe.com/test/workbench/webhooks`
13. Click + Add endpoint.
14. Select the events you want to listen for (payment_intent.succeeded, payment_intent.payment_failed, checkout.session.   
    completed, checkout.session.async_payment_failed, checkout.session.async_payment_succeed ).
15. Selct the `Webhook endpoint.`
16. Paste your `https://.......ngrok-free.app/webhook` to the Endpoint URL. (`Don't forget to add /webhook behind the URL`)
17. Click `Add destination`.


## Running the Application

1. Ensure your .env is configured correctly with the Stripe keys.
2. Start the local server:
   `npm start`
3. Run ngrok to expose your local server:
   `ngrok http 3000`

## Testing differnt bank card for the payment

Go to `https://docs.stripe.com/testing?testing-method=card-numbers` to do the payment with the test card from Stripe.

    