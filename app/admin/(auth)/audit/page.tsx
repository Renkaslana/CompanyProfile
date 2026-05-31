import { requirePermission } from "@/server/auth/guards";
import { AuditRepository } from "@/server/repositories/audit.repository";
import { UserRepository } from "@/server/repositories/user.repository";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function AuditPage() {
  await requirePermission("audit:read");
  const [entries, total] = await Promise.all([
    AuditRepository.list({ limit: 100 }),
    AuditRepository.count(),
  ]);

  // Batched actor lookup — join AuditLog.actorId → User.name + email so the
  // table reads naturally. Raw cuid is preserved as a hover title for traceability.
  const actorIds = [
    ...new Set(entries.map((e) => e.actorId).filter((id) => !!id && id !== "anonymous")),
  ];
  const actors = await UserRepository.findManyByIdSafe(actorIds);
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Audit Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            100 entri terbaru dari total <strong>{total}</strong>. Read-only.
            Phase 8 hardening menambahkan append-only privileges di DB.
          </p>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 w-44">Waktu</th>
              <th className="px-4 py-3">Aktor</th>
              <th className="px-4 py-3 w-48">Aksi</th>
              <th className="px-4 py-3 w-40">Entity</th>
              <th className="px-4 py-3">Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => {
              const actor = actorMap.get(e.actorId);
              const metaStr = e.meta ? JSON.stringify(e.meta) : "—";
              return (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {e.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-4 py-2.5">
                    {actor ? (
                      <div className="leading-tight" title={`User id: ${e.actorId}`}>
                        <p className="font-medium text-ink-900">{actor.name}</p>
                        <p className="text-xs text-muted-foreground">{actor.email}</p>
                      </div>
                    ) : e.actorId === "anonymous" ? (
                      <span className="font-mono text-xs italic text-muted-foreground">
                        anonymous
                      </span>
                    ) : (
                      <span
                        className="font-mono text-xs text-muted-foreground"
                        title="User no longer exists in the database"
                      >
                        {e.actorId.slice(0, 12)}…
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={e.action} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="leading-tight">
                      <p className="text-xs font-medium text-ink-900">{e.entity}</p>
                      {e.entityId && (
                        <p
                          className="font-mono text-[10px] text-muted-foreground"
                          title={e.entityId}
                        >
                          {e.entityId.length > 16
                            ? `${e.entityId.slice(0, 16)}…`
                            : e.entityId}
                        </p>
                      )}
                    </div>
                  </td>
                  <td
                    className="px-4 py-2.5 max-w-md truncate font-mono text-[11px] text-muted-foreground"
                    title={metaStr}
                  >
                    {metaStr}
                  </td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Belum ada entri audit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
