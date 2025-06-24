
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const MagicLinkSender = () => {
  const [email, setEmail] = useState('kubilaycenkkarakas@gmail.com');
  const [employeeId, setEmployeeId] = useState('KK001');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendMagicLink = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-magic-link', {
        body: { 
          email,
          employee_id: employeeId 
        }
      });

      if (error) throw error;

      toast({
        title: "Magic link sent!",
        description: `A secure login link has been sent to ${email}`,
      });

      console.log('Magic link sent successfully:', data);
    } catch (error) {
      console.error('Failed to send magic link:', error);
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Send Login Link</span>
        </CardTitle>
        <CardDescription>
          Send a secure one-time login link to the employee
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Employee Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@company.com"
          />
        </div>
        <div>
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="EMP001"
          />
        </div>
        <Button 
          onClick={sendMagicLink} 
          disabled={sending}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </CardContent>
    </Card>
  );
};
