export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="page-min-h page-max-w">{children}</main>;
}
