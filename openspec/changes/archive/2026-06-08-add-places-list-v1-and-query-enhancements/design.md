# Design: Places list v1 and entry behavior

## Scope

This change only defines the mobile list surface, home entry behavior, and the backend semantics for the public `GET /places` list query.

This change does not redefine map browsing, place detail, admin maintenance, gallery uploads, or persisted favorite/share behavior.

## Design Reference

- Figma URL: `https://www.figma.com/design/J7V4EDEabVEkAapNdNQyXO/Community-App-Places-Frontend-Design?node-id=0-1&t=qeTvMImxOnqQmtXI-1`
- `fileKey=J7V4EDEabVEkAapNdNQyXO`
- `nodeId=0:1`
- The file was not accessible through the current Figma MCP session during proposal authoring, so this document records the source link and the behavior-level constraints only

## UI Information Architecture

### Places list page

The list page remains the v1 truth for public place browsing.

It should present:

- a top search input for keyword-based browsing
- a category entry that switches the active category filter instead of allowing free-text category input
- a recommendation entry as an explicit CTA that opens the list in recommended mode
- place cards that only render list-card fields already defined for the public list payload

The list page must not depend on detail-only fields such as gallery arrays or navigation objects.

### Home entry behavior

The home page `Places` section keeps preview items, but it should no longer read as a reserved module.

It should provide:

- a main entry that navigates to `/pages/places/index`
- a recommended entry that navigates to `/pages/places/index?recommended=true&sort=recommended`
- preview items that still navigate directly to the corresponding detail page

## Backend Behavior Notes

- The list page only consumes the list-card DTO returned by `GET /places`
- `GET /places` is the only public source of truth for list filtering, sorting, and pagination
- `published` is a hard visibility rule for the public list
- Public list responses must stay card-oriented and must not expose detail-only fields
- Mock provider, Koa route handling, and CloudBase handler behavior must stay aligned for the same list query inputs
