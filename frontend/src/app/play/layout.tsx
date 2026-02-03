export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No header or dashboard for immersive quiz experience
  return <>{children}</>;
}
