import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'WeTwo Vendors', description: 'Wedding vendor pages powered by WeTwo' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
