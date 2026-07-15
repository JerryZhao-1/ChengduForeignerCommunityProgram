import type {
  CommunityMapApiClient,
  Event,
  EventRegistration
} from "@community-map/shared";

interface EventIndexApi {
  events: Pick<CommunityMapApiClient["events"], "list" | "myRegistrations">;
}

interface EventIndexQuery {
  communityId: string;
  pageSize: number;
}

interface EventIndexLoadOptions {
  api: EventIndexApi;
  authenticated: boolean;
  query: EventIndexQuery;
}

export interface EventIndexData {
  events: Event[];
  registrations: EventRegistration[];
}

export const loadEventIndexData = async ({
  api,
  authenticated,
  query
}: EventIndexLoadOptions): Promise<EventIndexData> => {
  const eventsPromise = api.events.list(query);

  if (!authenticated) {
    const eventResult = await eventsPromise;
    return {
      events: eventResult.data.items,
      registrations: []
    };
  }

  const [eventResult, registrationResult] = await Promise.all([
    eventsPromise,
    api.events.myRegistrations()
  ]);

  return {
    events: eventResult.data.items,
    registrations: Array.isArray(registrationResult.data)
      ? registrationResult.data
      : []
  };
};
