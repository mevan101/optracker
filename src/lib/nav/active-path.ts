export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/jobs/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
