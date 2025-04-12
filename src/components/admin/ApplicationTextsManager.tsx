
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RefreshCw } from 'lucide-react';

import { 
  getApplicationTexts, 
  updateApplicationTexts, 
  DEFAULT_TEAM_DESCRIPTION,
  DEFAULT_PARTNERSHIP_DESCRIPTION,
  DEFAULT_REQUIREMENTS_DESCRIPTION
} from '@/lib/admin/applicationTexts';

const ApplicationTextsManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamDescription, setTeamDescription] = useState(DEFAULT_TEAM_DESCRIPTION);
  const [partnershipDescription, setPartnershipDescription] = useState(DEFAULT_PARTNERSHIP_DESCRIPTION);
  const [requirementsDescription, setRequirementsDescription] = useState(DEFAULT_REQUIREMENTS_DESCRIPTION);
  const [activeTab, setActiveTab] = useState('team');

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    setLoading(true);
    try {
      const texts = await getApplicationTexts();
      if (texts) {
        setTeamDescription(texts.team_description || DEFAULT_TEAM_DESCRIPTION);
        setPartnershipDescription(texts.partnership_description || DEFAULT_PARTNERSHIP_DESCRIPTION);
        setRequirementsDescription(texts.requirements_description || DEFAULT_REQUIREMENTS_DESCRIPTION);
      }
    } catch (error) {
      console.error('Error loading application texts:', error);
      toast({
        title: 'Fehler',
        description: 'Bewerbungstexte konnten nicht geladen werden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateApplicationTexts({
        team_description: teamDescription,
        partnership_description: partnershipDescription,
        requirements_description: requirementsDescription
      });

      if (result.success) {
        toast({
          title: 'Gespeichert',
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Änderungen konnten nicht gespeichert werden',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = (type: 'team' | 'partnership' | 'requirements') => {
    switch (type) {
      case 'team':
        setTeamDescription(DEFAULT_TEAM_DESCRIPTION);
        break;
      case 'partnership':
        setPartnershipDescription(DEFAULT_PARTNERSHIP_DESCRIPTION);
        break;
      case 'requirements':
        setRequirementsDescription(DEFAULT_REQUIREMENTS_DESCRIPTION);
        break;
    }

    toast({
      title: 'Zurückgesetzt',
      description: `Text wurde auf den Standardwert zurückgesetzt. Klicke auf Speichern, um die Änderungen zu übernehmen.`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Bewerbungstexte verwalten</CardTitle>
        <CardDescription>
          Bearbeite die Texte, die auf der Bewerbungsseite angezeigt werden
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="team">Team-Bewerbung</TabsTrigger>
            <TabsTrigger value="partnership">Partnerschaft</TabsTrigger>
            <TabsTrigger value="requirements">Anforderungen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="team" className="space-y-4">
            <Alert>
              <AlertDescription>
                Dieser Text wird auf der Team-Bewerbungsseite angezeigt und beschreibt die Aufgaben und Erwartungen an Teammitglieder.
              </AlertDescription>
            </Alert>
            <Textarea 
              className="min-h-[400px] font-mono text-sm"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="Beschreibung der Team-Bewerbung eingeben..."
            />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => resetToDefault('team')}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Auf Standard zurücksetzen
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="partnership" className="space-y-4">
            <Alert>
              <AlertDescription>
                Dieser Text wird auf der Partnerschafts-Bewerbungsseite angezeigt und beschreibt die Vorteile und Bedingungen einer Partnerschaft.
              </AlertDescription>
            </Alert>
            <Textarea 
              className="min-h-[400px] font-mono text-sm"
              value={partnershipDescription}
              onChange={(e) => setPartnershipDescription(e.target.value)}
              placeholder="Beschreibung der Partnerschafts-Bewerbung eingeben..."
            />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => resetToDefault('partnership')}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Auf Standard zurücksetzen
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="requirements" className="space-y-4">
            <Alert>
              <AlertDescription>
                Dieser Text beschreibt die allgemeinen Anforderungen für Bewerber.
              </AlertDescription>
            </Alert>
            <Textarea 
              className="min-h-[400px] font-mono text-sm"
              value={requirementsDescription}
              onChange={(e) => setRequirementsDescription(e.target.value)}
              placeholder="Beschreibung der allgemeinen Anforderungen eingeben..."
            />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => resetToDefault('requirements')}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Auf Standard zurücksetzen
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApplicationTextsManager;
