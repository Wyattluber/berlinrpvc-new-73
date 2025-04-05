import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Calendar as CalendarIcon, LoaderIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { createTeamAbsence } from '@/lib/admin/team';

const FormSchema = z.object({
  userId: z.string().min(1, {
    message: "User ID is required.",
  }),
  endDate: z.date({
    required_error: "A date is required.",
  }),
  reason: z.string().min(1, {
    message: "Reason is required.",
  }),
});

const TeamAbsenceForm = () => {
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userId: "",
      endDate: new Date(),
      reason: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsCreating(true);
    try {
      const endDateString = values.endDate.toISOString();
      const result = await createTeamAbsence(values.userId, endDateString, values.reason);
      
      if (result.success) {
        form.reset();
        alert("Team absence created successfully!");
      } else {
        alert(`Failed to create team absence: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating team absence:", error);
      alert("An error occurred while creating the team absence.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Team Absence</CardTitle>
        <CardDescription>Create a new team absence entry.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input placeholder="User ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the ID of the user who will be absent.
                  </FormDescription>
                  <FormDescription>
                    This should be the Supabase User ID.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Enter the last day of absence.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Reason for absence"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the reason for the absence.
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Absence"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Please fill out all fields to create a new team absence entry.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TeamAbsenceForm;
