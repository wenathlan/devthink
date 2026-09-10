/** Canonical package version synchronized from package.json. */
export const packageversion = "2.0.10" as const;

/** The frozen protocolv2 major of the 1.1.91 api freeze: the wire speaks major two from this release on, the deprecation window closed at 2.0.0 and every major above two refuses until a future major bump. */
export const protocolmajor = 2 as const;

/** The lowest protocol major this build accepts: the deprecation window closed at 2.0.0, so the line speaks major two only — a client that declares major one answers the refusal below the floor while version one assets ride the migrateplan command and the migration guide. */
export const protocolfloormajor = 2 as const;
