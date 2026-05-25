# Closira — System Visuals Gallery

## 📱 Application Flow

The frontend client dashboard is built using a dark mode theme to provide clear visibility into live lead cycles and administrative widgets.

| Dashboard Core Views | Deep-Link Conversation Actions |
| :---: | :---: |
| ![App Flow 1](./images/app%20flow%201.png) <br> **Figure 1.1: Core KPI Metrics Widget View** | ![App Flow](./images/app%20flow.png) <br> **Figure 1.2: Thread History & Timeline Stepper** |

---

## ⚙️ Backend Pipeline & Swagger Documentation Flow

The following sequences illustrate request parsing, async thread execution logs, validation boundaries, and persistent data layers.

### Phase 1: Request Ingestion & Data Routing

| 01. Inbound Ingestion Pipeline | 02. Async Queue Return (HTTP 201) |
| :---: | :---: |
| ![API Init](./images/Screenshot_2026-05-25_180636.png) <br> **Route Params Configuration** | ![Async Return](./images/Screenshot_2026-05-25_180656.png) <br> **Job ID Ingestion Return** |

| 03. Validation Error Schema (HTTP 422) | 04. Follow-Up Task Registration |
| :---: | :---: |
| ![Schema Failure](./images/Screenshot_2026-05-25_180712.png) <br> **Pydantic Middleware Catch** | ![Follow-up Config](./images/Screenshot_2026-05-25_180723.png) <br> **Delay & Template Payload Setup** |

---

### Phase 2: Action Executions & System Escalations

| 05. Thread Follow-Up Confirmation | 06. Manual Intervention Target Route |
| :---: | :---: |
| ![Follow-up Complete](./images/Screenshot_2026-05-25_180737.png) <br> **Task Registered in Event Loop** | ![Manual Escalation](./images/Screenshot_2026-05-25_180746.png) <br> **Escalation Path Validation** |

| 07. Reason-Code Core Submission | 08. Mutation Lifecycle Success |
| :---: | :---: |
| ![Escalation Trigger Input](./images/Screenshot_2026-05-25_180757.png) <br> **Override Argument Parsing** | ![Status Mutated](./images/Screenshot_2026-05-25_180807.png) <br> **State Flipped to 'Escalated'** |

---

### Phase 3: Integrity Validation & Testing Records

| 09. DB Persistent Layer Fields | 10. Sequential Activity Audits (GET) |
| :---: | :---: |
| ![Persistence Map](./images/Screenshot_2026-05-25_180818.png) <br> **SQLAlchemy Model Constraints** | ![Audit Trails](./images/Screenshot_2026-05-25_180839.png) <br> **Historical Timeline History** |

| 11. Endpoint Integration Test Trace | 12. Active Database Health Probes |
| :---: | :---: |
| ![Test Output](./images/Screenshot_2026-05-25_180852.png) <br> **Integration Verification Run** | ![Health Checks](./images/Screenshot_2026-05-25_180903.png) <br> **Storage Connection Active** |

| 13. System Layout Compliance | 14. Data Environment Clean Reset |
| :---: | :---: |
| ![Schema Integrity](./images/Screenshot_2026-05-25_180917.png) <br> **Pydantic Contract Matches** | ![System Reset](./images/Screenshot_2026-05-25_180924.png) <br> **Clean Workspace Wipe** |
