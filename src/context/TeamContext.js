'use client'
import React, { createContext, useContext, useState } from 'react';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [registeredTeams, setRegisteredTeams] = useState({
    MobileLegend: 0,
    FreeFire: 0,
  });

  const updateRegisteredTeams = (tournament, count) => {
    setRegisteredTeams((prev) => ({
      ...prev,
      [tournament]: count,
    }));
  };

  return (
    <TeamContext.Provider value={{ registeredTeams, updateRegisteredTeams }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => useContext(TeamContext); 