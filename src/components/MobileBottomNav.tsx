import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, FileText, Bell, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Subscribe to notifications
      const channel = supabase
        .channel('notifications-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchUnreadCount();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    setUnreadCount(count || 0);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-4 h-16">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center gap-1 ${
            isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs">Dashboard</span>
        </Link>
        
        <Link
          to="/jobs"
          className={`flex flex-col items-center justify-center gap-1 ${
            isActive('/jobs') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Briefcase className="h-5 w-5" />
          <span className="text-xs">Jobs</span>
        </Link>
        
        <Link
          to="/apply"
          className={`flex flex-col items-center justify-center gap-1 ${
            isActive('/apply') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs">Apply</span>
        </Link>
        
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center gap-1 relative ${
            isActive('/dashboard') && location.search.includes('tab=notifications') ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={(e) => {
            if (location.pathname === '/dashboard') {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('switchTab', { detail: 'notifications' }));
            }
          }}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs">Notifications</span>
        </Link>
      </div>
    </nav>
  );
};
