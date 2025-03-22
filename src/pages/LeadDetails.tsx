
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  DollarSign,
  CalendarClock,
  ClipboardList,
  Bell,
  CheckCircle2,
  AlertCircle,
  BarChart4
} from 'lucide-react';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import TaskReminder from '@/components/TaskReminder';
import LeadTimeline from '@/components/LeadTimeline';
import AssignLeadForm from '@/components/AssignLeadForm';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  preferredContactMethod: string;
  propertyType: string;
  budgetRange: number[];
  locationPreference: string;
  bedrooms: string;
  bathrooms: string;
  leadSource: string;
  inquiryPurpose: string;
  timeline: string;
  preferredContactTime: string;
  createdAt: string;
  notes?: string;
  amenities?: string[];
  assignedTo?: string;
  assignedDate?: string;
  stage?: string;
  lastContact?: string;
  tasks?: Task[];
  activities?: Activity[];
}

interface Task {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  assignedTo: string;
  createdAt: string;
}

interface Activity {
  id: string;
  leadId: string;
  type: string;
  description: string;
  date: string;
  performedBy?: string;
}

const LeadDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = () => {
      setLoading(true);
      const storedLeads = localStorage.getItem('leads');
      if (storedLeads) {
        const parsedLeads = JSON.parse(storedLeads);
        const foundLead = parsedLeads.find((lead: Lead) => lead.id === id);
        
        if (foundLead) {
          // Ensure all required properties exist
          foundLead.tasks = foundLead.tasks || [];
          foundLead.activities = foundLead.activities || [];
          foundLead.stage = foundLead.stage || 'new';
          
          setLead(foundLead);
        }
      }
      setLoading(false);
    };

    fetchLead();
  }, [id]);

  const getStageProgress = () => {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed'];
    if (!lead?.stage) return 0;
    const currentIndex = stages.indexOf(lead.stage);
    return Math.round(((currentIndex + 1) / stages.length) * 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const updateLead = (updatedLead: Lead) => {
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      const parsedLeads = JSON.parse(storedLeads);
      const updatedLeads = parsedLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('leads', JSON.stringify(updatedLeads));
      setLead(updatedLead);
      toast({
        title: "Lead updated",
        description: "Lead information has been successfully updated",
      });
    }
  };

  const handleStageUpdate = (newStage: string) => {
    if (!lead) return;
    
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      leadId: lead.id,
      type: 'stage_change',
      description: `Lead moved from ${lead.stage} to ${newStage}`,
      date: new Date().toISOString(),
    };
    
    const updatedLead = {
      ...lead,
      stage: newStage,
      activities: [...(lead.activities || []), newActivity]
    };
    
    updateLead(updatedLead);
  };

  const handleAssign = (assignee: string) => {
    if (!lead) return;
    
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      leadId: lead.id,
      type: 'assignment',
      description: `Lead assigned to ${assignee}`,
      date: new Date().toISOString(),
    };
    
    const updatedLead = {
      ...lead,
      assignedTo: assignee,
      assignedDate: new Date().toISOString(),
      activities: [...(lead.activities || []), newActivity]
    };
    
    updateLead(updatedLead);
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'leadId' | 'createdAt'>) => {
    if (!lead) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      leadId: lead.id,
      ...task,
      createdAt: new Date().toISOString(),
    };
    
    const updatedLead = {
      ...lead,
      tasks: [...(lead.tasks || []), newTask]
    };
    
    updateLead(updatedLead);
  };

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    if (!lead || !lead.tasks) return;
    
    const updatedTasks = lead.tasks.map(task => 
      task.id === taskId ? { ...task, completed } : task
    );
    
    const updatedLead = {
      ...lead,
      tasks: updatedTasks
    };
    
    updateLead(updatedLead);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="container-custom pt-28 md:pt-32">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading lead details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="container-custom pt-28 md:pt-32">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Lead not found</h2>
            <p className="text-muted-foreground mb-4">The lead you are looking for could not be found.</p>
            <Button onClick={() => navigate('/leads')}>Go to Leads Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="container-custom pt-28 md:pt-32">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-lg p-6 lg:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {lead.firstName} {lead.lastName}
                </h1>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Added {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  className={`capitalize ${
                    lead.stage === 'closed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {(lead.stage || 'new').replace(/_/g, ' ')}
                </Badge>
                
                {lead.assignedTo && (
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-1">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {lead.assignedTo.split(' ').map(name => name[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{lead.assignedTo}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Conversion Progress</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {lead.stage || 'New Lead'}
                </span>
              </div>
              <Progress value={getStageProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col p-3 border rounded-md bg-secondary/10">
                <span className="text-xs text-muted-foreground mb-1">Contact via</span>
                <div className="flex items-center">
                  {lead.preferredContactMethod === 'phone' ? (
                    <Phone className="h-4 w-4 mr-1 text-primary" />
                  ) : (
                    <Mail className="h-4 w-4 mr-1 text-primary" />
                  )}
                  <span className="text-sm font-medium capitalize">
                    {lead.preferredContactMethod}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col p-3 border rounded-md bg-secondary/10">
                <span className="text-xs text-muted-foreground mb-1">Inquiry Purpose</span>
                <span className="text-sm font-medium capitalize">{lead.inquiryPurpose}</span>
              </div>
              
              <div className="flex flex-col p-3 border rounded-md bg-secondary/10">
                <span className="text-xs text-muted-foreground mb-1">Timeline</span>
                <div className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-1 text-primary" />
                  <span className="text-sm font-medium">
                    {lead.timeline.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col p-3 border rounded-md bg-secondary/10">
                <span className="text-xs text-muted-foreground mb-1">Lead Source</span>
                <span className="text-sm font-medium capitalize">
                  {lead.leadSource.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{lead.firstName} {lead.lastName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{lead.contactNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{lead.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">
                      Preferred time: {lead.preferredContactTime.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Property Requirements</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm capitalize">
                      {lead.propertyType.replace(/_/g, ' ')} ({lead.bedrooms}B/{lead.bathrooms}B)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{lead.locationPreference}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">
                      {formatCurrency(lead.budgetRange[0])} - {formatCurrency(lead.budgetRange[1])}
                    </span>
                  </div>
                  {lead.amenities && lead.amenities.length > 0 && (
                    <div className="flex items-start">
                      <ClipboardList className="h-4 w-4 mr-2 text-primary mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {lead.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {lead.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-sm bg-secondary/10 p-3 rounded-md">{lead.notes}</p>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="glass-card overflow-hidden mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Lead Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Update Stage</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant={lead.stage === 'new' ? 'default' : 'outline'}
                        onClick={() => handleStageUpdate('new')}
                        className="h-8 text-xs"
                      >
                        New
                      </Button>
                      <Button 
                        size="sm" 
                        variant={lead.stage === 'contacted' ? 'default' : 'outline'}
                        onClick={() => handleStageUpdate('contacted')}
                        className="h-8 text-xs"
                      >
                        Contacted
                      </Button>
                      <Button 
                        size="sm" 
                        variant={lead.stage === 'qualified' ? 'default' : 'outline'}
                        onClick={() => handleStageUpdate('qualified')}
                        className="h-8 text-xs"
                      >
                        Qualified
                      </Button>
                      <Button 
                        size="sm" 
                        variant={lead.stage === 'proposal' ? 'default' : 'outline'}
                        onClick={() => handleStageUpdate('proposal')}
                        className="h-8 text-xs"
                      >
                        Proposal
                      </Button>
                      <Button 
                        size="sm" 
                        variant={lead.stage === 'negotiation' ? 'default' : 'outline'}
                        onClick={() => handleStageUpdate('negotiation')}
                        className="h-8 text-xs"
                      >
                        Negotiation
                      </Button>
                      <Button 
                        size="sm" 
                        variant={lead.stage === 'closed' ? 'default' : 'outline'}
                        onClick={() => handleStageUpdate('closed')}
                        className="h-8 text-xs"
                      >
                        Closed
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <AssignLeadForm onAssign={handleAssign} currentAssignee={lead.assignedTo} />
                </div>
              </CardContent>
            </Card>
            
            <TaskReminder lead={lead} onAddTask={handleAddTask} onTaskComplete={handleTaskComplete} />
          </div>
        </div>
        
        <div className="mt-6">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
              <TabsTrigger value="conversion">Conversion Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="mt-6">
              <LeadTimeline lead={lead} />
            </TabsContent>
            <TabsContent value="conversion" className="mt-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2" />
                    Conversion Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Detailed conversion analytics coming soon
                    </p>
                    <span className="text-sm">
                      Current stage: <Badge className="ml-1 capitalize">{lead.stage || 'new'}</Badge>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default LeadDetails;
