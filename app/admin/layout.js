// Admin panel uses the root layout's html/body.
// This file only exists to set page-level metadata and suppress indexing.
export const metadata = {
  title: "Admin Console — OmniPlay",
  description: "OmniPlay administration panel.",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }) {
  // No extra wrapping needed — SiteShell in root layout already
  // strips Navbar/Footer for /admin routes.
  return children;
}
