# Purchase Orders CAP Application

An SAP Cloud Application Programming Model (CAP) project with a SAP Fiori frontend for purchase order approvals.

## Project overview

This repository includes:

- `db/` — domain model for approval decisions stored locally in SQLite
- `srv/` — CAP service definitions and custom service logic
- `app/purchase/` — SAP Fiori UI5 frontend for browsing purchase orders and creating approval decisions
- `app/services.cds` — CAP service definitions for local application services
- `xs-security.json`, `mta.yaml`, `event-mesh.json` — deployment and security configuration for SAP BTP or Cloud Foundry environments

## What it does

- Reads purchase order header and item data from an external OData V4 service (`CE_PURCHASEORDER_0001`)
- Exposes those entities through a local CAP service (`POService`)
- Stores approval decisions locally in `db/schema.cds` using SQLite during development
- Provides a Fiori UI at `/purchase/webapp/index.html`

## Prerequisites

- Node.js LTS (recommended)
- npm
- SAP Cloud SDK and CAP tooling are included in `package.json`
- Optional for deployment: Cloud Foundry CLI and SAP BTP access

## Setup

1. Open a terminal in the repository root.
2. Install dependencies:

```bash
npm install
```

3. If you want to work in the Fiori UI module separately, it is available under `app/purchase/` and is part of the workspace.

## Run locally

Start the CAP application from the repository root:

```bash
npm start
```

By default the service runs on `http://localhost:4004`.

Open the frontend in your browser at:

```text
http://localhost:4004/purchase/webapp/index.html
```

If you want automatic reload while editing the UI, use the watch command:

```bash
npm run watch-purchase
```

## Service endpoints

- OData V4 service: `http://localhost:4004/odata/v4/po/`
- Fiori app: `http://localhost:4004/purchase/webapp/index.html`

## Development notes

- `srv/po-service.cds` defines the service projection of external purchase orders and local approval decisions.
- `srv/po-service.js` implements proxy read handlers for external S/4HANA data and validation logic before creating an approval decision.
- `db/schema.cds` defines `ApprovalDecision` with audit fields and approval result values.
- `app/purchase/` contains the generated SAP Fiori app shell and view definitions.

## Build and deployment

Build the MTA archive for Cloud Foundry:

```bash
npm run build
```

Deploy the generated archive to Cloud Foundry:

```bash
npm run deploy
```

Undeploy the application from Cloud Foundry:

```bash
npm run undeploy
```

## Helpful links

- SAP CAP: https://cap.cloud.sap
- UI5 tooling: https://sap.github.io/ui5-tooling
- SAP Cloud SDK: https://sap.github.io/cloud-sdk
