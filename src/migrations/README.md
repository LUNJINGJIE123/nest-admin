# Database Migrations

Production disables TypeORM `synchronize` by default. Generate and review
migrations before releasing schema changes:

```bash
yarn migration:generate
yarn migration:run
```

Use `TYPEORM_SYNCHRONIZE=true` only for disposable development databases.
