export default function AdminHeader({ user, handleLogout }) {
  return (
    <div className="bg-blue-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Panel Admin</h1>
          <span className="bg-blue-700 px-3 py-1 rounded-full text-sm">
            {user?.role}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-blue-200">{user?.email}</p>
          </div>
          <img
            src={user?.avatar || "/images/avatar2.png"}
            alt="Admin"
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/avatar2.png';
            }}
          />
        </div>
      </div>
    </div>
  );
} 