import DemoModal from "./DemoModal";
import DemoModalOptimized from "./DemoModalOptimized";
import { useIsMobile } from "@/hooks/use-mobile";

interface DemoModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

/**
 * Wrapper component that automatically selects the appropriate demo modal
 * based on the device type. Uses the optimized version for better mobile experience.
 */
const DemoModalWrapper = (props: DemoModalWrapperProps) => {
  const isMobile = useIsMobile();
  
  // For now, always use the optimized version which handles both mobile and desktop
  // This ensures consistent experience and better mobile support
  return <DemoModalOptimized {...props} />;
  
  // If you want to use different components for mobile vs desktop:
  // return isMobile ? <DemoModalOptimized {...props} /> : <DemoModal {...props} />;
};

export default DemoModalWrapper;