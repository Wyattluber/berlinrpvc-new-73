import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Datenschutz = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto py-8 px-4 mt-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Datenschutzerklärung</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold">1. Datenschutz auf einen Blick</h2>

              <h3 className="text-xl font-semibold mt-4">Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
                wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </p>

              <h3 className="text-xl font-semibold mt-4">Datenerfassung auf unserer Website</h3>
              <p>
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Die Kontaktdaten können auf Anfrage bereitgestellt werden.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Wie erfassen wir Ihre Daten?</h3>
              <p>
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B.
                um Daten handeln, die Sie in ein Kontaktformular eingeben.
              </p>
              <p>
                Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem
                technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten
                erfolgt automatisch, sobald Sie unsere Website betreten.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Wofür nutzen wir Ihre Daten?</h3>
              <p>
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten
                können zur Analyse Ihres Nutzerverhaltens verwendet werden.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
              <p>
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten
                personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten
                zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum
                angegebenen Adresse an uns wenden. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-6">2. Allgemeine Hinweise und Pflichtinformationen</h2>

              <h3 className="text-xl font-semibold mt-4">Datenschutz</h3>
              <p>
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen
                Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
              <p>
                Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten,
                mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir
                erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
              </p>
              <p>
                Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken
                aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mt-4">Hinweis zur verantwortlichen Stelle</h3>
              <p>
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p>
                BerlinRP-VC<br />
                <em>[Kontaktdaten auf Anfrage]</em><br />
                E-Mail: kontakt@berlinrp.de
              </p>
              <p>
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke
                und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mt-4">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
              <p>
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte
                Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns. Die Rechtmäßigkeit der bis zum
                Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mt-4">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
              <p>
                Im Falle datenschutzrechtlicher Verstöße steht dem Betroffenen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mt-4">Recht auf Datenübertragbarkeit</h3>
              <p>
                Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert
                verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mt-4">SSL- bzw. TLS-Verschlüsselung</h3>
              <p>
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel
                Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL-bzw. TLS-Verschlüsselung. Eine
                verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt
                und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>
              <p>
                Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-6">3. Datenerfassung auf unserer Website</h2>

              <h3 className="text-xl font-semibold mt-4">Cookies</h3>
              <p>
                Die Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und
                enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
                Cookies sind kleine Textdateien, die auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert.
              </p>
              <p>
                Die meisten der von uns verwendeten Cookies sind so genannte "Session-Cookies". Sie werden nach Ende Ihres Besuchs
                automatisch gelöscht. Andere Cookies bleiben auf Ihrem Endgerät gespeichert bis Sie diese löschen. Diese Cookies
                ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen.
              </p>
              <p>
                Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im
                Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das automatische
                Löschen der Cookies beim Schließen des Browser aktivieren. Bei der Deaktivierung von Cookies kann die Funktionalität
                dieser Website eingeschränkt sein.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mt-4">Server-Log-Dateien</h3>
              <p>
                Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr
                Browser automatisch an uns übermittelt. Dies sind:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Browsertyp und Browserversion</li>
                <li>Verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p className="mt-2">
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-6">4. Supabase-Nutzung</h2>
              <p>
                Wir verwenden Supabase für die Speicherung von Benutzerdaten und Anwendungsdaten. Supabase ist eine
                Backend-as-a-Service-Plattform, die verschiedene Dienste wie Authentifizierung, Datenbank und Speicher anbietet.
              </p>
              <p>
                Wenn Sie sich bei unserer Anwendung registrieren oder anmelden, nutzen wir die Authentifizierungsdienste von Supabase
                zur Verwaltung Ihrer Anmeldedaten. Dabei werden Ihre E-Mail-Adresse und ein verschlüsseltes Passwort bei Supabase gespeichert.
              </p>
              <p>
                Weitere Informationen zum Datenschutz bei Supabase finden Sie in deren Datenschutzerklärung unter:
                <a href="https://supabase.io/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://supabase.io/privacy</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-6">5. Änderungen dieser Datenschutzerklärung</h2>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen
                entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services.
              </p>
              <p>
                Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Datenschutz;
