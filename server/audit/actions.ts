/**
 * AuditLog action constants. Centralized so they stay consistent across the
 * codebase and so the audit table can be filtered by stable values.
 *
 * Adding a new action: append to this map. Audit consumers should rely only
 * on `AuditAction` for type safety.
 */
export const AUDIT_ACTIONS = {
  // Authentication (Phase 3)
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAIL: "LOGIN_FAIL",
  LOGIN_LOCKOUT: "LOGIN_LOCKOUT",
  LOGOUT: "LOGOUT",

  // Password lifecycle (Phase 3)
  PASSWORD_SET: "PASSWORD_SET",
  PASSWORD_RESET: "PASSWORD_RESET",
  PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",

  // MFA (Phase 3 schema + Phase 8 UI)
  MFA_ENABLE: "MFA_ENABLE",
  MFA_DISABLE: "MFA_DISABLE",

  // User management (Phase 3 + Phase 4 M1/M2)
  USER_CREATE: "USER_CREATE",
  USER_DISABLE: "USER_DISABLE",
  USER_REACTIVATE: "USER_REACTIVATE",
  ROLE_CHANGE: "ROLE_CHANGE",

  // Authorization (Phase 3)
  ACCESS_DENIED: "ACCESS_DENIED",

  // Infrastructure (Phase 3)
  RATE_LIMIT_UNAVAILABLE: "RATE_LIMIT_UNAVAILABLE",

  // Media (Phase 4 M1+)
  MEDIA_CREATE: "MEDIA_CREATE",
  MEDIA_UPDATE: "MEDIA_UPDATE",
  MEDIA_DELETE: "MEDIA_DELETE",

  // Content modules (Phase 4 M5–M9) — declared centrally so module services
  // import a stable, type-checked constant.
  SERVICE_CREATE: "SERVICE_CREATE",
  SERVICE_UPDATE: "SERVICE_UPDATE",
  SERVICE_DELETE: "SERVICE_DELETE",
  SERVICE_PUBLISH_TOGGLE: "SERVICE_PUBLISH_TOGGLE",
  NEWS_CREATE: "NEWS_CREATE",
  NEWS_UPDATE: "NEWS_UPDATE",
  NEWS_PUBLISH: "NEWS_PUBLISH",
  NEWS_UNPUBLISH: "NEWS_UNPUBLISH",
  NEWS_ARCHIVE: "NEWS_ARCHIVE",
  NEWS_RESTORE: "NEWS_RESTORE",
  NEWS_DELETE: "NEWS_DELETE",
  GALLERY_CREATE: "GALLERY_CREATE",
  GALLERY_UPDATE: "GALLERY_UPDATE",
  GALLERY_DELETE: "GALLERY_DELETE",
  TEAM_CREATE: "TEAM_CREATE",
  TEAM_UPDATE: "TEAM_UPDATE",
  TEAM_DELETE: "TEAM_DELETE",
  CLIENT_CREATE: "CLIENT_CREATE",
  CLIENT_UPDATE: "CLIENT_UPDATE",
  CLIENT_DELETE: "CLIENT_DELETE",
  STAT_UPDATE: "STAT_UPDATE",
  SETTINGS_UPDATE: "SETTINGS_UPDATE",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
