
import React, { useState, useEffect } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Star, 
  User, 
  Phone, 
  MessageSquare, 
  History,
  CheckCircle2, 
  BarChart4, 
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  isHot?: boolean;
  stage?: string;
  assignedTo?: string;
  assignedDate?: string;
  activities?: Activity[];
  lastContact?: string;
  inquiryPurpose: string;
}

interface Activity {
  id: string;
  leadId: string;
  type: string;
  description: string;
  date: string;
  performedBy?: string;
}

interface TimelineEvent {
  date: string;
  type: string;
  description: string;
  leadId: string;
  leadName: string;
  isHot?: boolean;
}

const TimelineTracker: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'hot' | 'stage_change' | 'assignment'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimelineData = () => {
      setIsLoading(true);
      
      const storedLeads = localStorage.getItem('leads');
      if (!storedLeads) {
        setIsLoading(false);
        return;
      }
      
      const leads: Lead[] = JSON.parse(storedLeads);
      const events: TimelineEvent[] = [];
      
      // Add lead creation events
      leads.forEach(lead => {
        events.push({
          date: lead.createdAt,
          type: 'creation',
          description: `Lead created for ${lead.firstName} ${lead.lastName}`,
          leadId: lead.id,
          leadName: `${lead.firstName} ${lead.lastName}`,
          isHot: lead.isHot || false
        });
        
        // Add assignment events
        if (lead.assignedTo && lead.assignedDate) {
          events.push({
            date: lead.assignedDate,
            type: 'assignment',
            description: `Lead assigned to ${lead.assignedTo}`,
            leadId: lead.id,
            leadName: `${lead.firstName} ${lead.lastName}`,
            isHot: lead.isHot || false
          });
        }
        
        // Add activity events
        if (lead.activities && lead.activities.length > 0) {
          lead.activities.forEach(activity => {
            events.push({
              date: activity.date,
              type: activity.type,
              description: activity.description,
              leadId: lead.id,
              leadName: `${lead.firstName} ${lead.lastName}`,
              isHot: lead.isHot || false
            });
          });
        }
      });
      
      // Sort by date (newest first)
      events.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTimelineEvents(events);
      setIsLoading(false);
    };
    
    fetchTimelineData();
  }, []);
  
  const filteredEvents = filter === 'all' 
    ? timelineEvents 
    : filter === 'hot' 
      ? timelineEvents.filter(event => event.isHot) 
      : timelineEvents.filter(event => event.type === filter);
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'creation':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'assignment':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'stage_change':
        return <ArrowRight className="h-5 w-5 text-primary" />;
      case 'contact':
        return <Phone className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-amber-500" />;
      case 'task_completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <History className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Calendar className="h-5 w-5 mr-2" />
          Timeline Tracker
        </CardTitle>
        <CardDescription>
          Track all activities and events across your leads
        </CardDescription>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            All Events
          </Button>
          <Button 
            variant={filter === 'hot' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('hot')}
            className="text-xs"
          >
            <Star className="h-4 w-4 mr-1" />
            Hot Leads
          </Button>
          <Button 
            variant={filter === 'stage_change' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('stage_change')}
            className="text-xs"
          >
            <BarChart4 className="h-4 w-4 mr-1" />
            Stage Changes
          </Button>
          <Button 
            variant={filter === 'assignment' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('assignment')}
            className="text-xs"
          >
            <User className="h-4 w-4 mr-1" />
            Assignments
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading timeline data...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <History className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
            {filter === 'all' ? (
              <>
                <h3 className="text-lg font-medium">No timeline events</h3>
                <p className="text-muted-foreground text-center mt-1 mb-4">
                  Add leads and interact with them to generate timeline events
                </p>
                <Button onClick={() => navigate('/capture')}>
                  Add Your First Lead
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium">No matching events</h3>
                <p className="text-muted-foreground text-center mt-1">
                  Try selecting a different filter
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-primary/20" />
            
            <div className="space-y-6">
              {filteredEvents.map((event, index) => {
                const eventDate = parseISO(event.date);
                const today = new Date();
                const daysAgo = differenceInDays(today, eventDate);
                
                return (
                  <div key={index} className="relative pl-14">
                    {/* Dot on timeline */}
                    <div className="absolute left-0 p-1.5 bg-background rounded-full border-2 border-primary/20">
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="bg-secondary/5 p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm flex items-center">
                          {event.leadName}
                          {event.isHot && (
                            <Star className="h-4 w-4 ml-1 fill-current text-amber-500" />
                          )}
                        </h4>
                        
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 text-xs">
                            {daysAgo === 0 
                              ? 'Today' 
                              : daysAgo === 1 
                                ? 'Yesterday' 
                                : `${daysAgo} days ago`}
                          </Badge>
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground ml-1">
                            {format(eventDate, 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm">{event.description}</p>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-muted-foreground">
                          {format(eventDate, 'MMMM d, yyyy')}
                        </span>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => navigate(`/lead/${event.leadId}`)}
                        >
                          View Lead
                        </Button>
                      </div>
                    </div>

                    {/* Add separator between days */}
                    {index < filteredEvents.length - 1 && 
                      differenceInDays(
                        parseISO(event.date), 
                        parseISO(filteredEvents[index + 1].date)
                      ) >= 1 && (
                        <div className="flex items-center my-4 pl-0">
                          <Badge variant="outline" className="text-xs ml-0 bg-background z-10">
                            {format(parseISO(event.date), 'MMMM d, yyyy')}
                          </Badge>
                          <Separator className="ml-2 flex-grow" />
                        </div>
                      )
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineTracker;
