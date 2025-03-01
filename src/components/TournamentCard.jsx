export default function TournamentCard({ title, price, image, onSelect, type }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
      <img src={image} alt={title} className="w-full h-48 object-cover rounded-lg mb-4"/>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">Rp {price.toLocaleString()} / Tim</p>
      <button 
        onClick={() => onSelect(type)} 
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition duration-300"
      >
        Daftar Sekarang
      </button>
    </div>
  );
}
