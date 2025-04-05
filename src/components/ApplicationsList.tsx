
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { LoaderIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import { fetchApplications, updateApplicationStatus } from '@/lib/admin/applications';
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
  status: 'pending' | 'approved' | 'rejected';
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
  const [statusAction, setStatusAction] = useState<'approve' | 'reject' | null>(null);
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

  const handleStatusAction = (application: Application, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setStatusAction(action);
    setStatusNotes('');
    setShowStatusDialog(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedApplication || !statusAction) return;

    setUpdatingStatus(true);
    try {
      const newStatus = statusAction === 'approve' ? 'approved' : 'rejected';
      await updateApplicationStatus(selectedApplication.id, newStatus, statusNotes);

      toast({
        title: 'Erfolg',
        description: `Die Bewerbung wurde erfolgreich ${statusAction === 'approve' ? 'angenommen' : 'abgelehnt'}.`
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Angenommen</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Abgelehnt</span>;
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
