export const resolveCloudbaseFunctionPath = (url: string) => {
  const protocolIndex = url.indexOf("://");

  if (protocolIndex !== -1) {
    const firstPathSlash = url.indexOf("/", protocolIndex + 3);
    return firstPathSlash === -1 ? "/" : url.slice(firstPathSlash);
  }

  if (url.startsWith("//")) {
    const firstPathSlash = url.indexOf("/", 2);
    return firstPathSlash === -1 ? "/" : url.slice(firstPathSlash);
  }

  return url.startsWith("/") ? url : `/${url}`;
};
