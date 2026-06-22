# Week 8 Places CloudBase Integration And Volunteer Import

Last updated: 2026-06-22

## Summary

Week 8 code readiness is complete for the repo-side places integration work:

- `docs/志愿者点位采集表.xlsx` is parsed by `scripts/places_volunteer_import.mjs`.
- The spreadsheet currently yields 19 usable point records.
- Imported records map to draft canonical `place` inputs with admin-only `import_review` metadata.
- Imported records default to `status="draft"`, `is_recommended=false`, no gallery, no public cover, and `supports_navigation=false`.
- Missing coordinates are represented with out-of-range placeholder coordinates so draft records stay schema-valid while map marker filtering continues to exclude them.
- Public places list, marker, and detail contracts do not include `import_review` or raw volunteer evidence.
- Admin places management now surfaces imported-source and incomplete-record review indicators.

## Volunteer Import Command

Dry-run import:

```bash
node scripts/places_volunteer_import.mjs \
  --input docs/志愿者点位采集表.xlsx \
  --output /tmp/week8-volunteer-import.json \
  --dry-run
```

Admin API execution path:

```bash
node scripts/places_volunteer_import.mjs \
  --input docs/志愿者点位采集表.xlsx \
  --api-base-url http://127.0.0.1:8787 \
  --actor-id user_001
```

The execution path posts through `POST /admin/places` and therefore uses the same backend validation and admin authorization path as normal admin maintenance. It does not publish imported records.

## Mapping Rules

- First `点位类型` row: `import_review.volunteer_category_raw`.
- Second `点位类型` row: `import_review.category_code_candidate_raw`.
- Known volunteer categories such as `餐饮` map to shared top-level taxonomy values such as `food-drink`.
- Unsupported or missing categories keep the record in draft and add review blockers.
- Contact details, position proof, cost notes, route notes, collection notes, and raw spreadsheet fields remain in `import_review`; they are not returned by public places payloads.

## Real-Data Edge Cases

Implemented behavior:

- No gallery: detail returns empty `gallery_media` / `gallery_urls` and mobile renders an empty gallery state.
- No tags: list/detail hide tag rows instead of rendering empty chips.
- No recommendation: list/detail omit recommendation badge/reason.
- Missing or unusable coordinates: map markers exclude the place; detail disables map/navigation actions.
- Missing address or optional text: mobile hides empty rows rather than showing placeholder copy.

## CloudBase Dev Status

CloudBase MCP and dev API status after the 2026-06-22 deployment run:

- Authentication: `READY`.
- Current bound environment: `cloud1-d7gxdk8t43bd639c0`.
- `community-map-api`: deployed as CloudBase HTTP function, runtime `Nodejs18.15`, status `Active`.
- Function env vars: `API_PROVIDER=cloudbase`, `CLOUDBASE_PROVIDER_MODE=live`, `CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0`.
- `/api` access route: created at `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`.
- Public read smoke: `/api/health`, `/api/places`, and `/api/places/map-markers` returned `200`.

Live places acceptance remains partial:

- The live `places` collection exists but currently has `0` documents.
- Public list and map marker smoke prove live provider configuration, because mock has non-empty places while CloudBase returned empty live data.
- Detail smoke, admin create/update, gallery temp URL, imported draft visibility, and published update visibility still require seeded or imported live places data.

Detailed deployment evidence is recorded in `docs/cloudbase-dev-api-deployment.md`.

## Validation

Local validation completed:

- `pnpm typecheck`
- `pnpm test`
- `pnpm lint`
- Browser verification for Mobile H5 places list/detail/map and Admin places page.

Known environment limitation:

- Mobile H5 map verification logs `Map key not configured.` in local browser mode. The page still renders the map container, marker summary, list/detail navigation entries, and no horizontal overflow. Tencent map key configuration remains environment-owned and must not be hard-coded.
