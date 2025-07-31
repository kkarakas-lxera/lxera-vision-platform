
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useEmployee = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching employee:', error);
        } else if (data && data.length > 0) {
          // If multiple records exist, use the first one
          setEmployee(data[0]);
        } else {
          // No employee record exists for this user
          setEmployee(null);
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [user?.id]);

  return { employee, loading };
};
