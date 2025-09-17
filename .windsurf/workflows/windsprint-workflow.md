---
description: Windsprint Workflow
auto_execution_mode: 3
---

---

# /windsprint-workflow

The **windsprint workflow** automates the *patch→batch spiral*: from scaffolding documentation and CI/CD pipelines, through feature planning and development, to deployment and iteration. It loops until every requirement in `END_GOAL.md` is fully satisfied.

---

## Full Steps & Substeps

### 1. Bootstrap Templates (`/bootstrap-templates`)

* **Docs scaffolded:**

  * `guidelines.md` – coding standards, contribution rules
  * `END_GOAL.md` – definition of done, project milestones
  * `README.md` – project overview, usage instructions
  * `.windsurfrules.md` *(optional)* – workflow overrides/rules

* **Commit & tag:**

  * Commit initial scaffold
  * Tag as `v0.0.1`

---

### 2. Confirmation Gate

* **Check for:**

  * Human approval *or*
  * Presence of tag `v0.0.1`

* If missing → block until resolved

---

### 3. Pipeline Setup (`/pipeline`)

* **Read inputs:**

  * `.vercel/project.json`
  * Existing secrets/environment variables

* **Generate CI/CD config:**

  * Write `.github/workflows/kilo-pipeline.yml`
  * Configure build, test, deploy jobs via **Vercel + Kilo**

* **Commit & tag:**

  * Commit pipeline config
  * Tag as `v0.1.0`

---

### 4. Middleware Layer

* Implement shared services (auth, logging, caching, messaging)
* Define APIs and middleware contracts
* Write request/response tests with **Jest**

---

### 5. Backend Layer

* Stand up servers/functions with **Supabase** (Postgres, auth, edge functions)
* Define schema and ORM via **Prisma**
* Implement APIs and business logic
* Unit + integration testing with **Jest**

---

### 6. Frontend Layer

* Scaffold apps with **Next.js** (deployed to Vercel)
* Build feature UI components styled with **TailwindCSS**
* Hook into backend APIs (Supabase + Prisma)
* Perform end-to-end testing with **Jest** + Vercel Preview Deployments

---

### 7. Monorepo Structure (`apps` vs. `lib`)

* **Apps:**

  * `app/` (main entrypoint)
  * `apps/` (secondary apps, dashboards, microsites)

* **Libs:**

  * `blockchain/` (smart contracts, chain utils)
  * `shared-business-logic/`
  * `shared-types/`
  * `shared-ui/` (Tailwind-based design system)

---

### 8. Documentation Suite

* Expand and maintain:

  * `architecture/` – system diagrams, written in **Mermaid** (`.md` with \`\`\`mermaid blocks)
  * `batches/` – release batches and notes
  * `branding/` – logos, assets, design tokens
  * `development/` – developer onboarding, coding patterns
  * `patches/` – change log, patch history
  * `ui/` – design and frontend structure:

    * `/layouts/` – page/layout wrappers
    * `/components/` – reusable UI components
    * `/pages/` – page-level views
    * `capture-screenshots.ts` – script triggered on Vercel deploy to capture UI snapshots
  * `ux/` – prototypes, research notes
  * Root docs (`README.md`, `guidelines.md`)

---

### 9. Supporting Assets

* **Scripts:** build, deploy, lint, migration
* **Tests:** unit, integration, regression with **Jest**
* **Tools:** dev utilities, CLIs, debugging scripts
* **Dist:** compiled/optimized builds (Vercel outputs)
* **Configs:** `.env`, `tsconfig.json`, `eslint`, `prettier`, Prisma schema

---

### 10. Spiral Loop (until `END_GOAL.md` ✅)

* **Cycle:**

  1. Implement patch (feature/fix)
  2. Batch patches into milestone release
  3. Deploy via **Kilo + Vercel**
  4. Run `/user-test` for acceptance
  5. Visually confirm against `END_GOAL.md`

* **Audit divergence:**

  * Flag misuse or stack shifts → log in `PATCHN_ISSUES.md`
  * Proposals for major changes → `proposed-tech/...` branches

* **Termination:**

  * Only when *every* item in `END_GOAL.md` is complete and checked

---

## Example Utility — `capture-screenshots.ts`

```ts
// /ui/capture-screenshots.ts
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

(async () => {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const pagesToCapture = ["/", "/about", "/dashboard"]; // extend as needed
  const outDir = path.join(process.cwd(), "screenshots");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  for (const route of pagesToCapture) {
    const url = `${baseUrl}${route}`;
    console.log(`Capturing: ${url}`);
    await page.goto(url, { waitUntil: "networkidle" });
    const fileName = route === "/" ? "home" : route.replace(/\//g, "_");
    await page.screenshot({ path: path.join(outDir, `${fileName}.png`) });
  }

  await browser.close();
  console.log(`Screenshots saved to ${outDir}`);
})();
```

---

## GitHub Actions Hook — Auto-run Screenshots on Vercel Deploy

Add this workflow file: `.github/workflows/screenshot.yml`

```yaml
name: Capture UI Screenshots

on:
  deployment_status:
    types: [success]

jobs:
  capture-screenshots:
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success'
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run screenshot capture
        run: npx ts-node ui/capture-screenshots.ts
        env:
          VERCEL_URL: ${{ github.event.deployment_status.environment_url }}
```

---