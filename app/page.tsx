import { prisma } from '@/lib/prisma';

export default async function Home() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Building User List with Docker & Prisma
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={user.email}>
                      {user.email}
                    </h3>
                    <p className="text-xs text-gray-500">
                      ID: {user.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Created</span>
                    <span>{user.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
              <p className="text-gray-500">No users found.</p>
              <p className="text-sm text-gray-400 mt-1">Run `npx prisma db seed` to add data.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
