import { Navigate } from 'react-router-dom';

/**
 * Component that redirects all traffic to the waiting list landing page
 * Used during pre-launch phase to ensure all visitors see the waiting list
 */
export const WaitingListRedirect = () => {
  return <Navigate to="/waiting-list" replace />;
};
