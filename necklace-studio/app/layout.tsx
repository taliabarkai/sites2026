import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'Name Necklace Studio', description: 'Server-generated name plates from the TG-CARRIE definition' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
