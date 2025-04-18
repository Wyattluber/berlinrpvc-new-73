import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Users, ShieldCheck, Handshake, FileText, MessageSquare, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import PartnershipRequestForm from '@/components/admin/PartnershipRequestsForm';

const Apply = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formSchema = z.object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    })
  }

  const handleEmailSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });

      if (error) {
        console.error('Error sending magic link:', error);
        toast({
          title: "Error",
          description: "Failed to send magic link.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Magic link sent to your email!",
        });
        navigate('/profile');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
          Werde Teil von BerlinRP-VC
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Entdecke die Möglichkeiten, dich in unserer Community einzubringen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Teammitglied werden */}
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Teammitglied werden
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Hilf uns, BerlinRP-VC noch besser zu machen. Wir suchen engagierte
              Teammitglieder für verschiedene Bereiche.
            </CardDescription>
            <Button asChild className="mt-4 w-full">
              <Link to="/apply/form">Jetzt bewerben</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Moderator werden */}
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              Moderator werden
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Unterstütze uns bei der Moderation und sorge für eine faire und
              angenehme Atmosphäre auf unseren Servern.
            </CardDescription>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="mt-4 w-full">
                  Als Moderator bewerben
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Moderator werden</AlertDialogTitle>
                  <AlertDialogDescription>
                    Um Moderator zu werden, musst du dich zuerst anmelden. Bitte gib deine E-Mail-Adresse ein, um einen Magic Link zu erhalten.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    placeholder="me@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction disabled={isLoading} onClick={handleEmailSubmit}>
                    {isLoading ? (
                      <>
                        Wird gesendet...
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      "Senden"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Partner werden */}
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Handshake className="h-5 w-5 text-yellow-500" />
              Partner werden
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Werde Partner von BerlinRP-VC und profitiere von unserer Reichweite
              und Community.
            </CardDescription>
            <Button asChild className="mt-4 w-full">
              <Link to="/partners">Mehr erfahren</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Häufig gestellte Fragen
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Wie kann ich mich als Teammitglied bewerben?</AccordionTrigger>
            <AccordionContent>
              Um dich als Teammitglied zu bewerben, fülle bitte das Bewerbungsformular
              auf unserer Website aus. Wir werden uns so schnell wie möglich bei dir
              melden.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Welche Vorteile habe ich als Moderator?</AccordionTrigger>
            <AccordionContent>
              Als Moderator hast du die Möglichkeit, aktiv die Community mitzugestalten
              und für eine positive Atmosphäre zu sorgen. Zudem erhältst du exklusive
              Einblicke und kannst dich mit anderen Moderatoren austauschen.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Wie funktioniert eine Partnerschaft mit BerlinRP-VC?</AccordionTrigger>
            <AccordionContent>
              Eine Partnerschaft mit uns bietet dir die Möglichkeit, deine Marke oder
              dein Projekt einem breiten Publikum vorzustellen. Kontaktiere uns für
              weitere Informationen und individuelle Vereinbarungen.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Partnerschaftsanfrage
        </h2>
        <PartnershipRequestForm />
      </section>
    </div>
  );
};

export default Apply;
