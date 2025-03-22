
import React, { useState } from 'react';
import { Bell, CheckCircle2, Calendar, Clock, Plus, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

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

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  tasks?: Task[];
  assignedTo?: string;
}

interface TaskReminderProps {
  lead: Lead;
  onAddTask: (task: Omit<Task, 'id' | 'leadId' | 'createdAt'>) => void;
  onTaskComplete: (taskId: string, completed: boolean) => void;
}

const TaskReminder: React.FC<TaskReminderProps> = ({ lead, onAddTask, onTaskComplete }) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!dueDate) {
      toast({
        title: "Error",
        description: "Due date is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!assignedTo.trim()) {
      toast({
        title: "Error",
        description: "Task assignee is required",
        variant: "destructive",
      });
      return;
    }
    
    onAddTask({
      title,
      description,
      dueDate: dueDate.toISOString(),
      completed: false,
      assignedTo,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setShowTaskForm(false);
    
    toast({
      title: "Task added",
      description: "New task has been added successfully",
    });
  };

  const sortedTasks = lead.tasks ? 
    [...lead.tasks].sort((a, b) => {
      // Sort by completed (incomplete first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then by due date (earliest first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }) : 
    [];

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Bell className="mr-2 h-5 w-5" />
          Follow-up Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showTaskForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="task-title" className="text-sm font-medium block mb-1">
                Task Title
              </label>
              <Input
                id="task-title"
                placeholder="e.g., Call to discuss property options"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="task-description" className="text-sm font-medium block mb-1">
                Description (Optional)
              </label>
              <Textarea
                id="task-description"
                placeholder="Add task details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            <div>
              <label htmlFor="task-due-date" className="text-sm font-medium block mb-1">
                Due Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label htmlFor="task-assigned-to" className="text-sm font-medium block mb-1">
                Assigned To
              </label>
              <Input
                id="task-assigned-to"
                placeholder="Enter name of assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Button type="submit">Add Task</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowTaskForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <Button 
              className="w-full mb-4"
              onClick={() => setShowTaskForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
            
            {sortedTasks.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {sortedTasks.map((task) => {
                  const isPastDue = !task.completed && isPast(parseISO(task.dueDate));
                  
                  return (
                    <div 
                      key={task.id}
                      className={`p-3 border rounded-md ${
                        task.completed 
                          ? 'bg-secondary/10 opacity-70' 
                          : isPastDue 
                            ? 'bg-destructive/10 border-destructive/30'
                            : 'bg-secondary/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <button
                              onClick={() => onTaskComplete(task.id, !task.completed)}
                              className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                task.completed 
                                  ? 'bg-primary border-primary text-primary-foreground' 
                                  : isPastDue 
                                    ? 'border-destructive text-destructive' 
                                    : 'border-primary/50'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="h-4 w-4" />}
                              {!task.completed && isPastDue && <AlertCircle className="h-4 w-4" />}
                            </button>
                            <span className={`ml-2 text-sm font-medium ${
                              task.completed ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {task.title}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="ml-7 mt-1 text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between ml-7 mt-2">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className={`text-xs ${
                            isPastDue ? 'text-destructive font-medium' : 'text-muted-foreground'
                          }`}>
                            {isPastDue 
                              ? `Overdue by ${formatDistanceToNow(parseISO(task.dueDate))}`
                              : `Due ${formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}`
                            }
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {task.assignedTo}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                <p className="text-muted-foreground">No tasks created yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add tasks to follow up with this lead
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskReminder;
