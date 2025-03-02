
const ProfileTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Informasi Pribadi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Nama Lengkap</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Username</p>
            <p className="font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">WhatsApp</p>
            <p className="font-medium">{user.whatsapp}</p>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default ProfileTab; 