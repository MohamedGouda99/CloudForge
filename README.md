<p align="center">
  <img src="frontend/public/vodafone.png" alt="Vodafone CloudForge" width="120" />
</p>

<h1 align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=40&pause=1000&color=E60000&center=true&vCenter=true&width=600&height=70&lines=CloudForge;Enterprise+IaC+Platform;Terraform+Made+Visual" alt="CloudForge" />
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-E60000?style=for-the-badge&logo=semver&logoColor=white" alt="Version" />
  <img src="https://img.shields.io/badge/license-Enterprise-E60000?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License" />
  <img src="https://img.shields.io/badge/platform-Multi--Cloud-E60000?style=for-the-badge&logo=icloud&logoColor=white" alt="Platform" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AWS-FF9900?style=flat-square&logo=amazonaws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/Azure-0078D4?style=flat-square&logo=microsoftazure&logoColor=white" alt="Azure" />
  <img src="https://img.shields.io/badge/GCP-4285F4?style=flat-square&logo=googlecloud&logoColor=white" alt="GCP" />
  <img src="https://img.shields.io/badge/Terraform-7B42BC?style=flat-square&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/LocalStack-4D4D4D?style=flat-square&logo=amazonaws&logoColor=white" alt="LocalStack" />
</p>

<p align="center">
  <b>Visual Infrastructure as Code for Enterprise Teams</b><br/>
  <sub>Design, Deploy, and Manage Multi-Cloud Infrastructure with AI-Powered Assistance</sub>
</p>

---

## Overview

```
 ██████╗██╗      ██████╗ ██╗   ██╗██████╗ ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
██║     ██║     ██║   ██║██║   ██║██║  ██║█████╗  ██║   ██║██████╔╝██║  ███╗█████╗
██║     ██║     ██║   ██║██║   ██║██║  ██║██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
 ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

**CloudForge** is a next-generation Infrastructure as Code (IaC) platform that transforms how enterprise teams design, deploy, and manage cloud infrastructure across AWS, Azure, and Google Cloud Platform.

---

## Tech Stack

<table>
<tr>
<td width="50%">

### Backend Architecture
```yaml
Framework:    FastAPI 0.104+
Language:     Python 3.11+
Database:     PostgreSQL 15
ORM:          SQLAlchemy 2.0
Auth:         JWT + OAuth2
Validation:   Pydantic v2
Async:        Uvicorn + ASGI
```

</td>
<td width="50%">

### Frontend Architecture
```yaml
Framework:    React 18.3+
Language:     TypeScript 5.6+
State:        Zustand
Styling:      TailwindCSS 3.4
Canvas:       React Flow
Build:        Vite 6.0
HTTP:         Axios
```

</td>
</tr>
</table>

### Infrastructure & DevOps

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DOCKER COMPOSE                                │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────────┤
│   Backend   │  Frontend   │  PostgreSQL │  LocalStack │    Nginx       │
│   :8000     │   :5173     │    :5432    │    :4566    │     :80        │
├─────────────┴─────────────┴─────────────┴─────────────┴────────────────┤
│                         SECURITY LAYER                                  │
│              TFSec • Terrascan • Infracost • OPA                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Visual Infrastructure Designer

```
┌────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │    VPC      │───▶│   Subnet    │───▶│  Instance   │            │
│  │  10.0.0.0   │    │  10.0.1.0   │    │   t3.micro  │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│         │                  │                  │                    │
│         ▼                  ▼                  ▼                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   Gateway   │    │  Security   │    │   Storage   │            │
│  │   Internet  │    │    Group    │    │     S3      │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
└────────────────────────────────────────────────────────────────────┘
```

| Feature | Description |
|---------|-------------|
| **Drag & Drop Designer** | Visual canvas with 100+ cloud resource icons |
| **Smart Connections** | Auto-routing edges with dependency detection |
| **Real-time Preview** | Live Terraform code generation |
| **Multi-Cloud Support** | AWS, Azure, GCP unified interface |

### Security & Compliance

```
Security Pipeline
═══════════════════════════════════════════════════════════════════

[Terraform Code] ──▶ [TFSec Scan] ──▶ [Terrascan] ──▶ [Deploy]
                          │                │
                          ▼                ▼
                    ┌──────────┐    ┌──────────┐
                    │ Critical │    │  Policy  │
                    │  Issues  │    │Violations│
                    └──────────┘    └──────────┘
```

| Tool | Purpose | Integration |
|------|---------|-------------|
| **TFSec** | Static security analysis | CLI + Real-time |
| **Terrascan** | Policy as code | OPA Rego policies |
| **Infracost** | Cost estimation | Background auto-run |

### Cost Analytics

```
╔═══════════════════════════════════════════════════════════════════╗
║                    COST ANALYTICS DASHBOARD                        ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   Total Monthly Cost          │  Cost Distribution                ║
║   ┌──────────────────┐        │  ┌─────────────────────────┐     ║
║   │    $70.88        │        │  │ AWS ████████████  100%  │     ║
║   │    ▲ +5%         │        │  │ Azure              0%   │     ║
║   └──────────────────┘        │  │ GCP                0%   │     ║
║                               │  └─────────────────────────┘     ║
║   Resources: 5  │  Projects: 1                                    ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## System Architecture

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=E60000&center=true&vCenter=true&width=500&height=40&lines=Full+Stack+Architecture;Multi-Tier+Design;Enterprise+Ready" alt="System Architecture" />
</p>

```
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║                                 CLOUDFORGE SYSTEM ARCHITECTURE                             ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                            ║
║    ┌─────────────────────────────────────────────────────────────────────────────────┐    ║
║    │                              PRESENTATION LAYER                                  │    ║
║    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │    ║
║    │  │   Browser   │  │   Desktop   │  │   Mobile    │  │    CLI      │            │    ║
║    │  │   Client    │  │    App      │  │    App      │  │   Tools     │            │    ║
║    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │    ║
║    └─────────┼────────────────┼────────────────┼────────────────┼────────────────────┘    ║
║              │                │                │                │                          ║
║              └────────────────┴────────────────┴────────────────┘                          ║
║                                        │                                                   ║
║                                        ▼                                                   ║
║    ┌─────────────────────────────────────────────────────────────────────────────────┐    ║
║    │                                 API GATEWAY                                      │    ║
║    │                            ┌───────────────────┐                                 │    ║
║    │                            │       Nginx       │                                 │    ║
║    │                            │   Load Balancer   │                                 │    ║
║    │                            │   SSL/TLS Term    │                                 │    ║
║    │                            │   Rate Limiting   │                                 │    ║
║    │                            └─────────┬─────────┘                                 │    ║
║    └──────────────────────────────────────┼───────────────────────────────────────────┘    ║
║                                           │                                                ║
║                                           ▼                                                ║
║    ┌─────────────────────────────────────────────────────────────────────────────────┐    ║
║    │                              APPLICATION LAYER                                   │    ║
║    │  ┌────────────────────────────────────────────────────────────────────────────┐ │    ║
║    │  │                         FastAPI Backend Server                              │ │    ║
║    │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │    ║
║    │  │  │  Auth API    │  │ Projects API │  │ Terraform API│  │ Dashboard API│   │ │    ║
║    │  │  │  /api/auth   │  │ /api/projects│  │/api/terraform│  │/api/dashboard│   │ │    ║
║    │  │  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤   │ │    ║
║    │  │  │• Login       │  │• CRUD Ops    │  │• Generate    │  │• Stats       │   │ │    ║
║    │  │  │• Register    │  │• Resources   │  │• Validate    │  │• Analytics   │   │ │    ║
║    │  │  │• JWT Tokens  │  │• Diagram     │  │• Plan/Apply  │  │• Metrics     │   │ │    ║
║    │  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │ │    ║
║    │  └────────────────────────────────────────────────────────────────────────────┘ │    ║
║    └─────────────────────────────────────────────────────────────────────────────────┘    ║
║                                           │                                                ║
║                    ┌──────────────────────┼──────────────────────┐                        ║
║                    │                      │                      │                        ║
║                    ▼                      ▼                      ▼                        ║
║    ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐            ║
║    │    DATA LAYER       │  │   SECURITY LAYER    │  │   EXTERNAL LAYER    │            ║
║    │  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │            ║
║    │  │  PostgreSQL   │  │  │  │    TFSec      │  │  │  │  LocalStack   │  │            ║
║    │  │   Database    │  │  │  │  Security Scan │  │  │  │ AWS Emulator  │  │            ║
║    │  ├───────────────┤  │  │  └───────────────┘  │  │  └───────────────┘  │            ║
║    │  │• Users        │  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │            ║
║    │  │• Projects     │  │  │  │   Terrascan   │  │  │  │    AWS S3     │  │            ║
║    │  │• Resources    │  │  │  │ Policy Checks │  │  │  │  (Production) │  │            ║
║    │  │• Cost Data    │  │  │  └───────────────┘  │  │  └───────────────┘  │            ║
║    │  └───────────────┘  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │            ║
║    │                     │  │  │   Infracost   │  │  │  │ Azure/GCP     │  │            ║
║    │                     │  │  │ Cost Analysis │  │  │  │   Clouds      │  │            ║
║    │                     │  │  └───────────────┘  │  │  └───────────────┘  │            ║
║    └─────────────────────┘  └─────────────────────┘  └─────────────────────┘            ║
║                                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Software Architecture

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=E60000&center=true&vCenter=true&width=600&height=40&lines=Frontend+Architecture;React+%2B+TypeScript+%2B+Zustand;Component-Based+Design" alt="Frontend Architecture" />
</p>

### Frontend Architecture (React)

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                              FRONTEND ARCHITECTURE                                      ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                              ROUTING LAYER                                        │ ║
║   │                         React Router v6 + Guards                                  │ ║
║   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │ ║
║   │  │     /       │ │  /login     │ │ /dashboard  │ │ /analytics  │ │ /projects/ │ │ ║
║   │  │  Landing    │ │   Auth      │ │  Protected  │ │  Protected  │ │   :id      │ │ ║
║   │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                              FEATURE MODULES                                      │ ║
║   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │ ║
║   │  │   Dashboard    │  │    Designer    │  │   Analytics    │  │   Assistant    │ │ ║
║   │  │   Module       │  │    Module      │  │    Module      │  │    Module      │ │ ║
║   │  ├────────────────┤  ├────────────────┤  ├────────────────┤  ├────────────────┤ │ ║
║   │  │ EnhancedDash   │  │ DesignerPage   │  │ AnalyticsPage  │  │ AssistantPage  │ │ ║
║   │  │ MetricsCard    │  │ ReactFlow      │  │ DonutChart     │  │ ChatInterface  │ │ ║
║   │  │ ProjectList    │  │ InspectorPanel │  │ BarChart       │  │ AIResponses    │ │ ║
║   │  │ QuickActions   │  │ ToolbarPanel   │  │ CostTable      │  │ Suggestions    │ │ ║
║   │  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘ │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                              STATE MANAGEMENT                                     │ ║
║   │                               Zustand Stores                                      │ ║
║   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │ ║
║   │  │   authStore    │  │  projectStore  │  │ designerStore  │  │   uiStore      │ │ ║
║   │  ├────────────────┤  ├────────────────┤  ├────────────────┤  ├────────────────┤ │ ║
║   │  │ • token        │  │ • projects[]   │  │ • nodes[]      │  │ • theme        │ │ ║
║   │  │ • user         │  │ • selected     │  │ • edges[]      │  │ • sidebar      │ │ ║
║   │  │ • isAuth       │  │ • loading      │  │ • selectedNode │  │ • modals       │ │ ║
║   │  │ • login()      │  │ • fetchAll()   │  │ • addNode()    │  │ • toasts       │ │ ║
║   │  │ • logout()     │  │ • create()     │  │ • connect()    │  │ • loading      │ │ ║
║   │  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘ │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                               SERVICE LAYER                                       │ ║
║   │  ┌─────────────────────────────────────────────────────────────────────────────┐ │ ║
║   │  │                            API Client (Axios)                                │ │ ║
║   │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │ ║
║   │  │  │ Interceptors │  │  Auth Token  │  │ Error Handler│  │  Base URL    │    │ │ ║
║   │  │  │  Request     │  │  Injection   │  │  Global      │  │  Config      │    │ │ ║
║   │  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │ │ ║
║   │  └─────────────────────────────────────────────────────────────────────────────┘ │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=E60000&center=true&vCenter=true&width=600&height=40&lines=Backend+Architecture;FastAPI+%2B+SQLAlchemy+%2B+Pydantic;Layered+Design+Pattern" alt="Backend Architecture" />
</p>

### Backend Architecture (FastAPI)

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                               BACKEND ARCHITECTURE                                      ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                              API ROUTER LAYER                                     │ ║
║   │                          FastAPI Endpoints + OpenAPI                              │ ║
║   │                                                                                   │ ║
║   │    /api/auth          /api/projects       /api/terraform      /api/dashboard     │ ║
║   │   ┌─────────┐        ┌─────────┐         ┌─────────┐         ┌─────────┐        │ ║
║   │   │ login   │        │  CRUD   │         │ generate│         │  stats  │        │ ║
║   │   │ register│        │resources│         │ validate│         │analytics│        │ ║
║   │   │ me      │        │ diagram │         │ plan    │         │ export  │        │ ║
║   │   │ refresh │        │ export  │         │ apply   │         │         │        │ ║
║   │   └─────────┘        └─────────┘         │ tfsec   │         └─────────┘        │ ║
║   │                                          │terrascan│                             │ ║
║   │                                          │infracost│                             │ ║
║   │                                          └─────────┘                             │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                      ┌───────────────────┼───────────────────┐                         ║
║                      ▼                   ▼                   ▼                         ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                            BUSINESS LOGIC LAYER                                   │ ║
║   │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐         │ ║
║   │  │   Auth Service     │  │  Terraform Service │  │   Cost Service     │         │ ║
║   │  ├────────────────────┤  ├────────────────────┤  ├────────────────────┤         │ ║
║   │  │ • Password Hashing │  │ • HCL Generation   │  │ • Infracost API    │         │ ║
║   │  │ • JWT Creation     │  │ • Provider Config  │  │ • Cost Aggregation │         │ ║
║   │  │ • Token Validation │  │ • Resource Mapping │  │ • Currency Convert │         │ ║
║   │  │ • Session Mgmt     │  │ • State Management │  │ • Breakdown Parse  │         │ ║
║   │  └────────────────────┘  └────────────────────┘  └────────────────────┘         │ ║
║   │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐         │ ║
║   │  │  Security Service  │  │  Project Service   │  │  Resource Service  │         │ ║
║   │  ├────────────────────┤  ├────────────────────┤  ├────────────────────┤         │ ║
║   │  │ • TFSec Scanner    │  │ • CRUD Operations  │  │ • Type Validation  │         │ ║
║   │  │ • Terrascan Checks │  │ • Diagram Storage  │  │ • Config Schema    │         │ ║
║   │  │ • Policy Enforce   │  │ • Version Control  │  │ • Dependency Graph │         │ ║
║   │  │ • Vuln Reports     │  │ • Access Control   │  │ • Position Mgmt    │         │ ║
║   │  └────────────────────┘  └────────────────────┘  └────────────────────┘         │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                            DATA ACCESS LAYER                                      │ ║
║   │                        SQLAlchemy ORM + Pydantic                                  │ ║
║   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │ ║
║   │  │   User Model    │  │  Project Model  │  │ Resource Model  │                   │ ║
║   │  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │                   │ ║
║   │  │  │ id        │  │  │  │ id        │  │  │  │ id        │  │                   │ ║
║   │  │  │ username  │  │  │  │ name      │  │  │  │ type      │  │                   │ ║
║   │  │  │ email     │  │  │  │ owner_id  │  │  │  │ project_id│  │                   │ ║
║   │  │  │ password  │  │  │  │ provider  │  │  │  │ config    │  │                   │ ║
║   │  │  │ is_active │  │  │  │ diagram   │  │  │  │ position  │  │                   │ ║
║   │  │  └───────────┘  │  │  │ tf_config │  │  │  └───────────┘  │                   │ ║
║   │  └─────────────────┘  │  └───────────┘  │  └─────────────────┘                   │ ║
║   │                       └─────────────────┘                                         │ ║
║   │  ┌─────────────────────────────────────────────────────────────────────────────┐ │ ║
║   │  │                          CostEstimate Model                                  │ │ ║
║   │  │   id │ project_id │ monthly_cost │ currency │ resources_count │ breakdown   │ │ ║
║   │  └─────────────────────────────────────────────────────────────────────────────┘ │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                          DATABASE LAYER (PostgreSQL)                              │ ║
║   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │ ║
║   │  │   users    │  │  projects  │  │ resources  │  │cost_estim. │                 │ ║
║   │  │    PK      │◄─│    FK      │◄─│    FK      │  │    FK      │                 │ ║
║   │  └────────────┘  └────────────┘  └────────────┘  └────────────┘                 │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Data Flow Architecture

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=E60000&center=true&vCenter=true&width=500&height=40&lines=Request+Lifecycle;End-to-End+Data+Flow;Async+Processing" alt="Data Flow" />
</p>

### Request Lifecycle

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                              REQUEST LIFECYCLE FLOW                                     ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║  ┌─────────┐                                                               ┌─────────┐ ║
║  │  User   │                                                               │  User   │ ║
║  │ Browser │                                                               │ Browser │ ║
║  └────┬────┘                                                               └────▲────┘ ║
║       │ 1. HTTP Request                                               10. Response │   ║
║       │    (POST /api/projects)                                          (JSON)    │   ║
║       ▼                                                                            │   ║
║  ┌─────────────────┐                                                               │   ║
║  │   React App     │                                                               │   ║
║  │  ┌───────────┐  │  2. API Call                                                  │   ║
║  │  │ Component │──┼──────────────────────────────────────────────────────────┐    │   ║
║  │  └───────────┘  │                                                          │    │   ║
║  │  ┌───────────┐  │                                                          │    │   ║
║  │  │  Zustand  │◄─┼──────────────────────────────────────────────────────────┼────┘   ║
║  │  │   Store   │  │  9. Update State                                         │        ║
║  │  └───────────┘  │                                                          │        ║
║  └─────────────────┘                                                          │        ║
║                                                                               │        ║
║       ┌───────────────────────────────────────────────────────────────────────┘        ║
║       │                                                                                 ║
║       ▼                                                                                 ║
║  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐                   ║
║  │   Axios Client  │────▶│    Nginx        │────▶│   FastAPI       │                   ║
║  │  + Interceptors │     │   Reverse Proxy │     │   ASGI Server   │                   ║
║  └─────────────────┘     └─────────────────┘     └────────┬────────┘                   ║
║       3. Add Auth Token                                    │ 4. Validate JWT            ║
║                                                            ▼                            ║
║                                              ┌─────────────────────────┐               ║
║                                              │    Route Handler        │               ║
║                                              │  ┌─────────────────┐    │               ║
║                                              │  │ Depends(get_db) │    │               ║
║                                              │  │ Depends(auth)   │    │               ║
║                                              │  └────────┬────────┘    │               ║
║                                              └───────────┼─────────────┘               ║
║                                                          │ 5. Execute Logic            ║
║                                                          ▼                              ║
║                    ┌─────────────────────────────────────────────────────────────┐     ║
║                    │                    SERVICE LAYER                             │     ║
║                    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │     ║
║                    │  │ Validation   │─▶│  Business    │─▶│  Background  │       │     ║
║                    │  │   Logic      │  │   Logic      │  │    Tasks     │       │     ║
║                    │  └──────────────┘  └──────────────┘  └──────────────┘       │     ║
║                    └─────────────────────────┬───────────────────────────────────┘     ║
║                                              │ 6. Query/Mutate                          ║
║                                              ▼                                          ║
║                    ┌─────────────────────────────────────────────────────────────┐     ║
║                    │                    SQLAlchemy ORM                            │     ║
║                    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │     ║
║                    │  │   Session    │─▶│    Query     │─▶│   Commit     │       │     ║
║                    │  │   Begin      │  │   Execute    │  │   Close      │       │     ║
║                    │  └──────────────┘  └──────────────┘  └──────────────┘       │     ║
║                    └─────────────────────────┬───────────────────────────────────┘     ║
║                                              │ 7. SQL                                   ║
║                                              ▼                                          ║
║                    ┌─────────────────────────────────────────────────────────────┐     ║
║                    │                    PostgreSQL Database                       │     ║
║                    │  ┌──────────────────────────────────────────────────────┐   │     ║
║                    │  │  INSERT INTO projects (name, owner_id) VALUES (...)  │   │     ║
║                    │  │  RETURNING id, name, created_at                      │   │     ║
║                    │  └──────────────────────────────────────────────────────┘   │     ║
║                    └─────────────────────────┬───────────────────────────────────┘     ║
║                                              │ 8. Result                                ║
║                                              ▼                                          ║
║                    ┌─────────────────────────────────────────────────────────────┐     ║
║                    │                 Pydantic Response Model                      │     ║
║                    │  { "id": 1, "name": "project", "status": "created" }        │     ║
║                    └─────────────────────────────────────────────────────────────┘     ║
║                                                                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Terraform Generation Flow

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=E60000&center=true&vCenter=true&width=500&height=40&lines=IaC+Pipeline;Visual+to+Terraform;Multi-Cloud+Support" alt="Terraform Flow" />
</p>

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                           TERRAFORM GENERATION PIPELINE                                 ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║   ┌──────────────────────────────────────────────────────────────────────────────┐     ║
║   │                           VISUAL DESIGNER INPUT                               │     ║
║   │                                                                               │     ║
║   │    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                 │     ║
║   │    │   VPC   │───▶│ Subnet  │───▶│   EC2   │───▶│   S3    │                 │     ║
║   │    └─────────┘    └─────────┘    └─────────┘    └─────────┘                 │     ║
║   │         │                              │                                      │     ║
║   │         ▼                              ▼                                      │     ║
║   │    ┌─────────┐                   ┌─────────┐                                 │     ║
║   │    │   IGW   │                   │   SG    │                                 │     ║
║   │    └─────────┘                   └─────────┘                                 │     ║
║   │                                                                               │     ║
║   └──────────────────────────────────────────────────────────────────────────────┘     ║
║                                          │                                              ║
║                                          │ 1. Extract Nodes & Edges                     ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────┐     ║
║   │                           RESOURCE TRANSFORMER                                │     ║
║   │                                                                               │     ║
║   │   nodes = [                        resources = [                              │     ║
║   │     { id: "vpc-1", type: "vpc" }      { type: "aws_vpc", name: "main" }      │     ║
║   │     { id: "sub-1", type: "subnet" }   { type: "aws_subnet", name: "pub" }   │     ║
║   │     { id: "ec2-1", type: "ec2" }      { type: "aws_instance", name: "web" } │     ║
║   │   ]                                 ]                                         │     ║
║   │                                                                               │     ║
║   └──────────────────────────────────────────────────────────────────────────────┘     ║
║                                          │                                              ║
║                                          │ 2. Build Dependency Graph                    ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────┐     ║
║   │                           DEPENDENCY RESOLVER                                 │     ║
║   │                                                                               │     ║
║   │   aws_vpc.main                                                                │     ║
║   │        │                                                                      │     ║
║   │        ├──────────────────────┐                                               │     ║
║   │        ▼                      ▼                                               │     ║
║   │   aws_subnet.public    aws_internet_gateway.main                             │     ║
║   │        │                      │                                               │     ║
║   │        ▼                      │                                               │     ║
║   │   aws_instance.web ◄──────────┘                                               │     ║
║   │        │                                                                      │     ║
║   │        ▼                                                                      │     ║
║   │   aws_security_group.web                                                      │     ║
║   │                                                                               │     ║
║   └──────────────────────────────────────────────────────────────────────────────┘     ║
║                                          │                                              ║
║                                          │ 3. Generate HCL                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────┐     ║
║   │                            HCL CODE GENERATOR                                 │     ║
║   │                                                                               │     ║
║   │   terraform {                                                                 │     ║
║   │     required_providers {                                                      │     ║
║   │       aws = { source = "hashicorp/aws" }                                     │     ║
║   │     }                                                                         │     ║
║   │   }                                                                           │     ║
║   │                                                                               │     ║
║   │   resource "aws_vpc" "main" {                                                │     ║
║   │     cidr_block = "10.0.0.0/16"                                               │     ║
║   │     tags = { Name = "main-vpc" }                                             │     ║
║   │   }                                                                           │     ║
║   │                                                                               │     ║
║   │   resource "aws_subnet" "public" {                                           │     ║
║   │     vpc_id     = aws_vpc.main.id                                             │     ║
║   │     cidr_block = "10.0.1.0/24"                                               │     ║
║   │   }                                                                           │     ║
║   │                                                                               │     ║
║   └──────────────────────────────────────────────────────────────────────────────┘     ║
║                                          │                                              ║
║            ┌─────────────────────────────┼─────────────────────────────┐               ║
║            │                             │                             │               ║
║            ▼                             ▼                             ▼               ║
║   ┌────────────────┐          ┌────────────────┐          ┌────────────────┐          ║
║   │    TFSec       │          │   Terrascan    │          │   Infracost    │          ║
║   │  Security Scan │          │  Policy Check  │          │  Cost Estimate │          ║
║   ├────────────────┤          ├────────────────┤          ├────────────────┤          ║
║   │ ✓ No Criticals │          │ ✓ Compliant    │          │ $70.88/month   │          ║
║   │ ⚠ 2 Warnings   │          │ ⚠ 1 Advisory   │          │ 5 Resources    │          ║
║   └────────────────┘          └────────────────┘          └────────────────┘          ║
║                                          │                                              ║
║                                          │ 4. Store Results                             ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────┐     ║
║   │                              DATABASE STORAGE                                 │     ║
║   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │     ║
║   │  │  tf_config   │  │ security_    │  │  policy_     │  │   cost_      │     │     ║
║   │  │  (HCL Code)  │  │   results    │  │   results    │  │  estimates   │     │     ║
║   │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │     ║
║   └──────────────────────────────────────────────────────────────────────────────┘     ║
║                                                                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Security Architecture

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=E60000&center=true&vCenter=true&width=500&height=40&lines=Defense+in+Depth;Zero+Trust+Design;Compliance+Ready" alt="Security Architecture" />
</p>

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                              SECURITY ARCHITECTURE                                      ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                          PERIMETER SECURITY                                       │ ║
║   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │ ║
║   │  │   Nginx WAF     │  │  Rate Limiting  │  │   CORS Policy   │                   │ ║
║   │  │  • SQL Inject   │  │  • 100 req/min  │  │  • Origin Check │                   │ ║
║   │  │  • XSS Filter   │  │  • Burst: 20    │  │  • Credentials  │                   │ ║
║   │  │  • CSRF Protect │  │  • IP Blocking  │  │  • Methods      │                   │ ║
║   │  └─────────────────┘  └─────────────────┘  └─────────────────┘                   │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                        AUTHENTICATION LAYER                                       │ ║
║   │                                                                                   │ ║
║   │   ┌─────────────────────────────────────────────────────────────────────────┐   │ ║
║   │   │                         JWT Token Flow                                   │   │ ║
║   │   │                                                                          │   │ ║
║   │   │   Login Request ──▶ Validate Creds ──▶ Generate JWT ──▶ Return Token    │   │ ║
║   │   │                                            │                             │   │ ║
║   │   │                                            ▼                             │   │ ║
║   │   │                                   ┌─────────────────┐                    │   │ ║
║   │   │                                   │ JWT Payload     │                    │   │ ║
║   │   │                                   │ • sub: user_id  │                    │   │ ║
║   │   │                                   │ • exp: timestamp│                    │   │ ║
║   │   │                                   │ • iat: issued   │                    │   │ ║
║   │   │                                   └─────────────────┘                    │   │ ║
║   │   │                                                                          │   │ ║
║   │   │   API Request ──▶ Extract Token ──▶ Verify Signature ──▶ Check Expiry   │   │ ║
║   │   │                                                               │          │   │ ║
║   │   │                                                               ▼          │   │ ║
║   │   │                                                        Grant/Deny Access │   │ ║
║   │   └─────────────────────────────────────────────────────────────────────────┘   │ ║
║   │                                                                                   │ ║
║   │   Password Security:  bcrypt with salt rounds = 12                               │ ║
║   │   Token Expiry:       24 hours (configurable)                                    │ ║
║   │   Algorithm:          HS256 (HMAC-SHA256)                                        │ ║
║   │                                                                                   │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                        AUTHORIZATION LAYER                                        │ ║
║   │                                                                                   │ ║
║   │   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │ ║
║   │   │  Route Guards   │    │ Resource RBAC   │    │  Data Filtering │             │ ║
║   │   ├─────────────────┤    ├─────────────────┤    ├─────────────────┤             │ ║
║   │   │ • Public routes │    │ • Owner check   │    │ • Query scoping │             │ ║
║   │   │ • Auth required │    │ • Team access   │    │ • Join filters  │             │ ║
║   │   │ • Admin only    │    │ • Project perms │    │ • Row-level sec │             │ ║
║   │   └─────────────────┘    └─────────────────┘    └─────────────────┘             │ ║
║   │                                                                                   │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                          │                                              ║
║                                          ▼                                              ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                       INFRASTRUCTURE SECURITY                                     │ ║
║   │                                                                                   │ ║
║   │   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐            │ ║
║   │   │     TFSec        │   │    Terrascan     │   │      OPA         │            │ ║
║   │   │  Static Analysis │   │  Policy Engine   │   │   Rego Policies  │            │ ║
║   │   ├──────────────────┤   ├──────────────────┤   ├──────────────────┤            │ ║
║   │   │ • AWS checks     │   │ • CIS benchmarks │   │ • Custom rules   │            │ ║
║   │   │ • Azure checks   │   │ • SOC2 controls  │   │ • Org standards  │            │ ║
║   │   │ • GCP checks     │   │ • HIPAA mapping  │   │ • Auto-remediate │            │ ║
║   │   │ • Best practices │   │ • PCI-DSS rules  │   │ • Audit logging  │            │ ║
║   │   └──────────────────┘   └──────────────────┘   └──────────────────┘            │ ║
║   │                                                                                   │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Deployment Architecture

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=E60000&center=true&vCenter=true&width=500&height=40&lines=Container+Orchestration;Docker+Compose;Production+Ready" alt="Deployment Architecture" />
</p>

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                            DEPLOYMENT ARCHITECTURE                                      ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                          DOCKER COMPOSE STACK                                     │ ║
║   │                                                                                   │ ║
║   │   ┌─────────────────────────────────────────────────────────────────────────┐   │ ║
║   │   │                         NETWORK: cloudforge_net                          │   │ ║
║   │   │                                                                          │   │ ║
║   │   │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │   │ ║
║   │   │   │   Frontend   │    │   Backend    │    │   Database   │              │   │ ║
║   │   │   │   Container  │    │  Container   │    │  Container   │              │   │ ║
║   │   │   ├──────────────┤    ├──────────────┤    ├──────────────┤              │   │ ║
║   │   │   │ Image: node  │    │ Image: python│    │Image: postgres│              │   │ ║
║   │   │   │ Port: 5173   │    │ Port: 8000   │    │ Port: 5432   │              │   │ ║
║   │   │   │ Vol: /app    │    │ Vol: /app    │    │ Vol: pg_data │              │   │ ║
║   │   │   │ Mem: 512MB   │    │ Mem: 1GB     │    │ Mem: 512MB   │              │   │ ║
║   │   │   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │   │ ║
║   │   │          │                   │                   │                       │   │ ║
║   │   │          │                   │                   │                       │   │ ║
║   │   │   ┌──────▼───────┐    ┌──────▼───────┐    ┌──────▼───────┐              │   │ ║
║   │   │   │  LocalStack  │    │    TFSec     │    │  Terrascan   │              │   │ ║
║   │   │   │  Container   │    │  (on-demand) │    │  (on-demand) │              │   │ ║
║   │   │   ├──────────────┤    ├──────────────┤    ├──────────────┤              │   │ ║
║   │   │   │ Port: 4566   │    │ Binary exec  │    │ Binary exec  │              │   │ ║
║   │   │   │ Services:    │    │ from backend │    │ from backend │              │   │ ║
║   │   │   │ • S3         │    │              │    │              │              │   │ ║
║   │   │   │ • DynamoDB   │    │              │    │              │              │   │ ║
║   │   │   │ • Lambda     │    │              │    │              │              │   │ ║
║   │   │   │ • EC2        │    │              │    │              │              │   │ ║
║   │   │   └──────────────┘    └──────────────┘    └──────────────┘              │   │ ║
║   │   │                                                                          │   │ ║
║   │   └─────────────────────────────────────────────────────────────────────────┘   │ ║
║   │                                                                                   │ ║
║   │   ┌─────────────────────────────────────────────────────────────────────────┐   │ ║
║   │   │                            VOLUMES                                       │   │ ║
║   │   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │ ║
║   │   │  │  pg_data   │  │ backend_   │  │ frontend_  │  │ localstack │        │   │ ║
║   │   │  │  (persist) │  │   logs     │  │   build    │  │   data     │        │   │ ║
║   │   │  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │   │ ║
║   │   └─────────────────────────────────────────────────────────────────────────┘   │ ║
║   │                                                                                   │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                         ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                         SERVICE DEPENDENCIES                                      │ ║
║   │                                                                                   │ ║
║   │        frontend ─────────────────▶ backend                                       │ ║
║   │             │                          │                                          │ ║
║   │             │                          ├─────────────────▶ db                     │ ║
║   │             │                          │                                          │ ║
║   │             │                          ├─────────────────▶ localstack             │ ║
║   │             │                          │                                          │ ║
║   │             │                          └─────────────────▶ infracost (external)   │ ║
║   │             │                                                                     │ ║
║   │             └─────────────────────────────────────────────▶ (hot reload)          │ ║
║   │                                                                                   │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                         ║
║   ┌──────────────────────────────────────────────────────────────────────────────────┐ ║
║   │                          STARTUP SEQUENCE                                         │ ║
║   │                                                                                   │ ║
║   │   1. db ──────────▶ 2. localstack ──────────▶ 3. backend ──────────▶ 4. frontend │ ║
║   │      │                    │                        │                       │      │ ║
║   │      ▼                    ▼                        ▼                       ▼      │ ║
║   │   Init DB             Start AWS              Run migrations           Dev server  │ ║
║   │   Create user         services               Start Uvicorn            Vite HMR    │ ║
║   │                                                                                   │ ║
║   └──────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## API Reference

### Authentication

```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=admin123
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/` | List all projects |
| `POST` | `/api/projects/` | Create new project |
| `GET` | `/api/projects/{id}` | Get project details |
| `PUT` | `/api/projects/{id}` | Update project |
| `DELETE` | `/api/projects/{id}` | Delete project |

### Terraform API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/terraform/generate/{id}` | Generate Terraform |
| `POST` | `/api/terraform/validate/{id}` | Validate config |
| `POST` | `/api/terraform/plan/{id}` | Run terraform plan |
| `POST` | `/api/terraform/apply/{id}` | Apply infrastructure |
| `POST` | `/api/terraform/tfsec/{id}` | Security scan |
| `POST` | `/api/terraform/terrascan/{id}` | Policy scan |
| `POST` | `/api/terraform/infracost/{id}` | Cost estimate |

### Dashboard API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Get summary stats |
| `GET` | `/api/dashboard/analytics` | Detailed analytics |

---

## Database Schema

```sql
┌─────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐    │
│  │    users     │       │   projects   │       │  resources   │    │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤    │
│  │ id           │◄──────│ owner_id     │       │ id           │    │
│  │ username     │       │ id           │◄──────│ project_id   │    │
│  │ email        │       │ name         │       │ type         │    │
│  │ hashed_pass  │       │ description  │       │ name         │    │
│  │ is_active    │       │ cloud_prov   │       │ config       │    │
│  │ created_at   │       │ diagram_data │       │ created_at   │    │
│  └──────────────┘       │ tf_config    │       └──────────────┘    │
│                         │ created_at   │                            │
│                         └──────────────┘                            │
│                                │                                     │
│                                ▼                                     │
│                    ┌────────────────────┐                           │
│                    │   cost_estimates   │                           │
│                    ├────────────────────┤                           │
│                    │ id                 │                           │
│                    │ project_id         │                           │
│                    │ monthly_cost       │                           │
│                    │ currency           │                           │
│                    │ resources_count    │                           │
│                    │ cost_breakdown     │                           │
│                    │ created_at         │                           │
│                    └────────────────────┘                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

```bash
# Required software
Docker          >= 24.0
Docker Compose  >= 2.20
Node.js         >= 18.0   (for local development)
Python          >= 3.11   (for local development)
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/vodafone/cloudforge.git
cd cloudforge

# 2. Start with Docker Compose
docker-compose up -d

# 3. Access application
open http://localhost:5173
```

### Default Credentials

```yaml
Username: admin
Password: admin123
```

---

## Project Structure

```
cloudforge/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/
│   │   │       ├── auth.py          # Authentication
│   │   │       ├── projects.py      # Project management
│   │   │       ├── terraform.py     # IaC generation
│   │   │       └── dashboard.py     # Analytics
│   │   ├── models/
│   │   │   ├── user.py              # User model
│   │   │   ├── project.py           # Project model
│   │   │   └── terraform.py         # Resource & Cost models
│   │   ├── core/
│   │   │   ├── config.py            # App configuration
│   │   │   ├── database.py          # DB connection
│   │   │   └── security.py          # JWT & hashing
│   │   ├── services/
│   │   │   └── terraform_generator.py
│   │   └── main.py                  # FastAPI app
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── dashboard/           # Dashboard views
│   │   │   ├── designer/            # Visual designer
│   │   │   ├── analytics/           # Cost analytics
│   │   │   └── auth/                # Authentication
│   │   ├── components/
│   │   │   ├── DesignerToolbar.tsx  # Designer tools
│   │   │   ├── InspectorPanel.tsx   # Resource config
│   │   │   └── MetricsCard.tsx      # Dashboard cards
│   │   ├── lib/
│   │   │   ├── api/                 # API client
│   │   │   ├── store/               # Zustand stores
│   │   │   └── resources/           # Resource configs
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yaml
└── README.md
```

---

## Cloud Resources

### AWS Resources

| Resource | Terraform Type | Icon |
|----------|---------------|------|
| VPC | `aws_vpc` | |
| Subnet | `aws_subnet` | |
| EC2 Instance | `aws_instance` | |
| Security Group | `aws_security_group` | |
| Internet Gateway | `aws_internet_gateway` | |
| S3 Bucket | `aws_s3_bucket` | |
| RDS Database | `aws_db_instance` | |
| Lambda Function | `aws_lambda_function` | |
| EKS Cluster | `aws_eks_cluster` | |
| Load Balancer | `aws_lb` | |

### Azure Resources

| Resource | Terraform Type |
|----------|---------------|
| Resource Group | `azurerm_resource_group` |
| Virtual Network | `azurerm_virtual_network` |
| Virtual Machine | `azurerm_linux_virtual_machine` |
| Storage Account | `azurerm_storage_account` |
| App Service | `azurerm_app_service` |
| AKS Cluster | `azurerm_kubernetes_cluster` |

### GCP Resources

| Resource | Terraform Type |
|----------|---------------|
| VPC Network | `google_compute_network` |
| Compute Instance | `google_compute_instance` |
| Cloud Storage | `google_storage_bucket` |
| Cloud SQL | `google_sql_database_instance` |
| GKE Cluster | `google_container_cluster` |

---

## Security Features

### TFSec Integration

```bash
# Automatic security scanning on code generation
POST /api/terraform/tfsec/{project_id}
```

```json
{
  "results": [
    {
      "rule_id": "AWS002",
      "severity": "WARNING",
      "description": "S3 bucket does not have logging enabled",
      "location": {
        "filename": "main.tf",
        "line": 45
      }
    }
  ],
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 3,
    "low": 5
  }
}
```

### Terrascan Policies

```bash
# Policy-as-code validation
POST /api/terraform/terrascan/{project_id}
```

---

## Cost Management

### Automatic Cost Estimation

```
┌─────────────────────────────────────────────────────────────────┐
│                    INFRACOST INTEGRATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Resource Added ──▶ Background Task ──▶ Cost Calculation       │
│                           │                                      │
│                           ▼                                      │
│                    ┌─────────────┐                               │
│                    │ cost_       │                               │
│                    │ estimates   │──▶ Dashboard Update           │
│                    │ table       │                               │
│                    └─────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cost Breakdown

```json
{
  "totalMonthlyCost": "70.88",
  "currency": "USD",
  "projects": [
    {
      "name": "production",
      "breakdown": {
        "resources": [
          {
            "name": "aws_instance.nginx",
            "resourceType": "aws_instance",
            "monthlyCost": "70.88",
            "hourlyCost": "0.0971"
          }
        ]
      }
    }
  ]
}
```

---

## Environment Variables

### Backend Configuration

```bash
# backend/.env
DATABASE_URL=postgresql://postgres:postgres@db:5432/cloudforge
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# LocalStack
AWS_ENDPOINT_URL=http://localstack:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1

# Security Tools
INFRACOST_API_KEY=your-infracost-api-key
```

### Frontend Configuration

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=CloudForge
```

---

## Development

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Docker Development

```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f backend frontend

# Restart specific service
docker-compose restart backend

# Stop all services
docker-compose down
```

---

## Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

---

## Deployment

### Production Checklist

```
[x] Change SECRET_KEY to strong random value
[x] Configure proper DATABASE_URL
[x] Set up SSL/TLS certificates
[x] Configure CORS for production domain
[x] Set up proper logging
[x] Configure backup strategy
[x] Set up monitoring (Prometheus/Grafana)
[x] Configure rate limiting
[x] Set up CI/CD pipeline
```

### Docker Production

```yaml
# docker-compose.prod.yaml
version: '3.8'
services:
  backend:
    image: cloudforge-backend:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

---

## Roadmap

```
Q1 2025                    Q2 2025                    Q3 2025
   │                          │                          │
   ▼                          ▼                          ▼
┌──────────┐              ┌──────────┐              ┌──────────┐
│ Multi-   │              │ GitOps   │              │ AI-      │
│ Cloud    │──────────────│ Integr.  │──────────────│ Powered  │
│ Support  │              │ + CI/CD  │              │ Assist   │
└──────────┘              └──────────┘              └──────────┘
```

### Upcoming Features

- [ ] **GitOps Integration** - Automatic PR creation
- [ ] **Drift Detection** - Compare deployed vs defined
- [ ] **Cost Forecasting** - ML-based predictions
- [ ] **Compliance Reports** - SOC2, HIPAA, PCI-DSS
- [ ] **Team Collaboration** - Real-time editing
- [ ] **Custom Modules** - Reusable components
- [ ] **Approval Workflows** - Change management

---

## Contributing

```bash
# Fork the repository
git clone https://github.com/yourusername/cloudforge.git

# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m 'feat: add amazing feature'

# Push to branch
git push origin feature/amazing-feature

# Open Pull Request
```

---

## License

```
Copyright (c) 2024 Vodafone Group

This software is proprietary and confidential.
Unauthorized copying, modification, distribution, or use
of this software, via any medium, is strictly prohibited.

Enterprise License Agreement required for usage.
```

---

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=20&pause=1000&color=E60000&center=true&vCenter=true&width=600&height=50&lines=Built+with+%E2%9D%A4%EF%B8%8F+by+Vodafone+Engineering;Empowering+Cloud+Infrastructure+Teams" alt="Footer" />
</p>

<p align="center">
  <sub>CloudForge Enterprise IaC Platform v2.0.0</sub>
</p>
