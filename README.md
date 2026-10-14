# Inthi Boutique 🛍️

A full-stack e-commerce catalogue built for **Inthi**, a real boutique store. Customers can browse products, choose variants such as size, add items to their bag, and send their order enquiry through WhatsApp—without creating an account or using an online payment gateway.

## ✨ Features

### Customer storefront
- Browse products, categories, banners, and product details
- Select available product variants and add items to the bag
- Continue an order through WhatsApp with the selected product details
- Responsive interface for desktop and mobile

### Admin dashboard
- Protected admin authentication using JWT
- Create, update, and remove products
- Manage categories, product variants/inventory, banners, and store settings
- Upload and manage product images with Cloudinary
- Password recovery email flow using Resend

## 🧰 Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, React Router, Redux Toolkit, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| Image storage | Cloudinary |
| Email | Resend |
| Deployment configuration | Netlify (frontend configuration included) |

## 🗂️ Project Structure

```text
inthi-boutique/
├── client/              # React storefront and admin interface
│   ├── public/
│   └── src/
├── server/              # Express API and PostgreSQL integration
│   ├── db.js
│   ├── server.js
│   └── .env.example
├── netlify.toml
└── README.md
```

## 🚀 Run Locally

### Prerequisites
- Node.js and npm
- PostgreSQL database
- Cloudinary account for image uploads
- Resend API key and a verified sender for password recovery emails

### 1. Clone the repository

```bash
git clone https://github.com/Siva20053/inthi-boutique.git
cd inthi-boutique
```

### 2. Configure the backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and fill in your local PostgreSQL credentials and the required service settings.

Important environment variables include:

- `PORT` — API port (defaults to 5000 in the example)
- `CLIENT_URL` — frontend origin allowed by the API
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — PostgreSQL connection
- `JWT_SECRET` — long, private random secret
- `CLOUDINARY_*` — image upload credentials
- `RESEND_API_KEY`, `ADMIN_RESET_FROM` — password recovery email settings
- `DATABASE_URL` — hosted PostgreSQL connection string, if using one

Ensure the PostgreSQL database and the tables expected by the API are created before running the application.

Start the API:

```bash
npm run dev
```

The local API is configured to use port **5000** by default. The health endpoint is available at `/api/health`.

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
```

Copy `client/.env.example` to `client/.env` and set the API URL:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React app:

```bash
npm start
```

The development server will print the local frontend URL in the terminal.

## 🔐 Security Notes

- Never commit real `.env` files, database passwords, JWT secrets, or API keys.
- Use strong, unique secrets and HTTPS in production.
- Configure the production frontend URL, database access, Cloudinary, and Resend settings in the deployment environment.

## 📌 Project Scope

Inthi is designed around a simple boutique workflow: customers browse and enquire through WhatsApp, while the store owner manages catalogue content and stock through the admin interface. It intentionally does not require customer accounts or an integrated payment gateway.

## 👨‍💻 Author

**Siva** · [GitHub](https://github.com/Siva20053) · [LinkedIn](https://www.linkedin.com/in/siva9963)
