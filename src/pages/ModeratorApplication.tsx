
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const applicationSchema = z.object({
  age: z.string().min(1, {
    message: "Bitte gib dein Alter an.",
  }),
  experience: z.string().min(50, {
    message: "Bitte beschreibe deine Erfahrung ausführlicher (mindestens 50 Zeichen).",
  }),
  strengths: z.string().min(50, {
    message: "Bitte teile uns mehr über deine Stärken mit (mindestens 50 Zeichen).",
  }),
  availability: z.string().min(10, {
    message: "Bitte gib an, wann du verfügbar bist (mindestens 10 Zeichen).",
  }),
  why: z.string().min(50, {
    message: "Bitte erkläre ausführlicher, warum du Moderator werden möchtest (mindestens 50 Zeichen).",
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const ModeratorApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      age: "",
      experience: "",
      strengths: "",
      availability: "",
      why: "",
    },
  });
  
  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
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
            type: 'moderator',
            status: 'pending',
            data: {
              age: values.age,
              experience: values.experience,
              strengths: values.strengths,
              availability: values.availability,
              why: values.why,
            },
          },
        ]);
        
      if (error) throw error;
      
      toast({
        title: "Bewerbung eingereicht",
        description: "Deine Bewerbung als Moderator wurde erfolgreich eingereicht.",
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
  
  if (!session) {
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
                <ShieldCheck className="h-6 w-6 text-green-500" />
                Moderator Bewerbung
              </CardTitle>
              <CardDescription>
                Bewerbe dich als Moderator und unterstütze unser Team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dein Alter</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="z.B. 18" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deine Erfahrung als Moderator</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Beschreibe deine bisherige Erfahrung als Moderator oder in ähnlichen Positionen..." 
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
                    name="strengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deine Stärken</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Was sind deine persönlichen Stärken, die dir als Moderator helfen können?" 
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
                        <FormLabel>Warum möchtest du Moderator werden?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Erkläre, warum du ein guter Moderator für unser Team wärst..." 
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Was macht ein Moderator?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Als Moderator spielst du eine entscheidende Rolle bei der Aufrechterhaltung einer 
                positiven und sicheren Umgebung für unsere Community. Du bist verantwortlich für:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Durchsetzung der Community-Regeln</li>
                <li>Bearbeitung von Nutzeranfragen und -problemen</li>
                <li>Schlichtung von Konflikten</li>
                <li>Überwachung von Chat-Kanälen</li>
                <li>Unterstützung neuer Mitglieder</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                <h4 className="font-medium">Anforderungen:</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Geduld und Verständnis im Umgang mit Menschen</li>
                  <li>Fähigkeit, fair und unparteiisch zu handeln</li>
                  <li>Zuverlässigkeit und Verantwortungsbewusstsein</li>
                  <li>Gute Kommunikationsfähigkeiten</li>
                  <li>Bereitschaft, mit dem Team zusammenzuarbeiten</li>
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

export default ModeratorApplication;
