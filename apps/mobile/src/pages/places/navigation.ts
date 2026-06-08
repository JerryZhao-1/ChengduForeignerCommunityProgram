const withQuery = (
  path: string,
  query?: Record<string, string | number | boolean | undefined>
) => {
  const searchParams = Object.entries(query ?? {})
    .filter((entry): entry is [string, string | number | boolean] => {
      return entry[1] !== undefined;
    })
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    });

  return searchParams.length > 0 ? `${path}?${searchParams.join("&")}` : path;
};

export const placesPagePaths = {
  list: (query?: {
    keyword?: string;
    category?: string;
    tag?: string;
    recommended?: boolean;
    sort?: "recommended" | "name";
  }) => withQuery("/pages/places/index", query),
  detail: (id: string) => withQuery("/pages/places/detail", { id }),
  map: (id?: string) => withQuery("/pages/places/map", { id }),
  recommended: () =>
    withQuery("/pages/places/index", {
      recommended: true,
      sort: "recommended"
    })
};
