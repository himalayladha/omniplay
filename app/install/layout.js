// Install wizard uses the root layout's html/body.
// This file only exists to set page-level metadata and suppress indexing.
export const metadata = {
  title: "OmniPlay — Installation Setup",
  description: "Initial setup wizard for OmniPlay game portal.",
  robots: "noindex, nofollow",
};

export default function InstallLayout({ children }) {
  // No extra wrapping needed — SiteShell in root layout already
  // strips Navbar/Footer for /install routes.
  return children;
}
