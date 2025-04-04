
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Impressum = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Impressum</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
            <p className="mb-4">
              Berlin RP<br />
              [Straße Hausnummer]<br />
              [PLZ Ort]
            </p>
            
            <h3 className="text-lg font-medium mb-2">Vertreten durch:</h3>
            <p className="mb-4">
              [Name des Verantwortlichen]
            </p>
            
            <h3 className="text-lg font-medium mb-2">Kontakt:</h3>
            <p className="mb-1">Telefon: [Telefonnummer]</p>
            <p className="mb-1">E-Mail: <a href="mailto:kontakt@berlinrp.de" className="text-blue-600 hover:underline">kontakt@berlinrp.de</a></p>
            <p className="mb-4">Discord: <a href="https://discord.gg/berlinrp" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://discord.gg/berlinrp</a></p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Haftungsausschluss (Disclaimer)</h2>
            
            <h3 className="text-lg font-medium mb-2">Haftung für Inhalte</h3>
            <p className="mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. 
              Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu 
              überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mb-4">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. 
              Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden 
              von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
            
            <h3 className="text-lg font-medium mb-2">Haftung für Links</h3>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese 
              fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
              Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige 
              Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p className="mb-4">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. 
              Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
            
            <h3 className="text-lg font-medium mb-2">Urheberrecht</h3>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, 
              Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des 
              jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
          </section>
        </div>
      </main>
      
      <Footer hideApplyButton={true} />
    </div>
  );
};

export default Impressum;
