# KUIRO Database Architecture Notice (Supabase Legacy Reference)

> [!WARNING]
> **DO NOT USE FOR ACTIVE MIGRATIONS OR PRODUCTION DEPLOYMENTS**
> This directory contains legacy Supabase SQL artifacts preserved solely as historical architectural reference. It is **NOT** part of the active KUIRO database migration path.

---

## Authoritative Database Source of Truth

KUIRO has standardized exclusively on **Neon PostgreSQL** via **Drizzle ORM** and **Drizzle Kit**.

- **Canonical Application Schema**: [src/db/schema.ts](file:///c:/Users/RAHUL%20MONDAL/Downloads/KUIRO/src/db/schema.ts)
- **Version-Controlled Migrations**: [src/db/migrations/](file:///c:/Users/RAHUL%20MONDAL/Downloads/KUIRO/src/db/migrations/)
- **Authoritative Migration Runner**: [src/db/migrate.ts](file:///c:/Users/RAHUL%20MONDAL/Downloads/KUIRO/src/db/migrate.ts)
- **Database Engine**: Neon Serverless PostgreSQL (Lakebase)

---

## Approved Migration Workflow

To modify the database schema:

1. **Update Drizzle Schema**: Edit `src/db/schema.ts` with required tables, columns, indexes, and constraints.
2. **Generate Migration**: Run `npm run db:generate` to generate version-controlled SQL migration files in `src/db/migrations/`.
3. **Review Migration**: Inspect the generated SQL DDL statements.
4. **Apply to Database**: Run `npm run db:migrate` to atomically apply migrations and record tracking in `drizzle.__drizzle_migrations`.
5. **Verify**: Run `npm run typecheck` and automated migration tests.
