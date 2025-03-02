const ProfileHeader = ({ user }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
      <div className="flex items-center space-x-4">
        <img
          src="https://www.w3schools.com/w3images/avatar2.png"
          alt="Profile"
          className="w-20 h-20 rounded-full border-4 border-white"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-blue-100">@{user.username}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 