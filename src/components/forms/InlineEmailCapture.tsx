import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface InlineEmailCaptureProps {
  source: string;
  variant?: 'default' | 'mobile';
  buttonText?: string;
  placeholder?: string;
  onSuccess?: (email: string) => void;
  className?: string;
}

const InlineEmailCapture: React.FC<InlineEmailCaptureProps> = ({
  source,
  variant = 'default',
  buttonText = 'Get Started',
  placeholder = 'Enter your work email',
  onSuccess,
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Call edge function to capture email and send magic link
      const response = await supabase.functions.invoke('capture-email', {
        body: {
          email,
          source,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
        }
      });

      if (response.error) throw response.error;

      const data = response.data as any;

      if (data.success) {
        setSubmitted(true);
        
        if (data.message === 'already_registered') {
          toast({
            title: 'Already Registered!',
            description: 'Check your waiting room status.',
          });
          // Redirect to waiting room check
          setTimeout(() => {
            window.location.href = `/waiting-room/check?email=${encodeURIComponent(email)}`;
          }, 2000);
        } else {
          toast({
            title: 'Check Your Email!',
            description: 'We sent you a magic link to complete your profile.',
          });
        }

        onSuccess?.(email);
      }
    } catch (error: any) {
      console.error('Error capturing email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 ${className}`}>
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <p className="text-green-800 font-medium">Check your email!</p>
          <p className="text-green-600 text-sm">We sent a magic link to {email}</p>
        </div>
      </div>
    );
  }

  const isMobile = variant === 'mobile';

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-2 ${className}`}
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 ${isMobile ? 'h-12 text-base' : 'h-11'}`}
        required
        disabled={loading}
        inputMode="email"
        autoComplete="email"
      />
      <Button 
        type="submit" 
        disabled={loading}
        className={`
          bg-future-green text-business-black hover:bg-future-green/90 font-medium 
          ${isMobile ? 'h-12 text-base w-full' : 'h-11 px-6'}
          min-h-[48px] touch-manipulation
        `}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </form>
  );
};

export default InlineEmailCapture;