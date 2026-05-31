# CMS Workflow

The CMS lives under `app/(admin)` at `/admin` (ADR 0005), protected by Auth.js + RBAC. It manages
all content that today is mock data, plus leads, FAQ/support, users, and settings.

## Modules

| Module | Entity | Capabilities |
|---|---|---|
| Dashboard | — | KPIs: new leads, latest content, open tickets, system status |
| Services | `Service` | CRUD, reorder, publish toggle, cover image |
| Fleet | `FleetVehicle` | CRUD, status, multiple photos, specs |
| Gallery | `GalleryItem` | CRUD, category, reorder |
| News | `NewsPost` | CRUD, draft→publish→archive, cover, author |
| FAQ | `FaqItem` / `FaqCategory` | CRUD, categories, draft/publish, analytics |
| Support | `SupportTicket` | view, status workflow, **assignment** to an agent |
| Leads | `Lead` / `LeadActivity` | view, filter, status workflow + **activity timeline** (notes/calls/emails) |
| Team | `TeamMember` | CRUD, reorder, photo |
| Clients | `ClientLogo` | CRUD, reorder, logo |
| Media Library | `MediaAsset` | upload (signed), browse, **tags & search**, reuse, delete-with-guard |
| Statistics | `Stat` | edit marketing stats (value/label/suffix/order); MANUAL now, DERIVED-ready (ADR 0009) |
| Settings | `SiteSettings` | company info, values |
| Users & Roles | `User` / `Role` | manage users, assign roles, edit permissions (SUPER_ADMIN) |

## Standard CRUD flow

```
Admin UI (form, Zod client validation)
  → Server Action (app/(admin)/<module>/actions.ts)
      → requirePermission('<entity>:<action>')
      → Zod parse (server)
      → sanitize rich text (news/FAQ bodies)
      → Service → Repository (Prisma)
      → writeAudit()
  → revalidatePath('/<public-route>')   // public site reflects change
```

## Publish workflow (News & FAQ)

`DRAFT → PUBLISHED → ARCHIVED`. Only `PUBLISHED` items appear on the public site / in `lib/data`
reads. `publishedAt` set on first publish. EDITOR can publish content; SUPPORT_AGENT can publish
FAQ; VIEWER cannot.

## Media workflow

1. Admin requests a **signed** upload (`media:create`).
2. Browser uploads directly to Cloudinary.
3. Server persists `MediaAsset` (publicId, url, dims, mime, folder).
4. Content forms pick assets from the library by id (`coverId`, `photoIds`, `mediaId`, `logoId`).
5. **Delete guard:** `MediaService.delete()` refuses if the asset is referenced; shows where.

## Leads workflow

Public form → `Lead(status=NEW)`. Admin advances `NEW → CONTACTED → QUALIFIED → CLOSED`. No
automatic email/forwarding (per PRD). Each lead has an **activity timeline** (`LeadActivity`):
admins log NOTE / CALL / EMAIL / MEETING entries (author + timestamp), and every status change
auto-creates a `STATUS_CHANGE` activity so the follow-up history is complete.

## Permissions recap

Create/edit/publish content → EDITOR+. FAQ/support → SUPPORT_AGENT+. Settings → SUPER_ADMIN.
Users/roles → SUPER_ADMIN. VIEWER is read-only. Full matrix in [SECURITY.md](SECURITY.md).

## Relationships (quick map)

`MediaAsset` ←(id refs)— Service/News/Gallery/Team/Client/Fleet · `NewsPost.author → User` ·
`User → Role` · `FaqItem → FaqCategory` · every mutation → `AuditLog`.
