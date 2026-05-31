# Database

PostgreSQL (Neon) + Prisma (ADR 0002, 0003). This is the **target** schema for Phase 1 — it
extends the PRD §10 sketch with the new modules (FAQ, Support, Jobs, Settings) and the marketing
content tables that currently live as mock data.

## Conventions

- IDs: `cuid()`. Timestamps: `createdAt` / `updatedAt` where mutable.
- Ordering: integer `order` on listable content.
- Publish workflow: `status` enum or `published` boolean (+ `publishedAt`).
- **Media references** are stored as MediaAsset **id strings** (`coverId String?`,
  `photoIds String[]`), *not* formal Prisma relations. This keeps the media **library reusable**
  (one asset referenced by many entities) and the schema clean. Referential integrity is enforced
  in `MediaService` (block/cascade on delete). See note at the bottom.
- Connection: app uses the Neon **pooled** URL; migrations use the **direct** URL.

## Migration policy

- One migration per logical change; never edit an applied migration.
- `prisma migrate dev` locally; `prisma migrate deploy` in CI (ADR 0007).
- Seed via `prisma/seed.ts` from the current `mock/*` data (see MOCK migration in the review).
- Destructive changes go through an expand → migrate → contract sequence.

## Schema (target)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url       = env("DATABASE_URL")          // Neon pooled
  directUrl = env("DIRECT_DATABASE_URL")   // Neon direct (migrations)
}

// ─────────────── Site settings (replaces COMPANY constants; stats live in the Stat table below) ───────────────
model SiteSettings {
  id          String   @id @default("singleton")
  company     Json     // name, address, phone, email, socials, legal… (Zod-validated on write)
  values      Json     // the 4 core values (Profesional, Aman, …) (Zod-validated on write)
  updatedAt   DateTime @updatedAt
}
// NOTE: marketing stats are NOT JSON here — they live in the `Stat` table below so they can be
// CRUD-managed, ordered, and flagged MANUAL/DERIVED (ADR 0009, ADR 0011).

enum StatSource { MANUAL DERIVED }

model Stat {
  id     String     @id @default(cuid())
  key    String     @unique   // fleet_units | shipments | clients | availability
  label  String
  value  Int
  suffix String?              // "+", "/7"
  source StatSource @default(MANUAL)
  order  Int        @default(0)
}

// ─────────────── Media library ───────────────
model MediaAsset {
  id        String   @id @default(cuid())
  publicId  String   @unique  // Cloudinary public_id — unique catches duplicate uploads (ADR 0006)
  url       String
  title     String?  // human label for the media library
  alt       String?  // accessibility / SEO
  tags      String[] // free-form tags for library search/organization
  width     Int?
  height    Int?
  mimeType  String
  folder    String?  // gallery | fleet | news | about | brand
  createdAt DateTime @default(now())
  @@index([folder])
  @@index([tags], type: Gin)
}

// ─────────────── Public content ───────────────
enum ServiceCategory { LOGISTICS TRANSPORTATION CAR_RENTAL GENERAL_TRADING }

model Service {
  id         String   @id @default(cuid())
  slug       String   @unique
  title      String
  category   ServiceCategory
  summary    String
  body       String
  iconKey    String?
  coverId    String?          // MediaAsset.id
  highlights String[]
  order      Int      @default(0)
  published  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([published, order])
}

enum FleetStatus { ACTIVE MAINTENANCE RETIRED }

model FleetVehicle {
  id          String      @id @default(cuid())
  name        String
  type        String
  capacity    String?
  description String?
  status      FleetStatus @default(ACTIVE)
  photoIds    String[]              // MediaAsset.id[]
  specs       Json                  // [{ label, value }]
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  @@index([status, order])
}

enum PostStatus { DRAFT PUBLISHED ARCHIVED }

model NewsPost {
  id            String     @id @default(cuid())
  slug          String     @unique
  title         String
  excerpt       String
  body          String
  coverId       String?
  category      String
  /// Editorial byline shown to the public ("Tim Komunikasi BMI", etc.).
  /// Distinct from `authorId` which is the owning user; preserves the editorial
  /// voice on news cards/detail without forcing fake user records.
  displayAuthor String?
  status        PostStatus @default(DRAFT)
  publishedAt   DateTime?
  archivedAt    DateTime?               // set on ARCHIVED transition (Phase 4 M1)
  authorId      String
  author        User       @relation(fields: [authorId], references: [id])
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  @@index([status, publishedAt])
}

model GalleryItem {
  id        String   @id @default(cuid())
  title     String
  category  String   // Briefing | Loading | Pengiriman | Warehouse | Fleet
  mediaId   String
  order     Int      @default(0)
  createdAt DateTime @default(now())
  @@index([category, order])
}

model TeamMember {
  id      String  @id @default(cuid())
  name    String
  role    String
  photoId String?
  order   Int     @default(0)
}

model ClientLogo {
  id     String  @id @default(cuid())
  name   String
  sector String?
  logoId String?
  url    String?
  order  Int     @default(0)
}

model CoverageRegion {
  id    String  @id @default(cuid())
  name  String
  x     Float
  y     Float
  hub   Boolean @default(false)
  order Int     @default(0)
}

model Achievement {
  id          String @id @default(cuid())
  iconKey     String
  title       String
  description String
  order       Int    @default(0)
}

model Certification {
  id      String @id @default(cuid())
  title   String
  issuer  String
  iconKey String
  order   Int    @default(0)
}

model JobOpening {
  id         String   @id @default(cuid())
  title      String
  department String
  type       String
  location   String
  summary    String
  published  Boolean  @default(true)
  createdAt  DateTime @default(now())
}

// ─────────────── Leads ───────────────
enum LeadStatus { NEW CONTACTED QUALIFIED CLOSED }

model Lead {
  id         String          @id @default(cuid())
  name       String
  company    String?
  email      String
  phone      String?
  service    ServiceCategory?
  message    String
  status     LeadStatus      @default(NEW)
  source     String?
  activities LeadActivity[]
  createdAt  DateTime        @default(now())
  @@index([status, createdAt])
}

enum LeadActivityType { NOTE CALL EMAIL MEETING STATUS_CHANGE }

model LeadActivity {
  id        String           @id @default(cuid())
  leadId    String
  lead      Lead             @relation(fields: [leadId], references: [id], onDelete: Cascade)
  authorId  String
  author    User             @relation(fields: [authorId], references: [id])
  type      LeadActivityType @default(NOTE)
  body      String
  createdAt DateTime         @default(now())
  @@index([leadId, createdAt])
}

// ─────────────── Support Center ───────────────
model FaqCategory {
  id    String    @id @default(cuid())
  name  String
  slug  String    @unique
  order Int       @default(0)
  items FaqItem[]
}

model FaqItem {
  id          String      @id @default(cuid())
  categoryId  String
  category    FaqCategory @relation(fields: [categoryId], references: [id])
  question    String
  answer      String      // rich text (sanitized on write)
  status      PostStatus  @default(DRAFT)
  viewCount   Int         @default(0)
  helpfulYes  Int         @default(0)
  helpfulNo   Int         @default(0)
  order       Int         @default(0)
  publishedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  @@index([categoryId, status, order])
}

model FaqSearchLog {
  id           String   @id @default(cuid())
  query        String
  resultsCount Int
  createdAt    DateTime @default(now())
  @@index([createdAt])
}

enum TicketStatus { OPEN IN_PROGRESS RESOLVED CLOSED }

model SupportTicket {
  id               String       @id @default(cuid())
  name             String
  email            String
  subject          String
  message          String
  status           TicketStatus @default(OPEN)
  assignedToUserId String?
  assignedTo       User?        @relation("TicketAssignee", fields: [assignedToUserId], references: [id])
  assignedAt       DateTime?
  createdAt        DateTime     @default(now())
  @@index([status, createdAt])
  @@index([assignedToUserId, status])
}

// ─────────────── Auth & RBAC ───────────────
model User {
  id                 String          @id @default(cuid())
  email              String          @unique
  name               String
  password           String          // argon2id hash
  roleId             String
  role               Role            @relation(fields: [roleId], references: [id])
  sessionVersion     Int             @default(0)     // bumped on role/password change
  mustChangePassword Boolean         @default(true)  // false after setup-password completes
  mfaEnabled         Boolean         @default(false) // TOTP optional in Phase 3
  mfaSecret          String?                          // AES-256-GCM ciphertext (key = MFA_ENCRYPTION_KEY)
  lastLoginAt        DateTime?
  disabledAt         DateTime?                        // soft-delete (Phase 4 M1)
  posts              NewsPost[]
  leadActivities     LeadActivity[]
  assignedTickets    SupportTicket[] @relation("TicketAssignee")
  authTokens         AuthToken[]
  mfaBackupCodes     MfaBackupCode[]
  createdAt          DateTime        @default(now())
}

enum AuthTokenType { PASSWORD_SETUP  PASSWORD_RESET }

model AuthToken {
  id        String        @id @default(cuid())
  userId    String
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      AuthTokenType
  tokenHash String        @unique   // sha256(raw); raw token never persisted
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime      @default(now())
  @@index([userId, type])
}

model MfaBackupCode {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  codeHash  String   // sha256
  usedAt    DateTime?
  createdAt DateTime @default(now())
  @@index([userId])
}

model Role {
  id          String @id @default(cuid())
  name        String @unique   // SUPER_ADMIN | EDITOR | SUPPORT_AGENT | VIEWER
  permissions Json             // ["news:publish", "lead:read", …]
  users       User[]
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String
  action    String   // "UPDATE news.publish"
  entity    String
  entityId  String?
  meta      Json?
  createdAt DateTime @default(now())
  @@index([entity, createdAt])
}

// ─────── Future platform extensions (illustrative — NOT in scope, NOT planned) ───────
// The schema can grow into future Operational Modules / Analytics Services / Business
// Intelligence without a rewrite. Concrete models are intentionally deferred until a real
// module is actually scoped. As ONE example of the kind of module the foundation could
// support (an illustration, not a commitment): an HR/attendance module might add models
// such as Employee / AttendanceRecord, and could use pgvector columns for similarity
// search. Nothing here is a current or planned implementation target.
```

## Media-reference tradeoff (explicit)

We store MediaAsset **ids** on content rows rather than formal Prisma relations. **Why:** the media
library must be reusable (one image used by several entities), and formal back-relations would
clutter `MediaAsset` and complicate reuse. **Cost:** no DB-level FK integrity for media. **Mitigation:**
`MediaService.delete()` checks references across content tables and refuses (or cascades) deletion;
orphan media are surfaced in the Media Library. If strict integrity becomes necessary, introduce an
explicit `MediaUsage(mediaId, entity, entityId)` join table.

## Indexing summary

`slug` unique on Service/NewsPost/FaqCategory; `key` unique on Stat; composite indexes on
`(published/status, order)`, `(status, publishedAt)` for news, `(status, createdAt)` for
leads/tickets, `(assignedToUserId, status)` for tickets, `(leadId, createdAt)` for lead activities,
`(category, order)` for gallery/FAQ, `(createdAt)` for search logs & audit, and a **GIN** index on
`MediaAsset.tags`.
