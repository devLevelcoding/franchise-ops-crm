# Franchise Ops CRM

Type 1 (Pure SassFactory) from the [mini-CRM catalog](../../sassdesk/project.html) — `#18`.
Multi-location: shop records, inspections, opening/closing checklists, and an HQ↔shop ticket inbox,
for chains too small (2–10 locations) to need the full platform's franchise-ops machinery.

## Lineage

Forked from `F:\SassFactory\crm3-micro`, same porting approach as every other CRM in this catalog —
plain HTTP routes over untouched Prisma calls, multi-tenant columns dropped. What's different here
is how much got trimmed, since the source models are sized for a real-estate team running dozens of
openings a year, not a 2-10 location chain:

- `Shop` — ported from `Agency` (`prisma/schema.prisma:1252` in crm3-micro). Dropped
  `AgencyHierarchy` (regional director / area manager / cost-center org chart) entirely — that's
  headcount structure a small chain doesn't have.
- `Inspection` — ported close to 1:1 from crm3-micro's `Inspection` model, minus the free-form
  `data` JSON blob (a full checklist-builder result) in favor of a plain `notes` text field and an
  optional `score` int, plus `inspectorName` as a string instead of `inspectorId` (no user table
  in this standalone app).
- `Task` — **not** ported from anywhere; written fresh, same shape as every other CRM's plain
  client-linked task list, reused here as the opening/closing checklist tied to a `Shop`.
- **`Opening`/`Closing` — not ported.** The source models are ~30 fields each: owner/landlord
  contact info, financial review, juridical review, promise contracts, rent contracts, payment
  schedules, and an 8-stage pipeline with a side-table of stage-change events — real-estate
  legal/finance tooling, not a mini-CRM. Collapsed to `Shop.status` (`opening` → `active` →
  `closing` → `closed`, flipped via `POST /shops/:id/open` and `/close`) plus the plain `Task`
  checklist above. If a chain needs the full pipeline, that's the argument for the real platform,
  not this product.
- `Ticket` — ported from crm3-micro's simpler `HelpdeskTicket` shape (`title`/`body`/`response`,
  no separate message-thread or assignee sub-tables), not the source's heavier `FranchiseTicket` +
  `FranchiseTicketMessage` + `FranchiseTicketAssignee` + `FranchiseTicketEvent` cluster. Project CRM
  (`#08`) already established `HelpdeskTicket` as this catalog's default "support ticket" shape —
  followed that instead of introducing a second, heavier one.

## Run it locally

```
npm install
npm run prisma:migrate
npm run dev
```

API listens on `:3306` — `/shops`, `/inspections`, `/tasks`, `/tickets`.

```
cd frontend
npm install
npm run dev
```

UI listens on `:5180`.

## Deploying to Vercel

Same two-project pattern as every other deployed CRM in this catalog — see
`F:\go\v4\goAdmin\VercelCrmDeployManual.md` for the exact steps, the Turso setup, and the
`PrismaLibSQL` adapter gotcha (already avoided here — `src/prisma.service.ts` passes the config
object directly, not a pre-built client).
