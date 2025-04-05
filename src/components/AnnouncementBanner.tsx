
import React, { useState, useEffect } from 'react';
import { Bell, X, ChevronRight } from 'lucide-react';
import { getUnreadServerWideAnnouncements, markAnnouncementAsRead, Announcement } from '@/lib/announcementService';
import { useNavigate } from 'react-router-dom';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const unreadAnnouncements = await getUnreadServerWideAnnouncements();
        setAnnouncements(unreadAnnouncements);
      } catch (error) {
        console.error('Error fetching unread announcements:', error);
      }
    };

    fetchAnnouncements();
    // Refresh announcements every 5 minutes
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (announcements.length === 0 || dismissed.has(announcements[currentIndex]?.id)) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  const handleDismiss = async () => {
    try {
      await markAnnouncementAsRead(currentAnnouncement.id);
      const newDismissed = new Set(dismissed);
      newDismissed.add(currentAnnouncement.id);
      setDismissed(newDismissed);
      
      // Move to next announcement if available
      if (currentIndex < announcements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  };

  const handleViewDetails = () => {
    navigate(`/profile?tab=announcements&id=${currentAnnouncement.id}`);
    handleDismiss();
  };

  return (
    <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <Bell className="h-4 w-4 mr-2" />
        <span className="font-semibold">{currentAnnouncement.title}</span>
        <span className="mx-2">—</span>
        <span className="hidden sm:inline-block truncate max-w-md">{currentAnnouncement.content}</span>
      </div>
      <div className="flex items-center ml-4">
        <button 
          onClick={handleViewDetails}
          className="flex items-center hover:underline text-white font-medium mr-4"
        >
          Details <ChevronRight className="h-4 w-4 ml-1" />
        </button>
        <button onClick={handleDismiss} className="text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
