
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { LoaderIcon, CheckCircle, XCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { fetchApplications, updateApplicationStatus } from '@/lib/adminService';
import { useIsMobile } from '@/hooks/use-mobile';
import ApplicationListDesktop from './applications/ApplicationListDesktop';
import ApplicationListMobile from './applications/ApplicationListMobile';
import ApplicationViewDialog from './applications/ApplicationViewDialog';
import ApplicationStatusDialog from './applications/ApplicationStatusDialog';

interface Application {
  id: string;
  user_id: string;
  discord_id: string;
  discord_username?: string;
  roblox_id: string;
  roblox_username: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'deleted';
  created_at: string;
  updated_at: string;
  notes: string | null;
  username?: string | null;
  [key: string]: any;
}

const ApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusAction, setStatusAction] = useState<'approve' | 'reject' | 'waitlist' | 'delete' | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const isMobile = useIsMobile();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchApplications();
      console.log('Loaded applications:', data);
      setApplications(data);
      setFilteredApplications(data);
    } catch (error) {
      console.error('Error loading applications', error);
      toast({
        title: 'Fehler',
        description: 'Die Bewerbungen konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowViewDialog(true);
  };

  const handleStatusAction = (application: Application, action: 'approve' | 'reject' | 'waitlist' | 'delete') => {
    setSelectedApplication(application);
    setStatusAction(action);
    setStatusNotes('');
    setShowStatusDialog(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedApplication || !statusAction) return;

    setUpdatingStatus(true);
    try {
      let newStatus: 'approved' | 'rejected' | 'waitlist' | 'deleted';
      switch (statusAction) {
        case 'approve':
          newStatus = 'approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'waitlist':
          newStatus = 'waitlist';
          break;
        case 'delete':
          newStatus = 'deleted';
          break;
        default:
          throw new Error('Invalid status action');
      }
      
      await updateApplicationStatus(selectedApplication.id, newStatus, statusNotes);

      toast({
        title: 'Erfolg',
        description: getStatusActionMessage(statusAction)
      });

      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApplication.id ? { ...app, status: newStatus, notes: statusNotes } : app
      ));

      setShowStatusDialog(false);
    } catch (error) {
      console.error('Error updating application status', error);
      toast({
        title: 'Fehler',
        description: 'Der Status konnte nicht aktualisiert werden.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusActionMessage = (action: string) => {
    switch (action) {
      case 'approve':
        return 'Die Bewerbung wurde erfolgreich angenommen.';
      case 'reject':
        return 'Die Bewerbung wurde erfolgreich abgelehnt.';
      case 'waitlist':
        return 'Die Bewerbung wurde erfolgreich auf die Warteliste gesetzt.';
      case 'delete':
        return 'Die Bewerbung wurde erfolgreich gelöscht.';
      default:
        return 'Der Status wurde erfolgreich aktualisiert.';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Angenommen</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Abgelehnt</span>;
      case 'waitlist':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><AlertTriangle className="w-3 h-3 mr-1" /> Warteliste</span>;
      case 'deleted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><Trash2 className="w-3 h-3 mr-1" /> Gelöscht</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Ausstehend</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
           ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {isMobile ? 
        <ApplicationListMobile 
          filteredApplications={filteredApplications}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          loadApplications={loadApplications}
          handleViewApplication={handleViewApplication}
          handleStatusAction={handleStatusAction}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        /> : 
        <ApplicationListDesktop 
          filteredApplications={filteredApplications}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          loadApplications={loadApplications}
          handleViewApplication={handleViewApplication}
          handleStatusAction={handleStatusAction}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      }
      
      <ApplicationViewDialog 
        showViewDialog={showViewDialog}
        setShowViewDialog={setShowViewDialog}
        selectedApplication={selectedApplication}
        handleStatusAction={handleStatusAction}
        getStatusBadge={getStatusBadge}
        formatDate={formatDate}
      />
      
      <ApplicationStatusDialog 
        showStatusDialog={showStatusDialog}
        setShowStatusDialog={setShowStatusDialog}
        statusAction={statusAction}
        statusNotes={statusNotes}
        setStatusNotes={setStatusNotes}
        handleStatusSubmit={handleStatusSubmit}
        updatingStatus={updatingStatus}
      />
    </>
  );
};

export default ApplicationsList;
