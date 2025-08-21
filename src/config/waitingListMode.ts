/**
 * Configuration for waiting list mode
 * Set WAITING_LIST_MODE to false when ready to launch the full platform
 */
export const WAITING_LIST_MODE = true;

/**
 * Routes that should remain accessible even in waiting list mode
 * (Essential for admin access and authentication)
 */
export const ALLOWED_ROUTES_IN_WAITING_LIST_MODE = [
  '/waiting-list',
  '/login', 
  '/auth/callback',
  '/admin'  // Admin routes (with /* wildcard handled in routing)
];

/**
 * Check if a route should be accessible in waiting list mode
 */
export const isRouteAllowedInWaitingListMode = (pathname: string): boolean => {
  if (!WAITING_LIST_MODE) return true;
  
  return ALLOWED_ROUTES_IN_WAITING_LIST_MODE.some(allowedRoute => 
    pathname === allowedRoute || pathname.startsWith(allowedRoute + '/')
  );
};
