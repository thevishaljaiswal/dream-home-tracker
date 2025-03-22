
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Home, Building2, Users, ListFilter, Clock, Search, Star, Bell, Calendar, Flag } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LeadCard from './LeadCard';
import { toast } from '@/hooks/use-toast';
import { isPast, parseISO, isToday, isTomorrow, addDays } from 'date-fns';

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
  isHot?: boolean;
  assignedTo?: string;
  stage?: string;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    completed: boolean;
    assignedTo: string;
    createdAt: string;
  }>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    purpose: 'all',
    propertyType: 'all',
    timeline: 'all',
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Fetch leads from localStorage
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      const parsedLeads = JSON.parse(storedLeads);
      // Initialize isHot property if not present
      const updatedLeads = parsedLeads.map((lead: Lead) => ({
        ...lead,
        isHot: lead.isHot !== undefined ? lead.isHot : false,
        stage: lead.stage || 'new',
        tasks: lead.tasks || []
      }));
      
      setLeads(updatedLeads);
      setFilteredLeads(updatedLeads);
      
      // Update localStorage with the updated leads
      localStorage.setItem('leads', JSON.stringify(updatedLeads));
    }
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...leads];
    
    // Apply tab filtering
    if (activeTab === 'hot') {
      result = result.filter(lead => lead.isHot === true);
    } else if (activeTab === 'follow-up') {
      const today = new Date();
      result = result.filter(lead => {
        if (!lead.tasks || lead.tasks.length === 0) return false;
        return lead.tasks.some(task => 
          !task.completed && 
          (isToday(parseISO(task.dueDate)) || isTomorrow(parseISO(task.dueDate)))
        );
      });
    } else if (activeTab === 'recent') {
      // Show leads from the last 3 days
      const threeDaysAgo = addDays(new Date(), -3);
      result = result.filter(lead => 
        new Date(lead.createdAt) >= threeDaysAgo
      );
    }
    
    // Apply filters
    if (filters.purpose !== 'all') {
      result = result.filter(lead => lead.inquiryPurpose === filters.purpose);
    }
    
    if (filters.propertyType !== 'all') {
      result = result.filter(lead => lead.propertyType === filters.propertyType);
    }
    
    if (filters.timeline !== 'all') {
      result = result.filter(lead => lead.timeline === filters.timeline);
    }
    
    // Apply search
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(lead => {
        return (
          `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(lowercasedTerm) ||
          lead.email.toLowerCase().includes(lowercasedTerm) ||
          lead.contactNumber.includes(searchTerm) ||
          lead.locationPreference.toLowerCase().includes(lowercasedTerm)
        );
      });
    }
    
    setFilteredLeads(result);
  }, [leads, filters, searchTerm, activeTab]);

  const getInquiryStats = () => {
    const stats = {
      buy: leads.filter(lead => lead.inquiryPurpose === 'buy').length,
      rent: leads.filter(lead => lead.inquiryPurpose === 'rent').length,
      investment: leads.filter(lead => lead.inquiryPurpose === 'investment').length,
      other: leads.filter(lead => lead.inquiryPurpose === 'other').length,
    };
    return stats;
  };
  
  const getPropertyTypeStats = () => {
    return leads.reduce((acc, lead) => {
      acc[lead.propertyType] = (acc[lead.propertyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const toggleHotLead = (leadId: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const newIsHot = !lead.isHot;
        
        // Show a toast notification - fix the variant to use "default" instead of "secondary"
        toast({
          title: newIsHot ? "Lead marked as hot" : "Lead unmarked as hot",
          description: `${lead.firstName} ${lead.lastName} has been ${newIsHot ? "marked as a hot lead" : "removed from hot leads"}`,
          variant: newIsHot ? "default" : "default", // Changed from "secondary" to "default"
        });
        
        return { ...lead, isHot: newIsHot };
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
  };

  const getUpcomingFollowUps = () => {
    const followUps = leads.flatMap(lead => {
      if (!lead.tasks) return [];
      
      return lead.tasks
        .filter(task => !task.completed && !isPast(parseISO(task.dueDate)))
        .map(task => ({
          leadId: lead.id,
          leadName: `${lead.firstName} ${lead.lastName}`,
          ...task
        }));
    });
    
    // Sort by due date (earliest first)
    return followUps.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    ).slice(0, 5); // Show only the next 5 follow-ups
  };

  const stats = getInquiryStats();
  const propertyStats = getPropertyTypeStats();
  const upcomingFollowUps = getUpcomingFollowUps();
  const hotLeadsCount = leads.filter(lead => lead.isHot).length;
  const followUpsCount = leads.filter(lead => 
    lead.tasks && lead.tasks.some(task => !task.completed)
  ).length;

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your real estate leads
          </p>
        </div>
        
        <Button onClick={() => navigate('/capture')} className="btn-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <h2 className="text-3xl font-bold mt-1">{leads.length}</h2>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Buying</p>
              <h2 className="text-3xl font-bold mt-1">{stats.buy}</h2>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Home className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hot Leads</p>
              <h2 className="text-3xl font-bold mt-1">{hotLeadsCount}</h2>
            </div>
            <div className="p-2 bg-red-50 rounded-full">
              <Star className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Follow-ups</p>
              <h2 className="text-3xl font-bold mt-1">{followUpsCount}</h2>
            </div>
            <div className="p-2 bg-amber-50 rounded-full">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <TabsList className="grid w-full md:w-auto grid-cols-4 bg-secondary/70">
            <TabsTrigger value="all" className="text-xs md:text-sm">All Leads</TabsTrigger>
            <TabsTrigger value="recent" className="text-xs md:text-sm">Recent</TabsTrigger>
            <TabsTrigger value="hot" className="text-xs md:text-sm">Hot Leads</TabsTrigger>
            <TabsTrigger value="follow-up" className="text-xs md:text-sm">Follow-ups</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search leads..."
                className="pl-9 glass-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Select
            value={filters.purpose}
            onValueChange={(value) => setFilters({ ...filters, purpose: value })}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Purposes</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.propertyType}
            onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
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
          
          <Select
            value={filters.timeline}
            onValueChange={(value) => setFilters({ ...filters, timeline: value })}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timelines</SelectItem>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="1_3_months">1-3 Months</SelectItem>
              <SelectItem value="3_6_months">3-6 Months</SelectItem>
              <SelectItem value="6_plus_months">6+ Months</SelectItem>
            </SelectContent>
          </Select>
          
          {(filters.purpose !== 'all' || filters.propertyType !== 'all' || filters.timeline !== 'all' || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => {
                setFilters({ purpose: 'all', propertyType: 'all', timeline: 'all' });
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        <TabsContent value="all" className="mt-0">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 glass-card rounded-lg">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">No leads found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                {leads.length === 0
                  ? "You don't have any leads yet. Add your first lead to get started."
                  : "No leads match your current filters. Try adjusting your search criteria."}
              </p>
              <Button 
                onClick={() => navigate('/capture')} 
                className="btn-primary"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Lead
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {filteredLeads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={{
                    ...lead,
                    isHot: lead.isHot || false
                  }}
                  onHotToggle={() => toggleHotLead(lead.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 glass-card rounded-lg">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No recent leads</h3>
              <p className="text-muted-foreground mt-1">No leads added in the last 3 days</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {filteredLeads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={{
                    ...lead,
                    isHot: lead.isHot || false
                  }}
                  onHotToggle={() => toggleHotLead(lead.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="hot" className="mt-0">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 glass-card rounded-lg">
              <Star className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium">No hot leads</h3>
              <p className="text-muted-foreground mt-1">
                Mark leads as hot to see them here. Hot leads are high-priority prospects 
                that require immediate attention.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {filteredLeads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={{
                    ...lead,
                    isHot: lead.isHot || false
                  }}
                  onHotToggle={() => toggleHotLead(lead.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="follow-up" className="mt-0">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 glass-card rounded-lg">
              <Bell className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium">No follow-ups</h3>
              <p className="text-muted-foreground mt-1 text-center max-w-md">
                Leads with upcoming tasks will appear here.<br />
                Add tasks to leads to schedule follow-ups.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {filteredLeads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={{
                    ...lead,
                    isHot: lead.isHot || false
                  }}
                  onHotToggle={() => toggleHotLead(lead.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {upcomingFollowUps.length > 0 && (
        <div className="glass-card rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Upcoming Follow-ups
          </h3>
          <div className="space-y-3">
            {upcomingFollowUps.map((followUp) => (
              <div key={followUp.id} className="flex items-start p-3 border rounded-md bg-secondary/5">
                <div className="mr-3 mt-0.5">
                  {isToday(parseISO(followUp.dueDate)) ? (
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Flag className="h-4 w-4 text-red-500" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-amber-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{followUp.title}</h4>
                    <Badge variant="outline" className={`text-xs ${
                      isToday(parseISO(followUp.dueDate)) ? 'bg-red-50 text-red-600' : ''
                    }`}>
                      {isToday(parseISO(followUp.dueDate)) 
                        ? 'Today' 
                        : isTomorrow(parseISO(followUp.dueDate))
                          ? 'Tomorrow'
                          : new Date(followUp.dueDate).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    For: {followUp.leadName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Assigned to: {followUp.assignedTo}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs" 
                      onClick={() => navigate(`/lead/${followUp.leadId}`)}
                    >
                      View Lead
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {leads.length > 0 && (
        <div className="glass-card rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Leads by Property Type</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(propertyStats).map(([type, count]) => (
              <Badge 
                key={type} 
                variant="outline" 
                className="flex items-center gap-1 py-1.5"
              >
                <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium ml-1">
                  {count}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
