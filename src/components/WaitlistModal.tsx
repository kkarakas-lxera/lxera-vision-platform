
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistModal = ({ isOpen, onClose }: WaitlistModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    interest: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your full name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/functions/v1/waitlist-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          interest: formData.interest,
          source: 'simple-modal'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        toast({
          title: "Welcome to the Waitlist!",
          description: "We'll notify you as soon as early access is available.",
        });
      } else {
        throw new Error(data.error || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Waitlist submission failed:', error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ 
      fullName: "",
      email: "",
      interest: ""
    });
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-future-green/20">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-semibold text-business-black font-inter">
            {isSubmitted ? "Welcome Aboard!" : "Get Early Access"}
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-future-green mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-business-black">
                You're on the waitlist!
              </h3>
              <p className="text-business-black/70">
                We'll notify you as soon as early access is available.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-8 py-2 rounded-xl"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-business-black/70 font-inter">
              Be among the first to experience the future of learning.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-business-black">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange("fullName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-business-black">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest" className="text-sm font-medium text-business-black">
                  Why are you interested? (Optional)
                </Label>
                <Textarea
                  id="interest"
                  placeholder="Tell us what excites you about LXERA..."
                  value={formData.interest}
                  onChange={handleInputChange("interest")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green min-h-[80px] resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-2 border-gray-300 text-business-black hover:bg-gray-50 hover:text-business-black font-medium py-2 rounded-xl transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-future-green text-business-black hover:bg-future-green/90 font-medium py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join the Waitlist"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
