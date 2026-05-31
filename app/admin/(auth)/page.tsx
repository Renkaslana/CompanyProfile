import { Boxes, Newspaper, Truck, Users } from "lucide-react";
import { requireFreshSession } from "@/server/auth/guards";
import { db } from "@/lib/db";

type SearchParams = Promise<{ error?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "Anda tidak memiliki izin untuk halaman tersebut.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireFreshSession();
  const { error } = await searchParams;

  // Live counts (Phase 3 dashboard placeholder — Phase 4+ adds rich KPIs)
  const [services, fleet, news, users, audit] = await Promise.all([
    db.service.count(),
    db.fleetVehicle.count(),
    db.newsPost.count(),
    db.user.count(),
    db.auditLog.count(),
  ]);

  const cards = [
    { label: "Layanan", value: services, icon: Boxes },
    { label: "Armada", value: fleet, icon: Truck },
    { label: "Berita", value: news, icon: Newspaper },
    { label: "Pengguna admin", value: users, icon: Users },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink-900">
          {user.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Peran Anda: <span className="font-semibold text-foreground">{user.role}</span>{" "}
          · {user.permissions.length} permission aktif.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {ERROR_MESSAGES[error] ?? "Aksi tidak diizinkan."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-orange/12 text-brand-orange">
              <c.icon className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <p className="font-display text-2xl font-bold text-ink-900">
                {c.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Phase 3 admin shell.</p>
        <p className="mt-1">
          Modul CMS (Services, News, Gallery, Settings, Stats, Fleet, Support, Leads)
          akan tersedia di Phase 4+. Untuk Phase 3 Anda dapat mengelola pengguna
          (jika role mengizinkan) dan meninjau audit log.
        </p>
        <p className="mt-2 text-xs">
          Audit entries tercatat: {audit}.
        </p>
      </div>
    </div>
  );
}
