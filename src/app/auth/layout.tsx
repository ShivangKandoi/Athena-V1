export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 min-h-screen">
      <main className="container mx-auto py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-violet-800 dark:text-violet-300">Athena</h1>
          <p className="text-slate-600 dark:text-slate-400">Personal Life Management Platform</p>
        </div>
        {children}
      </main>
    </div>
  );
} 