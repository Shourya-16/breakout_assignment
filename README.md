# Closira - Customer Communication Platform for SMBs

Closira is an AI-powered customer communication platform for Small and Medium Businesses (SMBs). It handles inbound customer enquiries across WhatsApp, Email, and Phone, responding using business-defined Standard Operating Procedures (SOPs) to qualify leads, schedule follow-ups, and escalate to human agents when required.

This repository implements Closira's architecture, containing a Python FastAPI asynchronous backend pipeline and a high-fidelity React Native mobile dashboard for business owners.

---

## Repository Structure

```
├── /backend            # Python + FastAPI + SQLite + Background Tasks
│   ├── /app
│   │   ├── database.py   # SQLAlchemy & SQLite database setup
│   │   ├── logger.py     # Custom structured JSON logger setup
│   │   ├── main.py       # FastAPI REST endpoints
│   │   ├── models.py     # SQLAlchemy DB models & Pydantic schemas
│   │   └── worker.py     # SOP keyword matching background task logic
│   ├── requirements.txt  # Python requirements
│   ├── test_api.http     # HTTP REST Client test requests
│   └── test_endpoints.py # Automated integration verification script
│
├── /frontend           # React Native Mobile App (Expo + TypeScript)
│   ├── /src
│   │   ├── /components   # Atomic UI units (LeadCard, Badge, MetricSummary, etc.)
│   │   ├── /context      # AppContext global mock data and state mutations
│   │   ├── /navigation   # Native Stack & Bottom Tab Navigation setup
│   │   ├── /screens      # Dashboard, Leads, Escalations, Follow-ups, Detail Screens
│   │   └── /theme        # Premium styling dark theme definitions
│   ├── App.tsx           # Entry point wrapping navigation & state providers
│   ├── package.json      # React Native / Node packages
│   └── tsconfig.json     # TypeScript configuration
│
└── README.md           # Combined, detailed documentation
```

---

## 1. Backend API (Python + FastAPI)

The Closira backend is built using **FastAPI** and **SQLite** (via SQLAlchemy ORM). It processes enquiries asynchronously using FastAPI's built-in `BackgroundTasks` to qualify leads or escalate them instantly without blocking inbound API requests.

### 1.1 API Endpoints

| Method | Endpoint | Description | Payloads / Parameters |
|:---|:---|:---|:---|
| **POST** | `/enquiry` | Submits enquiry, triggers worker task, returns `job_id` | `channel` (WhatsApp/email/call), `customer_name`, `message` |
| **POST** | `/enquiry/{id}/follow-up` | Schedules a follow-up action for an open enquiry | `delay_minutes` (int), `message_template` (optional) |
| **POST** | `/enquiry/{id}/escalate` | Manually flags an enquiry as escalated | `reason` (string) |
| **GET** | `/enquiry/{id}/history` | Retrieves chronological message history and event timeline | None |
| **GET** | `/health` | Liveness health check confirming DB connection | None |

### 1.2 Keyword SOP Matching Rules
When a new enquiry is received, the async background worker scans the message body for specific keywords against four hardcoded Standard Operating Procedures (SOPs):

1. **Pricing Enquiry**
   - **Keywords**: `["price", "cost", "how much", "pricing", "rate", "quote", "charge", "payment"]`
   - **Suggested response**: *"Hi! Thanks for reaching out. Our standard package starts at $49/month, and our premium plan is $99/month. You can find our full pricing details at https://closira.com/pricing. Let me know if you would like to book a demo!"*
2. **Booking Enquiry**
   - **Keywords**: `["book", "reserve", "booking", "appointment", "schedule", "slot", "meeting", "call"]`
   - **Suggested response**: *"Hello! We would be happy to schedule a session for you. You can select a convenient time slot directly on our calendar: https://calendar.closira.com/booking. Looking forward to speaking with you!"*
3. **Support Request**
   - **Keywords**: `["help", "support", "broken", "issue", "error", "problem", "bug", "fail", "not working", "crash"]`
   - **Suggested response**: *"We're sorry to hear you're experiencing issues. A support ticket has been created, and our technical team will investigate this within the next hour. You can check updates on your ticket using our support portal."*
4. **General Info**
   - **Keywords**: `["info", "information", "about", "features", "what is", "closira", "services", "product"]`
   - **Suggested response**: *"Welcome to Closira! We are an AI-powered customer communication platform for SMBs, automating enquiries across WhatsApp, email, and calls. Learn more at https://closira.com/about."*

**Fallback / Auto-Escalation State**: If no keywords match the inbound message, the enquiry's status is automatically set to **Escalated**, a timeline event log is inserted, and a human agent escalation is logged in the worker process.

### 1.3 Structured JSON Logging
The backend utilizes standard Python logging formatted custom-configured to print structured JSON strings for key business events, such as:
- `enquiry_created`: Triggered on new API enquiry creation.
- `task_processed`: Logs background worker start/completion.
- `sop_matched`: Emitted when an inbound query matches an SOP keyword ruleset.
- `escalation_triggered`: Emitted when an enquiry gets flagged as escalated (auto or manual).

```json
{"timestamp": "2026-05-25T15:10:00.000Z", "level": "INFO", "message": "SOP matched: Pricing Enquiry for Enquiry ID 1", "logger": "closira", "event": "sop_matched", "enquiry_id": 1, "channel": "whatsapp", "customer_name": "Alice", "sop_label": "Pricing Enquiry"}
```

---

## 2. Frontend App (React Native Mobile Dashboard)

The frontend is a premium, interactive React Native application configured with Expo and TypeScript. It features a dark-mode theme, smooth navigation, and a global mock database state wrapper simulating server-driven state updates.

### 2.1 Screen Architectures

1. **Dashboard (Home Screen)**
   - **KPI Metrics Grid**: Displays cards for *Total Leads Today*, *Missed Enquiries*, *Open Escalations*, and *Follow-ups Due*.
   - **Quick Actions**: Prominent buttons to *Simulate Inbound Enquiry* (via a custom popup modal form) and *Reset State* (restoring default database).
   - **Activity Feed**: Dynamic list rendering the 5 most recent timeline logs sorted chronologically across all cases.
2. **Leads Screen**
   - Displays all active non-escalated leads using `FlatList`.
   - Filters for filtering leads by status (`All`, `New`, `Qualified`) and channel (`All`, `WhatsApp`, `Email`, `Call`).
   - Cards display Customer Name, Message, Channel Badge, Status Badge, and relative Time Ago. Tapping navigates to detail view.
3. **Escalations Screen**
   - Shows critical alerts demanding human attention.
   - Cards display Customer Name, Channel, Urgency Badge (`High` / `Medium`), Escalation Reason, and the customer message.
   - Interactive **Resolve Escalation** button: immediately updates the lead status to Qualified locally, modifying the dashboard KPIs.
4. **Follow-ups Screen**
   - Lists tasks needing attention. Cards display Customer name, due time, channel, template message, and a **Mark as Done** button that completes the follow-up task.
5. **Conversation Detail Screen**
   - Displays scrollable message thread history, active SOP match label, AI-generated case summary card, and a vertical stepper status timeline.
   - Includes action buttons to *Schedule Follow-up* (with custom delay minutes and template) and *Escalate to Agent* manually.

### 2.2 Strict Color Mapping & Styling Scales
- **Channel Badges**: WhatsApp = Green (`#10B981`), Email = Blue (`#3B82F6`), Call = Amber (`#F59E0B`).
- **Status Indicators**: New = Blue (`#3B82F6`), Qualified = Green (`#10B981`), Escalated = Red (`#EF4444`).
- **Empty State Fallback**: When lists or filters have zero results, a graceful `EmptyState` view is shown featuring positive microcopy and clean illustrations (e.g. "All Caught Up!").

---

## 3. Running & Verifying the Application

### 3.1 Running the Backend

Ensure Python 3.10+ is installed on your computer.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create virtual environment and install packages:
   ```bash
   python -m venv venv
   venv\Scripts\activate   # On Windows
   source venv/bin/activate # On macOS/Linux
   pip install -r requirements.txt
   ```
3. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
4. Verify by opening Swagger docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3.2 Running Backend Integration Tests

With the FastAPI server running on port 8000, run the automated integration test script:
```bash
cd backend
venv\Scripts\python test_endpoints.py
```
This tests all endpoints, tests error boundary cases (404 and 422 validations), and confirms the background worker timeline changes. You will see JSON logs emitted directly to the server terminal.

### 3.3 Running the Frontend

Ensure Node.js v18+ is installed on your computer.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Press **`w`** to open and preview the application in your web browser, or scan the QR code using the Expo Go mobile app (iOS/Android).
