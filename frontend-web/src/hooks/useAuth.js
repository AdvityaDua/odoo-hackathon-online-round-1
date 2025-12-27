import { useState, useEffect } from 'react';
import authService from '../services/auth';

const useAuth = () => {
  const initialUser = authService.getCurrentUser();
  const [user, setUser] = useState(initialUser);
  const [isAdmin, setIsAdmin] = useState(initialUser ? (initialUser.roles || []).includes('admin') : false);
  const [isTechnician, setIsTechnician] = useState(initialUser ? (initialUser.roles || []).includes('technician') : false);

  // This effect will primarily handle updates if the user logs out or role changes happen dynamically, which is not the primary flow for this issue.
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser !== user) { // Only update if user object itself changes
      setUser(currentUser);
      const userRoles = currentUser.roles || [];
      setIsAdmin(userRoles.includes('admin'));
      setIsTechnician(userRoles.includes('technician'));
    } else if (!currentUser && user) { // If user was logged in but no longer is
      setUser(null);
      setIsAdmin(false);
      setIsTechnician(false);
    }
  }, []); // Empty dependency array means this effect runs once on mount. Subsequent updates will rely on parent re-renders or direct calls if implemented.

  // Add an effect to re-evaluate roles if the user object changes for any reason
  // (e.g., if authService.getCurrentUser() is called again manually or if a parent component updates auth state)
  useEffect(() => {
    if (user) {
      const userRoles = user.roles || [];
      setIsAdmin(userRoles.includes('admin'));
      setIsTechnician(userRoles.includes('technician'));
    } else {
      setIsAdmin(false);
      setIsTechnician(false);
    }
  }, [user]);

  return { user, isAdmin, isTechnician };
};

export default useAuth;

