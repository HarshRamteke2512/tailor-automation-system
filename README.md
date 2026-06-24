# Tailor Shop Automation System

A low-cost, hardware-agnostic management system for custom tailoring boutiques. Uses a **4-digit token system** running on standard smartphones, tablets, and web browsers — no barcode scanners or proprietary hardware needed.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React / Vite)              │
│              TanStack Start PWA — port 5173             │
└────────────────────┬────────────────────────────────────┘
                     │  REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Java / Spring Boot — port 8089              │
│   Order CRUD, status transitions, customer, karigar,    │
│   financial ledger, notification triggers                │
└─────────┬───────────────────────────────────┬───────────┘
          │  HTTP callback                     │  SQL
          ▼                                   ▼
┌──────────────────────┐          ┌──────────────────────┐
│ Python / FastAPI     │          │     PostgreSQL       │
│ port 8000            │          │   port 5432          │
│                      │          │                      │
│ • WhatsApp           │          │ orders, customers,   │
│   notifications      │          │ karigars,            │
│ • Media upload/      │          │ financial_ledger     │
│   cleanup            │          │                      │
└──────────────────────┘          └──────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, TanStack Start, Tailwind CSS v4, shadcn/ui |
| Core API | Java 17+, Spring Boot 4.1, Spring Data JPA |
| Media & Notifications | Python 3, FastAPI, SQLAlchemy |
| Database | PostgreSQL (JSONB for flexible measurements) |
| Notifications | Meta WhatsApp Cloud API (dry-run available) |
| Speech-to-text | Web Speech API (browser-native, no external service) |

---

## Prerequisites

- **Java 17+** and Maven (`./mvnw` included in repo)
- **Python 3.10+**
- **PostgreSQL** (local or cloud)
- **Node.js 20+** and npm (or Bun)

---

## Quick Start — Local Development

### 1. Database

Create a PostgreSQL database:

```bash
createdb tailor-automation-system
```

Or via psql:

```sql
CREATE DATABASE "tailor-automation-system";
```

### 2. Python Backend

```bash
cd backend-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Java Backend

```bash
cd backend-java
./mvnw spring-boot:run
```

Starts on `http://localhost:8089`. Tables are auto-created by Hibernate (`ddl-auto=update`).

To use H2 in-memory (no PostgreSQL needed):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Starts on `http://localhost:5173`.

Open the Settings page to verify the Java API URL (`http://127.0.0.1:8089`) and Python URL (`http://127.0.0.1:8000`) are correct.

---

## Configuration

### Central Config (`backend-python/app/shop_details.py`)

All configurable variables in one place:

- **Database** — host, port, name, user, password
- **WhatsApp** — Phone Number ID, Access Token, API version, template name
- **File Upload** — max file size in MB

### Environment Variables (optional)

Create `backend-python/.env` (copy from `.env.example`):

```bash
cp backend-python/.env.example backend-python/.env
```

Variables in `.env` override defaults in `shop_details.py`:

```env
# ── PostgreSQL Database ──
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tailor-automation-system
DB_USER=postgres
DB_PASSWORD=Madhu@1006

# ── WhatsApp Cloud API (Meta) ──
# Get these from https://developers.facebook.com
# Leave empty for dry-run mode (messages logged, not sent)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_TEMPLATE_NAME=order_ready_for_pickup
```

**Note:** `.env` is gitignored and not committed. The `.env.example` file serves as a template.

---

## Repository Structure

```
tailor-automation-system/
├── backend-java/
│   ├── src/main/java/Tailor/demo/
│   │   ├── client/PythonFastApiClient.java   # HTTP calls to Python backend
│   │   ├── controller/
│   │   │   ├── OrderController.java
│   │   │   ├── CustomerController.java
│   │   │   ├── KarigarController.java
│   │   │   └── FinancialLedgerController.java
│   │   ├── entity/
│   │   │   ├── Order.java                     # phone, style, notes, fabricPhoto
│   │   │   ├── Customer.java
│   │   │   ├── Karigar.java
│   │   │   ├── JsonMapConverter.java          # Jackson-based JSONB converter
│   │   │   └── FinancialLedger.java
│   │   ├── repository/                        # Spring Data JPA repos
│   │   ├── service/                           # Business logic
│   │   └── CorsConfig.java
│   ├── src/main/resources/
│   │   ├── application.properties             # Default: PostgreSQL
│   │   └── application-h2.properties          # Profile: H2 in-memory
│   └── pom.xml
│
├── backend-python/
│   ├── app/
│   │   ├── main.py                            # FastAPI app & endpoints
│   │   ├── database.py                        # SQLAlchemy engine & session
│   │   ├── shop_details.py                    # Central config (DB, WhatsApp, limits)
│   │   ├── config.py                          # Meta Graph URL builder
│   │   └── static/uploads/                    # Fabric images
│   ├── .env.example                           # Template for environment vars
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── contexts/AppContext.tsx             # API calls, status management
│   │   ├── routes/
│   │   │   ├── index.tsx                      # Dashboard / order list
│   │   │   ├── counter.tsx                    # New order form (with speech-to-text)
│   │   │   ├── karigar.tsx                    # Karigar view (Numpad max 4 digits)
│   │   │   ├── token.$tokenId.tsx             # Token lookup
│   │   │   ├── settings.tsx                   # API URL config
│   │   │   └── login.tsx
│   │   └── components/ui/                     # shadcn/ui components
│   ├── package.json
│   ├── vite.config.ts
│   └── bunfig.toml
│
└── .gitignore
```

---

## Status Lifecycle

```
BOOKED ──▶ IN_PRODUCTION ──▶ COMPLETED ──▶ DELIVERED
  │                            │
  └─ (new order)               └─ WhatsApp notification fires
                                  + fabric image cleanup
```

| UI Status | API Status | Description |
|---|---|---|
| Pending | `BOOKED` | New order received |
| In Progress | `IN_PRODUCTION` | Being stitched |
| Completed | `COMPLETED` | Ready for pickup |
| Delivered | `DELIVERED` | Picked up; notification sent |

---

## API Endpoints

### Orders

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/orders` | List all orders |
| `POST` | `/api/orders` | Create order |
| `GET` | `/api/orders/{id}` | Get order by ID |
| `PUT` | `/api/orders/{id}` | Update order |
| `DELETE` | `/api/orders/{id}` | Delete order |
| `PUT` | `/api/orders/{id}/production` | Move to In Progress |
| `PUT` | `/api/orders/{id}/complete` | Move to Completed |
| `PUT` | `/api/orders/{id}/deliver` | Move to Delivered (fires notification + cleanup) |

### Customers, Karigars, Financial Ledger

Standard CRUD endpoints at `/api/customers`, `/api/karigars`, `/api/ledger`.

### Python Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/notify/status-update` | Send WhatsApp notification (called by Java on deliver) |
| `POST` | `/api/media/cleanup` | Delete fabric images for delivered order |
| `GET` | `/api/media/verify/{token_id}` | Verify fabric image before production |
| `POST` | `/api/media/upload` | Upload fabric image |

---

## WhatsApp Notifications

When an order is marked **Delivered**, the Java backend calls Python, which sends a WhatsApp message via Meta's Cloud API.

**Setup:**

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a Business App → add WhatsApp product
3. Copy your **Phone Number ID** and **Access Token**
4. Create a message template named `order_ready_for_pickup` (or use your own)
5. Set values in `backend-python/.env`:

```env
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAx...
WHATSAPP_TEMPLATE_NAME=order_ready_for_pickup
```

Leave these empty for **dry-run mode** — messages are logged to console, not sent.

---

## Deployment

### Option A: Render (3 services)

| Service | Type | Cost |
|---|---|---|
| Java API | Web Service (Free tier, spins down after 15min idle) | $0 |
| Python API | Web Service (Starter $7/mo) | $7/mo |
| Frontend | Web Service or Static Site | $0–$7/mo |
| PostgreSQL | Render Managed DB (Free tier, 1GB) | $0 |
| **Total** | | **$7–$14/mo** |

Before deploying, externalize these config values via environment variables:

- **Java:** `JDBC_DATABASE_URL`, `DB_USER`, `DB_PASSWORD`, `PYTHON_SERVER_URL`
- **Python:** `DATABASE_URL`, `WHATSAPP_*` vars (already env-ready)
- **Frontend:** API URL configurable via Settings UI (persisted in localStorage)

### Option B: Railway.app (~$5–$10/mo)

Better free credits for multi-service apps, no spin-down on free tier, automatic monorepo support.

### Option C: Docker bundle (cheapest)

Combine Java + Python in one container via Dockerfile with supervisord. Reduces to 1 Web Service (free tier). Convert frontend to static export to use free Static Site tier. **Total: $0/mo.**

---

## Features

- **4-digit token system** — simple, memorable, phone-friendly
- **Hands-free dictation** — Web Speech API for tailoring notes in any language
- **Visual fabric verification** — karigars confirm fabric photo before starting production
- **Hybrid JSONB schema** — flexible measurements per garment type (Kurta, Shirt, Sherwani, etc.)
- **Capacity pooling** — prevents overbooking by tracking estimated hours against workshop capacity
- **Cash/QR ledger** — manual payment recording, no external payment API needed
- **Auto media purge** — fabric images deleted on delivery to keep storage clean
- **WhatsApp notifications** — automated customer updates on order readiness (Meta Cloud API)
