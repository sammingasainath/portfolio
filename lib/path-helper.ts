const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const prefixPath = (path: string) => {
  if (path.startsWith("http")) {
    return path;
  }
  return `${basePath}${path.startsWith("/") ? "" : "/"}${path}`;
}; 