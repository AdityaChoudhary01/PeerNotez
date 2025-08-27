import React from 'react';

const CustomSplashScreen = () => {
  const splashScreenStyle = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121220' 
  };

  const logoStyle = {
    width: '256px',
    height: '256px',
    borderRadius: '50%' 
  };

  return (
    <div style={splashScreenStyle}>
      <img 
        src="/logo512.png" 
        alt="PeerNotez Logo" 
        style={logoStyle} 
      />
    </div>
  );
};

export default CustomSplashScreen;
