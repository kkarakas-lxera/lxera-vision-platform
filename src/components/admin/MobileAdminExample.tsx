'use client';

import React, { useState } from 'react';
import { Plus, MoreVertical, Edit, Trash, Archive } from 'lucide-react';
import { MobileAdminHeader } from './MobileAdminHeader';
import { MobileActionSheet, ActionItem } from './MobileActionSheet';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { OfflineIndicator } from './OfflineIndicator';
import { SyncIndicator } from './SyncIndicator';
import { MobileListSkeleton, MobileStatsSkeleton } from './MobileSkeletons';
import { useHapticButton } from '@/hooks/useHapticFeedback';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Example data
const exampleItems = [
  { id: '1', name: 'John Doe', role: 'Developer', status: 'Active' },
  { id: '2', name: 'Jane Smith', role: 'Designer', status: 'Active' },
  { id: '3', name: 'Bob Johnson', role: 'Manager', status: 'Inactive' },
];

export function MobileAdminExample() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { onClick } = useHapticButton();

  const handleSync = async () => {
    // Simulate sync operation
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const actions: ActionItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: () => {
        setIsFormOpen(true);
        console.log('Edit item:', selectedItem);
      }
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="h-4 w-4" />,
      onClick: () => {
        console.log('Archive item:', selectedItem);
      }
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash className="h-4 w-4" />,
      variant: 'destructive',
      onClick: () => {
        console.log('Delete item:', selectedItem);
      }
    }
  ];

  // Simulate loading
  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileAdminHeader
        title="Team Members"
        onMenuClick={() => setIsMenuOpen(true)}
        actions={
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick(() => setIsFormOpen(true))}
            className="h-9 w-9"
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Sync Status */}
        <div className="flex justify-end">
          <SyncIndicator onSync={handleSync} />
        </div>

        {/* Stats */}
        {isLoading ? (
          <MobileStatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-semibold mt-1">24</p>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="bg-card rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold mt-1">18</p>
              <p className="text-xs text-muted-foreground mt-1">75% of total</p>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <MobileListSkeleton />
        ) : (
          <div className="space-y-3">
            {exampleItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'bg-card rounded-lg p-4',
                  'active:scale-98 transition-transform'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClick(() => {
                      setSelectedItem(item.id);
                    })}
                    className="h-8 w-8"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    item.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Sheet */}
      <MobileActionSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        actions={actions}
        title="Actions"
        description={`What would you like to do with this member?`}
      />

      {/* Form Modal */}
      <ResponsiveModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title="Add Team Member"
        description="Fill in the details below to add a new team member."
      >
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-lg">
              <option>Developer</option>
              <option>Designer</option>
              <option>Manager</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Member
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
}