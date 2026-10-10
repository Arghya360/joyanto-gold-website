export const SERVICE_NAV_ITEMS = [
  { label: "Live Prices", path: "/live-prices" },
  { label: "Catalogue", path: "/catalogue" },
  { label: "Storage", path: "/storage" },
  { label: "MC Reserve", path: "/mc-reserve" },
  { label: "Sell to Us", path: "/sell-to-us" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" }
] as const;

export type ServiceNavLabel = typeof SERVICE_NAV_ITEMS[number]["label"];

export function getServiceNavPath(label: ServiceNavLabel): string {
  const item = SERVICE_NAV_ITEMS.find(service => service.label === label);
  if (!item) throw new Error(`Unknown service navigation label: ${label}`);
  return item.path;
}
