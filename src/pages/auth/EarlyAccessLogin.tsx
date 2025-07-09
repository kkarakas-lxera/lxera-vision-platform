import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowRight, Clock, Shield, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, onComplete }) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    
    const newValue = value.split('');
    newValue[index] = digit;
    const updatedValue = newValue.join('');
    onChange(updatedValue);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    if (updatedValue.length === 6 && !updatedValue.includes('')) {
      onComplete?.();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all touch-manipulation"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

const EarlyAccessLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if email exists in early access leads
      const { data: lead, error: leadError } = await supabase
        .from('early_access_leads')
        .select('id, status')
        .eq('email', email.toLowerCase())
        .single();

      if (leadError || !lead) {
        setError('');
        setIsLoading(false);
        // Show early access prompt
        return;
      }

      // Send OTP
      const { error: otpError } = await supabase.functions.invoke('send-verification-code', {
        body: { email: email.toLowerCase() }
      });

      if (otpError) throw otpError;

      setOtpSent(true);
      setStep('otp');
      setResendTimer(60); // 60 second cooldown
      toast({
        title: 'Code sent!',
        description: 'Check your email for the 6-digit verification code.',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp-code', {
        body: { email: email.toLowerCase(), code: otp }
      });

      if (error || !data.success) {
        if (data?.redirect) {
          setError('Email not found. Please sign up for early access first.');
          setTimeout(() => navigate(data.redirect), 2000);
        } else {
          setError(data?.error || 'Invalid or expired code');
        }
        return;
      }

      // Store token in localStorage
      localStorage.setItem('earlyAccessToken', data.token);
      localStorage.setItem('earlyAccessEmail', email.toLowerCase());

      // Navigate to waiting room
      navigate('/waiting-room');
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email: email.toLowerCase() }
      });

      if (error) throw error;

      setResendTimer(60);
      toast({
        title: 'Code resent!',
        description: 'Check your email for the new verification code.',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your early access account
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Early Access Login</CardTitle>
            <CardDescription>
              {step === 'email' 
                ? 'Enter your email to receive a verification code'
                : 'Enter the 6-digit code sent to your email'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email address</Label>
                      <div className="mt-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@company.com"
                          className="pl-10 py-5 text-base border-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 text-base font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-[0.98]" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        <>
                          Continue with email
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {error === '' && email && !isLoading && !otpSent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-3"
                      >
                        <p className="text-sm text-gray-600">
                          Not on the early access list yet?
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/early-access')}
                          className="w-full border-2 border-indigo-200 hover:bg-indigo-50 py-5"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Get early access (30 seconds, no card required)
                        </Button>
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Secure
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            500+ companies
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      We sent a code to <span className="font-semibold">{email}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-center block">Verification code</Label>
                    <OTPInput 
                      value={otp} 
                      onChange={setOtp}
                      onComplete={handleVerifyOTP}
                    />
                  </div>

                  <Button 
                    onClick={handleVerifyOTP}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 text-base font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-[0.98]" 
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify and continue'
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                        setError('');
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0}
                      className={`font-medium ${
                        resendTimer > 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-indigo-600 hover:text-indigo-700'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default EarlyAccessLogin;