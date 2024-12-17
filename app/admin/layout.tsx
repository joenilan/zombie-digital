import { withRole } from '@/middleware/withRole';

export const middleware = withRole('admin');

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
} 