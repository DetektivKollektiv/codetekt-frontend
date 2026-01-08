export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="page-max-w">{children}</main>;
}
