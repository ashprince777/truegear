# TrueGear - Smart Car Marketplace & Deal Ratings

TrueGear is a modern, high-performance automotive marketplace platform built with Next.js 14, Tailwind CSS, Prisma ORM, and SQLite. It features transparent algorithmic Deal Ratings (**Great Deal**, **Fair Deal**, and **High Price**) to ensure car shoppers and dealers always transact with market confidence.

![TrueGear Logo](/public/images/logo.png)

---

## Key Features

- **Algorithmic Deal Ratings**: Compares vehicle price, mileage, year, make, and body style against market averages to provide instant deal badges (Great Deal, Fair Deal, High Price).
- **Comprehensive Vehicle Inventory**: 50+ pre-seeded listings across 18 major automotive makes and 7 body styles (SUV, Sedan, Truck, Coupe, Convertible, Hatchback, Wagon).
- **Interactive Multi-Vehicle Comparison**: Side-by-side spec comparison matrix with difference highlighting, winner highlights, and persistent compare drawer dock.
- **Fast Search & Dynamic Filters**: Filter by Make, Model, Body Style, Drivetrain (AWD, FWD, RWD, 4WD), Fuel Type (Gas, Hybrid, EV, PHEV, Diesel), Condition, Price, and Mileage.
- **Interactive Map View**: Geolocation map integration powered by Leaflet to explore car listings visually.
- **Private Seller & Dealer Portals**: Create, manage, and track listings with full status controls and buyer inquiry inboxes.
- **Financing Calculator**: Interactive payment calculator with customizable down payment, APR %, and loan terms.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM**: [Prisma](https://www.prisma.io/) with SQLite (configurable to PostgreSQL/MySQL)
- **Authentication**: JWT cookie-based session authentication with bcrypt password hashing
- **Icons**: [Lucide React](https://lucide.dev/)
- **Map**: [Leaflet](https://leafletjs.com/) with React-Leaflet

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ashprince777/truegear.git
cd truegear
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Setup Database & Seed Data
```bash
npx prisma db push
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database schema (Listings, Users, Inquiries, Favorites, etc.)
│   └── seed.ts             # 50+ realistic verified inventory records
├── public/
│   ├── images/logo.png     # Official transparent brand logo
│   ├── images/logo-white.png # Dark-mode transparent brand logo
│   └── favicon.ico         # Custom site favicon
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── cars/           # Marketplace inventory & vehicle details
│   │   ├── compare/        # Side-by-side comparison page
│   │   ├── dealer/         # Dealer inventory portal
│   │   ├── sell/           # Private seller car listing flow
│   │   ├── dashboard/      # User dashboard & saved searches
│   │   └── api/            # REST API endpoints
│   ├── components/         # Reusable UI components (Navbar, Footer, CarCard, PriceGauge, etc.)
│   ├── context/            # Global state (AuthContext, CompareContext)
│   └── lib/                # Utility functions, Prisma client, deal rating algorithm
```

---

## License

MIT License.
