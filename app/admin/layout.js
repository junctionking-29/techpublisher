export const metadata = {
  title: 'Admin Control Center | TechPublisher',
  description: 'Administrative portal for content management, code distribution, and publication settings.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout-container">
      {children}
    </div>
  );
}
