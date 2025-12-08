# 🛒 Sustainable Shopping Helper

_A smart grocery companion for choosing healthier, eco-friendlier products._

Sustainable Shopping Helper is a web application built with **Vite**, **Firebase**, and the **OpenFoodFacts API**. It helps users discover sustainable food choices, view detailed product data, compare nutrition & environmental impact, and manage a personalized shopping list with notes and quantities.

This project includes user authentication, profile management, dynamic product exploration, and is fully deployed on Firebase Hosting.

**[Visit Site](https://shoppinghelper-989b4.web.app/)**

## 🚀 Features

**🔍 Smart Product Search**

- Search by keyword

- Browse category-based product suggestions (Fruits, Vegetables, Bakery, Dairy, Snacks, Beverages)

- Product cards show:

  - Image

  - Name & brand

  - Eco-score indicator

  - Quick nutrition summary

**📄 Product Details Page**

- Large product image

- Nutrition Facts table

- Environmental Impact estimation

- “Compare Alternatives” table

- Add to shopping list (auth-required)

- Clean, modern UI inspired by sustainability-focused e-commerce layouts

**📝 Shopping List**

- Add items from:

  - Search results

  - Product detail pages

  - Barcode input

- Each item supports:

  - Quantity updates

  - Custom notes (add/edit/delete)

  - Eco-score pill display

  - Delete item

- Fully persisted in Firestore under users/{uid}/shoppingList/{itemId}

**👤 User Authentication & Profile**

- Email/Password sign-in using Firebase Auth

- Profile page includes:

  - Avatar (photoURL)

  - First and last name

  - Email

  - Editable fields and Save/Cancel workflow

- Profile stored in both Firebase Auth and Firestore

- Auth-gated navigation:

  - Logged out: Sign Up / Login

  - Logged in: Home / Search / My Lists / Profile / Logout

**🏠 Landing Page**

- Public hero section

- Sustainability messaging

- CTA buttons

- When logged in, UI dynamically loads a personalized home dashboard

**⚠️ Custom 404 Page**

- Styled to match the rest of the application

- Includes navigation back to Home and Search

## 🧱 Technologies Used

**Frontend**

- Vite

- Vanilla JavaScript (ES Modules)

- HTML pages (multi-page setup via Vite inputs)

- CSS (custom styles)

- Google Fonts: Manrope

**Backend / Cloud Services**

- Firebase Authentication

- Cloud Firestore

- Firebase Hosting

- OpenFoodFacts API

## 🌱 OpenFoodFacts Integration

`getProductsByCategory(category, pageSize, opts)
getRandomProductsForCategory(category, count, pageSize, opts)
getProductByBarcode(barcode)`

Features:

- Field filtering for faster responses

- Country filtering ({ country: "United States" })

- Local caching for improved performance

- Safe fallbacks for missing images or data

## 🖥️ Application Flow

**1. Landing Page (index.html)**

- Shows hero + login/signup if not authenticated

- If authenticated:

- Public elements hidden

- Loads home.html dynamically

- Shows authenticated navigation

**2. Product Search**

- Queries OpenFoodFacts via search or category APIs

- Displays product cards

- Clicking a card → product.html?code=xxxx

**3. Product Details**

- Fetches full info using barcode

- Renders nutrition, sustainability, alternatives

- Add-to-list button (auth required)

**4. Shopping List**

- Loads user items from Firestore

- Supports:

- Quantity changes

- Note editing

- Deletion

- All updates merge into existing Firestore docs

**5. Profile Page**

- Reads from Firebase Auth + Firestore

- Editable fields with Save/Cancel

- Avatar URL supported

- Writes back to both systems

## 🛠️ Local Development

**Install dependencies**

`npm install`

**Start dev server**

`npm run dev`

**Build for production**

`npm run build`

**Deploy to Firebase**

`firebase deploy`

Makesure you're logged in and targeting your project:

`firebase login`

`firebase use --add`

## Future Enhancements

- Shopping list nutrition totals

- Barcode scanner using device camera

- Firebase Storage for profile image uploads

- More detailed sustainability scoring

- Category filters & sorting

- Dark mode

## 🙌 Acknowledgements

- **Firebase** — hosting, auth, Firestore

- **OpenFoodFacts** — product & nutrition data

- **Vite** — fast developer tooling

- **Manrope** — elegant UI font
