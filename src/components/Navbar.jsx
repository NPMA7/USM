export default function Navbar() {
    return (
      <nav className="bg-blue-500 text-white p-4 shadow">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">U-StudyMate</h1>
          <ul className="flex gap-4">
            <li><a href="/" className="hover:underline">Home</a></li>
          </ul>
        </div>
      </nav>
    );
  }
  