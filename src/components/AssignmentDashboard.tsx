
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserPlus,
  Building2,
  MapPin,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LeadCard from './LeadCard';

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
  assignedTo?: string;
  stage?: string;
}

// In a real application, this would come from an API or database
const dummyAgents = [
  { id: '1', name: 'Sarah Johnson', specialty: 'Residential', location: 'Downtown', activeLeads: 0 },
  { id: '2', name: 'Michael Chen', specialty: 'Commercial', location: 'Midtown', activeLeads: 0 },
  { id: '3', name: 'Jessica Patel', specialty: 'Luxury Homes', location: 'Uptown', activeLeads: 0 },
  { id: '4', name: 'David Rodriguez', specialty: 'Investment', location: 'Suburbs', activeLeads: 0 },
];

const AssignmentDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [unassignedLeads, setUnassignedLeads] = useState<Lead[]>([]);
  const [assignedLeads, setAssignedLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState(dummyAgents);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch leads from localStorage
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      const parsedLeads = JSON.parse(storedLeads);
      setLeads(parsedLeads);
      
      // Split leads into assigned and unassigned
      const assigned = parsedLeads.filter((lead: Lead) => lead.assignedTo);
      const unassigned = parsedLeads.filter((lead: Lead) => !lead.assignedTo);
      
      setAssignedLeads(assigned);
      setUnassignedLeads(unassigned);
      
      // Update agent lead counts
      const updatedAgents = [...agents];
      assigned.forEach((lead: Lead) => {
        if (lead.assignedTo) {
          const agentIndex = updatedAgents.findIndex(agent => agent.name === lead.assignedTo);
          if (agentIndex !== -1) {
            updatedAgents[agentIndex].activeLeads++;
          }
        }
      });
      setAgents(updatedAgents);
    }
  }, []);

  const handleAutoAssign = () => {
    if (unassignedLeads.length === 0) return;
    
    // Simple round-robin assignment
    const updatedLeads = [...leads];
    const updatedAgents = [...agents];
    
    unassignedLeads.forEach((lead, index) => {
      const agentIndex = index % agents.length;
      const leadIndex = updatedLeads.findIndex(l => l.id === lead.id);
      
      if (leadIndex !== -1) {
        updatedLeads[leadIndex].assignedTo = agents[agentIndex].name;
        updatedAgents[agentIndex].activeLeads++;
      }
    });
    
    // Update localStorage
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    
    // Update state
    setLeads(updatedLeads);
    const assigned = updatedLeads.filter((lead: Lead) => lead.assignedTo);
    const unassigned = updatedLeads.filter((lead: Lead) => !lead.assignedTo);
    setAssignedLeads(assigned);
    setUnassignedLeads(unassigned);
    setAgents(updatedAgents);
  };
  
  const handleManualAssign = (leadId: string, agentName: string) => {
    const updatedLeads = [...leads];
    const leadIndex = updatedLeads.findIndex(lead => lead.id === leadId);
    
    if (leadIndex !== -1) {
      updatedLeads[leadIndex].assignedTo = agentName;
      
      // Update localStorage
      localStorage.setItem('leads', JSON.stringify(updatedLeads));
      
      // Update state
      setLeads(updatedLeads);
      const assigned = updatedLeads.filter((lead: Lead) => lead.assignedTo);
      const unassigned = updatedLeads.filter((lead: Lead) => !lead.assignedTo);
      setAssignedLeads(assigned);
      setUnassignedLeads(unassigned);
      
      // Update agent lead counts
      const updatedAgents = [...agents];
      const agentIndex = updatedAgents.findIndex(agent => agent.name === agentName);
      if (agentIndex !== -1) {
        updatedAgents[agentIndex].activeLeads++;
      }
      setAgents(updatedAgents);
    }
  };
  
  const filterUnassignedLeads = () => {
    let filtered = [...unassignedLeads];
    
    // Apply location filter
    if (filterLocation !== 'all') {
      filtered = filtered.filter(lead => 
        lead.locationPreference.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    // Apply property type filter
    if (filterProperty !== 'all') {
      filtered = filtered.filter(lead => lead.propertyType === filterProperty);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.contactNumber.includes(term)
      );
    }
    
    return filtered;
  };
  
  const filteredUnassignedLeads = filterUnassignedLeads();
  
  const getAgentLeads = (agentName: string) => {
    return assignedLeads.filter(lead => lead.assignedTo === agentName);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Assignment</h1>
          <p className="text-muted-foreground mt-1">
            Assign leads to sales representatives and track their performance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => navigate('/capture')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
          <Button 
            onClick={handleAutoAssign} 
            variant="outline"
            disabled={unassignedLeads.length === 0}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Auto-Assign All
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Sales Representatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              {agents.length} agents available for assignment
            </div>
            <div className="space-y-3">
              {agents.map(agent => (
                <div 
                  key={agent.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedAgent === agent.name ? 'bg-primary/10 border-primary' : 'hover:bg-secondary/10'
                  }`}
                  onClick={() => setSelectedAgent(selectedAgent === agent.name ? null : agent.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.specialty}</div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {agent.activeLeads} leads
                    </Badge>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {agent.location}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="col-span-3 space-y-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  Unassigned Leads ({filteredUnassignedLeads.length})
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search leads..."
                      className="pl-9 h-9 glass-input w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger className="w-[130px] h-9">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="downtown">Downtown</SelectItem>
                      <SelectItem value="midtown">Midtown</SelectItem>
                      <SelectItem value="uptown">Uptown</SelectItem>
                      <SelectItem value="suburbs">Suburbs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterProperty} onValueChange={setFilterProperty}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredUnassignedLeads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUnassignedLeads.map(lead => (
                    <div key={lead.id} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{lead.firstName} {lead.lastName}</h3>
                          <div className="text-sm text-muted-foreground">
                            {lead.email}
                          </div>
                        </div>
                        <Badge className="capitalize">
                          {lead.inquiryPurpose}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1 text-primary" />
                          <span className="capitalize">{lead.propertyType.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-primary" />
                          <span>{lead.locationPreference}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/lead/${lead.id}`)}
                          className="text-xs"
                        >
                          View Details
                        </Button>
                        
                        <Select 
                          onValueChange={(value) => handleManualAssign(lead.id, value)}
                          disabled={!agents.length}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map(agent => (
                              <SelectItem key={agent.id} value={agent.name}>
                                {agent.name} ({agent.specialty})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <UserCheck className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">All leads assigned!</h3>
                  <p className="text-muted-foreground mt-1">
                    There are no unassigned leads matching your filters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {selectedAgent && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {selectedAgent}'s Leads ({getAgentLeads(selectedAgent).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getAgentLeads(selectedAgent).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getAgentLeads(selectedAgent).map(lead => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground">
                      No leads assigned to {selectedAgent} yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDashboard;
