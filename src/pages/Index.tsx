import React from 'react';

const Index: React.FC = () => {
  return (
    <div style={{
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#34495e',  // Farbe angepasst
      color: 'white', 
      fontFamily: 'Arial, sans-serif', 
      flexDirection: 'column',
      textAlign: 'center',
    }}>
      <div>
        <h1 style={{
          fontSize: '3em', 
          fontWeight: 'bold', 
          color: '#e74c3c', 
          marginBottom: '20px',
        }}>
          Wartungsarbeiten!
        </h1>
        
        {/* Bild größer und zentriert */}
        <img 
          src="/lovable-uploads/facc787d-f5d9-4ce8-9d2b-2c329ba5f0cd.png" 
          alt="Wartungsmodus" 
          style={{
            width: '500px',  // Bild größer gemacht
            height: 'auto', 
            marginBottom: '30px', 
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }} 
        />

        <p style={{
          fontSize: '1.5em', 
          marginBottom: '30px', 
          color: '#ecf0f1',
        }}>
          Unsere Website befindet sich momentan in Wartung. Wir sind bald wieder online!
        </p>

        {/* Lade-Kreis entfernt */}
        {/* Footer */}
        <footer style={{
          fontSize: '1em', 
          color: '#ecf0f1',
        }}>
          <p>&copy; 2025 Dein Team. Alle Rechte vorbehalten.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
