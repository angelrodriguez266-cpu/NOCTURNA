import React, { createContext, useContext, useState } from 'react';

const LightboxContext = createContext({});

export const LightboxProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [caption, setCaption] = useState('');

  const openLightbox = (src, title) => {
    setImageSrc(src);
    setCaption(title || 'POSTER NØCTURNA');
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  return (
    <LightboxContext.Provider
      value={{
        isOpen,
        imageSrc,
        caption,
        openLightbox,
        closeLightbox,
      }}
    >
      {children}
    </LightboxContext.Provider>
  );
};

export const useLightbox = () => useContext(LightboxContext);
