
import React, { useState } from 'react';
import { User, Users, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface AssignLeadFormProps {
  onAssign: (assignee: string) => void;
  currentAssignee?: string;
}

// In a real application, this would come from an API or database
const dummyAgents = [
  { id: '1', name: 'Sarah Johnson', specialty: 'Residential', location: 'Downtown' },
  { id: '2', name: 'Michael Chen', specialty: 'Commercial', location: 'Midtown' },
  { id: '3', name: 'Jessica Patel', specialty: 'Luxury Homes', location: 'Uptown' },
  { id: '4', name: 'David Rodriguez', specialty: 'Investment', location: 'Suburbs' },
];

const AssignLeadForm: React.FC<AssignLeadFormProps> = ({ onAssign, currentAssignee }) => {
  const [assignee, setAssignee] = useState(currentAssignee || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleManualAssign = () => {
    if (!assignee.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name to assign this lead",
        variant: "destructive",
      });
      return;
    }
    
    onAssign(assignee);
    setShowSuggestions(false);
    
    toast({
      title: "Lead assigned",
      description: `Lead successfully assigned to ${assignee}`,
    });
  };
  
  const handleSelectAgent = (agentName: string) => {
    setAssignee(agentName);
    onAssign(agentName);
    setShowSuggestions(false);
    
    toast({
      title: "Lead assigned",
      description: `Lead successfully assigned to ${agentName}`,
    });
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Assign Lead</h4>
      
      <div className="space-y-3">
        <div>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter agent name"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="h-9"
            />
            <Button 
              onClick={handleManualAssign}
              size="sm"
              className="h-9"
            >
              Assign
            </Button>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-xs"
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          <Users className="h-3.5 w-3.5 mr-1" />
          {showSuggestions ? 'Hide Suggestions' : 'Show Suggested Agents'}
        </Button>
        
        {showSuggestions && (
          <div className="mt-2 space-y-2">
            {dummyAgents.map((agent) => (
              <div 
                key={agent.id}
                className="p-2 border rounded-md cursor-pointer hover:bg-secondary/10 transition-colors"
                onClick={() => handleSelectAgent(agent.name)}
              >
                <div className="flex items-center">
                  <div className="bg-primary/10 p-1.5 rounded-full mr-2">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{agent.name}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1 ml-8 space-x-4">
                  <span className="flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    {agent.specialty}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {agent.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignLeadForm;
