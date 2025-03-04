'use client'
import React, { createContext, useContext, useState } from 'react';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [registeredTeams, setRegisteredTeams] = useState(0);

  const updateRegisteredTeams = (tournament_name, count) => {
    setRegisteredTeams((prev) => ({
      ...prev,
      [tournament_name]: count,
    }));
  };

  return (
    <TeamContext.Provider value={{ registeredTeams, updateRegisteredTeams }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => useContext(TeamContext); 