export default function FAQ() {
  const faqs = [
    {
      question: "Apa itu Turnamen Gaming USM?",
      answer: "Turnamen Gaming USM adalah kompetisi gaming yang diadakan oleh USM untuk para gamer dari berbagai kalangan."
    },
    {
      question: "Bagaimana cara mendaftar?",
      answer: "Anda dapat mendaftar melalui tombol 'Daftar Sekarang' di halaman utama dan mengikuti instruksi yang diberikan."
    },
    {
      question: "Apa saja game yang dipertandingkan?",
      answer: "Game yang dipertandingkan termasuk Mobile Legends dan Free Fire. Pastikan untuk memeriksa detailnya di halaman turnamen."
    },
    {
      question: "Apakah ada biaya pendaftaran?",
      answer: "Ya, ada biaya pendaftaran yang bervariasi tergantung pada jenis turnamen yang diikuti."
    },
    {
      question: "Bagaimana jika saya mengalami masalah saat mendaftar?",
      answer: "Anda dapat menghubungi customer service kami melalui tombol 'Hubungi Kami' di navbar."
    },
  ];

  return (
    <div id="faq" className="max-w-4xl mx-auto px-4 py-16 bg-white rounded-4xl">
      <h2 className="text-3xl font-bold text-center mb-8">Pertanyaan yang Sering Diajukan (FAQ)</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-lg">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 