
import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ClipboardCheck, 
  MessageSquare, 
  User, 
  Bell, 
  ArrowRight 
} from 'lucide-react';

interface Activity {
  id: string;
  leadId: string;
  type: string;
  description: string;
  date: string;
  performedBy?: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  assignedTo?: string;
  assignedDate?: string;
  stage?: string;
  tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate: string;
    createdAt: string;
  }>;
  activities?: Activity[];
}

const LeadTimeline: React.FC<{ lead: Lead }> = ({ lead }) => {
  // Combine lead creation, task events, and activities into a single timeline
  const createTimelineEvents = () => {
    const events = [];
    
    // Add lead creation event
    events.push({
      id: 'lead-creation',
      type: 'creation',
      description: `Lead created`,
      date: lead.createdAt,
    });
    
    // Add lead assignment event if available
    if (lead.assignedTo && lead.assignedDate) {
      events.push({
        id: 'lead-assignment',
        type: 'assignment',
        description: `Lead assigned to ${lead.assignedTo}`,
        date: lead.assignedDate,
      });
    }
    
    // Add task events
    if (lead.tasks) {
      lead.tasks.forEach(task => {
        // Task creation
        events.push({
          id: `task-creation-${task.id}`,
          type: 'task_created',
          description: `Task created: ${task.title}`,
          date: task.createdAt,
        });
        
        // Task completion (if completed)
        if (task.completed) {
          events.push({
            id: `task-completion-${task.id}`,
            type: 'task_completed',
            description: `Task completed: ${task.title}`,
            // Since we don't have a completedAt field, we'll just use a placeholder
            date: new Date().toISOString(),
          });
        }
      });
    }
    
    // Add any other activities
    if (lead.activities) {
      events.push(...lead.activities);
    }
    
    // Sort by date (newest first)
    return events.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };
  
  const timelineEvents = createTimelineEvents();
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'creation':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'assignment':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'task_created':
        return <Bell className="h-5 w-5 text-amber-500" />;
      case 'task_completed':
        return <ClipboardCheck className="h-5 w-5 text-green-500" />;
      case 'stage_change':
        return <ArrowRight className="h-5 w-5 text-primary" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Activity Timeline</h3>
      
      {timelineEvents.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-primary/20" />
          
          <div className="space-y-6">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative pl-14">
                {/* Dot on timeline */}
                <div className="absolute left-0 p-1.5 bg-background rounded-full border-2 border-primary/20">
                  {getActivityIcon(event.type)}
                </div>
                
                <div className="mb-1">
                  <p className="text-sm">{event.description}</p>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                      {' · '}
                      {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                    </p>
                    
                    {event.performedBy && (
                      <span className="text-xs text-muted-foreground ml-2">
                        by {event.performedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No activity recorded yet</p>
        </div>
      )}
    </div>
  );
};

export default LeadTimeline;
