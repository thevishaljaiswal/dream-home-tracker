
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Home, Building2, Users, ListFilter, Clock, Search } from 'lucide-react';

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

  useEffect(() => {
    // Fetch leads from localStorage
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      const parsedLeads = JSON.parse(storedLeads);
      setLeads(parsedLeads);
      setFilteredLeads(parsedLeads);
    }
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...leads];
    
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
  }, [leads, filters, searchTerm]);

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

  const stats = getInquiryStats();
  const propertyStats = getPropertyTypeStats();

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
              <p className="text-sm font-medium text-muted-foreground">Renting</p>
              <h2 className="text-3xl font-bold mt-1">{stats.rent}</h2>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <Building2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Investment</p>
              <h2 className="text-3xl font-bold mt-1">{stats.investment}</h2>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Building2 className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
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
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 glass-card rounded-lg">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No recent leads</h3>
              <p className="text-muted-foreground mt-1">Add your first lead to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {leads
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 6)
                .map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="hot" className="mt-0">
          <div className="flex flex-col items-center justify-center py-16 glass-card rounded-lg">
            <h3 className="text-lg font-medium">Hot leads feature coming soon</h3>
            <p className="text-muted-foreground mt-1">Priority lead tracking will be available in the next update</p>
          </div>
        </TabsContent>
        
        <TabsContent value="follow-up" className="mt-0">
          <div className="flex flex-col items-center justify-center py-16 glass-card rounded-lg">
            <h3 className="text-lg font-medium">Follow-ups feature coming soon</h3>
            <p className="text-muted-foreground mt-1">Lead follow-up scheduling will be available in the next update</p>
          </div>
        </TabsContent>
      </Tabs>
      
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
