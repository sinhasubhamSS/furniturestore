This is the project for my client to build full ecommerce website for his furniture website .
User

- \_id
- name
- email (unique)
- password
- phone
- role (customer/admin)
- createdAt

Product

- \_id
- name
- description
- price
- category
- brand
- stock
- images [array of image URLs]
- isFeatured
- createdAt

Wishlist

- \_id
- userId → User.\_id
- productId → Product.\_id
- createdAt

Cart

- \_id
- userId → User.\_id
- createdAt

CartItem

- \_id
- cartId → Cart.\_id
- productId → Product.\_id
- quantity
- priceAtThatTime
  Order
- \_id
- userId → User.\_id
- addressId → Address.\_id
- totalAmount
- status (pending, confirmed, shipped, delivered, cancelled)
- paymentStatus (pending, paid, failed)
- paymentMode (COD, online)
- createdAt
  OrderItem
- \_id
- orderId → Order.\_id
- productId → Product.\_id
- quantity
- priceAtThatTime
  Address
- \_id
- userId → User.\_id
- fullName
- phone
- pincode
- state
- city
- landmark
- addressLine
- isDefault
  Payment
- \_id
- orderId → Order.\_id
- status (success, failed, pending)
- transactionId
- paymentGateway (Razorpay, Stripe, etc.)
- paidAt
  Review
- \_id
- userId → User.\_id
- productId → Product.\_id
- rating (1 to 5)
- comment
- createdAt

  User
  ├── 1:1 Cart
  │ └── 1:N CartItems → Product
  ├── 1:N Wishlist → Product
  ├── 1:N Orders
  │ └── 1:N OrderItems → Product
  │ └── 1:1 Payment
  ├── 1:N Address
  └── 1:N Reviews → Product
  //can be improved while building this is inital idea or concept for this project
  suvidha-store/

                          +----------------+
                          |     USERS      |
                          +----------------+
                          | userId (PK)    |
                          | name           |
                          | email          |
                          | password       |
                          | phone          |
                          | role           |
                          +----------------+
                                 |
                +-----------------------------+
                |                             |
        +---------------+           +----------------+
        |   ADDRESSES   |           |    WISHLIST    |
        +---------------+           +----------------+
        | addressId (PK)|           | wishlistId (PK)|
        | userId (FK)   |           | userId (FK)    |
        | fullName      |           | productId (FK) |
        | phoneNumber   |           +----------------+
        | addressLine   |
        | city/state    |
        | pincode       |
        | isDefault     |
        +---------------+

                                 |
                                 v
                            +--------+
                            |  CART  |
                            +--------+
                            | cartId (PK)
                            | userId (FK)
                            +--------+
                                 |
                                 v
                      +------------------+
                      |    CART_ITEMS     |
                      +------------------+
                      | cartItemId (PK)  |
                      | cartId (FK)      |
                      | productId (FK)   |
                      | quantity         |
                      +------------------+

          +----------------+          +-------------------+
          |    PRODUCTS    |<-------->|     REVIEWS       |
          +----------------+          +-------------------+
          | productId (PK) |          | reviewId (PK)     |
          | title          |          | userId (FK)       |
          | slug           |          | productId (FK)    |
          | description    |          | rating (1–5)      |
          | basePrice      |          | comment           |
          | categoryId (FK)|          | createdAt         |
          | createdBy (FK) |          +-------------------+
          | images []      |
          +----------------+
                 |
                 v
          +----------------+
          |   CATEGORIES   |
          +----------------+
          | categoryId (PK)|
          | name           |
          | description    |
          +----------------+

          +----------------+
          |     STOCK      |
          +----------------+
          | productId (PK) |
          | quantity       |
          | updatedAt      |
          +----------------+

          +----------------+
          |    ORDERS      |
          +----------------+
          | orderId (PK)   |
          | userId (FK)    |
          | addressId (FK) |
          | totalAmount    |
          | couponCode     |
          | discountAmount |
          | paymentStatus  |
          | orderStatus    |
          | paymentMethod  |
          | orderedAt      |
          | deliveredAt    |
          +----------------+
                 |
                 v
          +-------------------+
          |   ORDER_ITEMS     |
          +-------------------+
          | orderItemId (PK)  |
          | orderId (FK)      |
          | productId (FK)    |
          | quantity          |
          | priceAtOrderTime  |
          +-------------------+

          +----------------+
          |    COUPONS     |
          +----------------+
          | couponId (PK)  |
          | code           |
          | discountType   |
          | value          |
          | minAmount      |
          | expiryDate     |
          | usedBy []      |
          +----------------+

          +----------------+
          |     SALES      |
          +----------------+
          | saleId (PK)    |
          | name           |
          | type           |
          | value          |
          | discountType   |
          | startDate      |
          | endDate        |
          | isActive       |
          +----------------+
                 |
                 v
          +-------------------+
          |   SALE_TARGETS    |
          +-------------------+
          | targetId (PK)     |
          | saleId (FK)       |
          | productId (FK)    |
          | categoryId (FK)   |
          +-------------------+

          +----------------------+
          |   RETURN_REQUESTS    |
          +----------------------+
          | returnId (PK)        |
          | orderId (FK)         |
          | reason               |
          | status               |
          | requestedAt          |
          | resolvedAt           |
          +----------------------+

├── src/
│ ├── app/
│ │ ├── layout.tsx ← Global layout
│ │ ├── page.tsx ← Home page (/)
│ │
│ │ ├── about/
│ │ │ └── page.tsx ← About us page (/about)
│ │
│ │ ├── contact/
│ │ │ └── page.tsx ← Contact page (/contact)
│ │
│ │ ├── products/
│ │ │ ├── page.tsx ← Product listing (/products)
│ │ │ └── [slug]/
│ │ │ └── page.tsx ← Product detail (/products/product-name)
│ │
│ │ ├── cart/
│ │ │ └── page.tsx ← Cart (/cart)
│ │
│ │ ├── wishlist/
│ │ │ └── page.tsx ← Wishlist (/wishlist)
│ │
│ │ ├── orders/
│ │ │ └── page.tsx ← Orders history (/orders)
│ │
│ │ ├── auth/
│ │ │ ├── login/page.tsx ← Login (/auth/login)
│ │ │ └── signup/page.tsx ← Signup (/auth/signup)
│ │
│ │ ├── dashboard/ ← Protected user dashboard
│ │ │ └── page.tsx
│ │
│ │ ├── api/ ← API routes (handled by server)
│ │ │ ├── auth/
│ │ │ │ ├── login/route.ts
│ │ │ │ └── signup/route.ts
│ │ │ ├── products/
│ │ │ │ └── route.ts
│ │ │ └── ...
│
│ ├── components/ ← All UI components (Navbar, Footer, Cards, etc)
│ ├── models/ ← Mongoose models
│ ├── lib/ ← DB connect, JWT helpers
│ ├── styles/ ← Global + modular styles
│ └── utils/ ← Price formatting, slugify, etc.
│
├── public/ ← Assets
├── .env.local ← Mongo URI, JWT_SECRET etc
├── next.config.js
├── package.json
└── README.md

Feature Use
Frontend Next.js + TypeScript
Auth JWT + Firebase phone OTP
DB MongoDB
Hosting Vercel
Payments (optional) Razorpay (later)
Admin Panel Your own route (e.g., /admin) to manage orders
