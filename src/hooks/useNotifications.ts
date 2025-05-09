import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'donors' | 'recipients' | 'admins';
  status: 'active' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function useNotifications() {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!db || !user) return;
    setLoading(true);
    setError(null);

    try {
      const notificationsCollectionRef = collection(db, 'notifications');
      let notificationsQuery = query(
        notificationsCollectionRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      // Add target filter based on user role
      if (isAdmin) {
        notificationsQuery = query(
          notificationsCollectionRef,
          where('status', '==', 'active'),
          where('target', 'in', ['all', 'admins']),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      } else {
        const userRole = user.role || 'donor';
        notificationsQuery = query(
          notificationsCollectionRef,
          where('status', '==', 'active'),
          where('target', 'in', ['all', userRole]),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }

      const notificationsSnapshot = await getDocs(notificationsQuery);
      const fetchedNotifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
  };
} 