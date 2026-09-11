import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Turboat Engineer · Anemkai',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Turboat',
    statusBarStyle: 'black-translucent',
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
