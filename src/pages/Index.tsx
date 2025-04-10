import React from 'react';

const Index: React.FC = () => {
  return (
    <div style={{
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'linear-gradient(45deg, #6a1b9a, #4a148c)', // Lila Farbverlauf
      color: 'white', 
      fontFamily: 'Arial, sans-serif', 
      flexDirection: 'column',
      textAlign: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* Fehler-Emoji und fancy Text */}
        <h1 style={{
          fontSize: '3.5em', 
          fontWeight: 'bold', 
          color: '#e74c3c', 
          marginBottom: '20px',
        }}>
          🚨 Wartungsarbeiten 🚨
        </h1>
        
        {/* Bild: größer und zentriert */}
        <img 
          src="/lovable-uploads/facc787d-f5d9-4ce8-9d2b-2c329ba5f0cd.png" 
          alt="Wartungsmodus" 
          style={{
            width: '600px', // Bild ein wenig größer gemacht
            height: 'auto', 
            marginBottom: '30px', 
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }} 
        />

        {/* Fancy Text */}
        <p style={{
          fontSize: '1.8em', 
          fontStyle: 'italic', 
          marginBottom: '30px', 
          color: '#ecf0f1',
        }}>
          Unsere Website befindet sich momentan in Wartung. Wir sind bald wieder online! 💻🔧
        </p>

        {/* Footer, nach unten verschoben */}
        <footer style={{
          fontSize: '1.2em', 
          color: '#ecf0f1',
          position: 'absolute', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)',
        }}>
          <p>&copy; 2025 Dein Team. Alle Rechte vorbehalten.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
