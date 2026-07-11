# MCP-only Home and Events English runbook

1. In English mode open Home; assert localized hero, sections, actions, Quick Actions, and formatted dates with no development-stage text or raw ISO values.
2. Open Events; assert English tabs, status, summary, time, address, capacity, and `View Details`.
3. Open `event_001`; assert Time, Location, Capacity, About This Event, Related Discussion, Entry Ticket, English address, and ticket code; assert Fee is absent.
4. Start an isolated H5 with `VITE_MOCK_ACTOR_ID=user_002` and open `event_001` registration; assert English fields, empty-name validation, successful submission, and generated Ticket Code.
5. Open H5 Places map; assert localized `Map Unavailable` fallback and no map component error.
6. Log into local mock Admin; assert no phase tag, bilingual readiness column, both address values, and both address edit fields.
7. Inspect H5/Admin consoles and save screenshots plus assertion index.
