import React, { useEffect } from "react";

const InfoPopup = ({ message, isSuccess, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 flex animate-[slide-in_0.3s_ease-out]">
      <div
        className={`relative flex items-center gap-4 px-5 py-3 rounded-lg shadow-lg max-w-md w-full text-white ${
          isSuccess ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {/* Ikon SVG */}
        {isSuccess ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}

        {/* Pesan */}
        <p className="flex-1">{message}</p>
      </div>
    </div>
  );
};

export default InfoPopup;