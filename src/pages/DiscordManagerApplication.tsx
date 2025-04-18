
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout, Info, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const applicationSchema = z.object({
  experience: z.string().min(50, {
    message: "Bitte beschreibe deine Discord-Erfahrung ausführlicher (mindestens 50 Zeichen).",
  }),
  ideas: z.string().min(50, {
    message: "Bitte teile uns mehr über deine Ideen mit (mindestens 50 Zeichen).",
  }),
  availability: z.string().min(10, {
    message: "Bitte gib an, wann du verfügbar bist (mindestens 10 Zeichen).",
  }),
  why: z.string().min(50, {
    message: "Bitte erkläre ausführlicher, warum du Discord Manager werden möchtest (mindestens 50 Zeichen).",
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const DiscordManagerApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      experience: "",
      ideas: "",
      availability: "",
      why: "",
    },
  });
  
  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    
    const checkModeratorStatus = async () => {
      try {
        // In a real application, you would check if the user is a moderator
        // This is just a placeholder implementation
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (error) throw error;
        
        // Check if the user has moderator or admin role
        if (data && (data.role === 'moderator' || data.role === 'admin')) {
          setIsModerator(true);
        } else {
          setIsModerator(false);
        }
      } catch (error) {
        console.error('Error checking moderator status:', error);
        setIsModerator(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkModeratorStatus();
  }, [session, navigate]);
  
  const onSubmit = async (values: ApplicationFormValues) => {
    if (!session) {
      toast({
        title: "Fehler",
        description: "Du musst angemeldet sein, um diese Aktion durchzuführen.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit the application to the database
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            user_id: session.user.id,
            type: 'discord_manager',
            status: 'pending',
            data: {
              experience: values.experience,
              ideas: values.ideas,
              availability: values.availability,
              why: values.why,
            },
          },
        ]);
        
      if (error) throw error;
      
      toast({
        title: "Bewerbung eingereicht",
        description: "Deine Bewerbung als Discord Manager wurde erfolgreich eingereicht.",
      });
      
      // Redirect to profile page
      navigate('/profile?tab=applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Fehler",
        description: "Es ist ein Fehler beim Einreichen deiner Bewerbung aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container mx-auto py-12 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/apply')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-6 w-6 text-purple-500" />
                Discord Manager Bewerbung
              </CardTitle>
              <CardDescription>
                Bewerbe dich als Discord Manager und gestalte unseren Server aktiv mit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isModerator ? (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Moderator-Status erforderlich</h3>
                      <p className="text-yellow-700 mt-1">
                        Für die Bewerbung als Discord Manager musst du bereits ein aktiver Moderator sein.
                        Bitte bewirb dich zuerst als Moderator und versuche es später erneut.
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => navigate('/apply')}
                      >
                        Zurück zur Bewerbungsübersicht
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
                      <h3 className="font-medium text-blue-800 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Moderator-Status bestätigt
                      </h3>
                      <p className="text-blue-700 mt-1">
                        Dein Moderator-Status wurde bestätigt. Du kannst dich nun als Discord Manager bewerben.
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deine Discord-Erfahrung</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Beschreibe deine Erfahrung mit Discord, insbesondere bei der Verwaltung und Gestaltung von Servern..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ideas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deine Ideen für unseren Discord</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Welche Ideen hast du, um unseren Discord-Server zu verbessern?" 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verfügbarkeit</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Zu welchen Zeiten bist du regelmäßig verfügbar?" 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="why"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warum möchtest du Discord Manager werden?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Erkläre, warum du ein guter Discord Manager für unser Team wärst..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Bewerbung wird eingereicht...
                        </>
                      ) : (
                        "Bewerbung einreichen"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Was macht ein Discord Manager?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Als Discord Manager übernimmst du eine wichtige Rolle bei der Gestaltung und Verwaltung 
                unseres Discord-Servers. Du bist verantwortlich für:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Gestaltung und Strukturierung des Discord-Servers</li>
                <li>Einbringen von Neuerungen und Verbesserungsvorschlägen in Teammeetings</li>
                <li>Überwachung der Funktionalität des Servers</li>
                <li>Hinweisen von Teammitgliedern auf Fehler oder Verbesserungsmöglichkeiten</li>
                <li>Pflege und Aktualisierung von Bot-Funktionen</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                <h4 className="font-medium">Anforderungen:</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Aktiver Moderator mit guter Reputation im Team</li>
                  <li>Fundierte Kenntnisse über Discord-Funktionen und -Möglichkeiten</li>
                  <li>Kreativität und ein Auge für benutzerfreundliche Gestaltung</li>
                  <li>Gute Kommunikationsfähigkeiten</li>
                  <li>Technisches Verständnis für Discord-Bots und Integration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DiscordManagerApplication;
