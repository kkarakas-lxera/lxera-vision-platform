
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { airtableService, type DemoRequest } from "@/services/airtableService";
import { useToast } from "@/hooks/use-toast";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const DemoModal = ({ isOpen, onClose, source = "Website" }: DemoModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
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
    
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const demoRequest: DemoRequest = {
        ...formData,
        source,
        timestamp: new Date().toISOString(),
      };

      await airtableService.submitDemoRequest(demoRequest);
      
      setIsSubmitted(true);
      toast({
        title: "Demo Request Submitted!",
        description: "We'll be in touch within 24 hours to schedule your personalized demo.",
      });
    } catch (error) {
      console.error('Demo request submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", company: "", message: "" });
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-future-green/20">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-semibold text-business-black font-inter">
              {isSubmitted ? "Thank You!" : "Request a Demo"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-future-green mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-business-black">
                Your demo request has been submitted!
              </h3>
              <p className="text-business-black/70">
                Our team will contact you within 24 hours to schedule your personalized LXERA demo.
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-business-black">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-business-black">
                  Work Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your work email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-business-black">
                  Company *
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Enter your company name"
                  value={formData.company}
                  onChange={handleInputChange("company")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-business-black">
                  Tell us about your learning & innovation goals (optional)
                </Label>
                <Textarea
                  id="message"
                  placeholder="What challenges are you looking to solve?"
                  value={formData.message}
                  onChange={handleInputChange("message")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-2 border-gray-300 text-business-black hover:bg-gray-50 font-medium py-2 rounded-xl"
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
                    Submitting...
                  </>
                ) : (
                  "Request Demo"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal;
