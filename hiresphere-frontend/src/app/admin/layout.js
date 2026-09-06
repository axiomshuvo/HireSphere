export default function AdminRootLayout({ children }) {
  // Passthrough on purpose: /admin/login must render without a session.
  // The auth guard lives in src/app/admin/(protected)/layout.js instead.
  return <>{children}</>;
}
