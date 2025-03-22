
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ArrowRight, 
  UserCheck, 
  CheckCircle2,
  PieChart,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  inquiryPurpose: string;
  leadSource: string;
  propertyType: string;
  stage?: string;
  assignedTo?: string;
}

const ConversionDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversionStats, setConversionStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    closed: 0
  });
  const [conversionRate, setConversionRate] = useState(0);
  const [leadsBySource, setLeadsBySource] = useState<Record<string, number>>({});
  const [leadsByPurpose, setLeadsByPurpose] = useState<Record<string, number>>({});
  const [leadsByProperty, setLeadsByProperty] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Fetch leads from localStorage
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      const parsedLeads: Lead[] = JSON.parse(storedLeads);
      setLeads(parsedLeads);
      
      // Calculate conversion stats
      const stats = {
        total: parsedLeads.length,
        new: 0,
        contacted: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        closed: 0
      };
      
      const sourceMap: Record<string, number> = {};
      const purposeMap: Record<string, number> = {};
      const propertyMap: Record<string, number> = {};
      
      parsedLeads.forEach(lead => {
        // Count by stage
        const stage = lead.stage || 'new';
        if (stage in stats) {
          stats[stage as keyof typeof stats]++;
        }
        
        // Count by source
        const source = lead.leadSource;
        sourceMap[source] = (sourceMap[source] || 0) + 1;
        
        // Count by purpose
        const purpose = lead.inquiryPurpose;
        purposeMap[purpose] = (purposeMap[purpose] || 0) + 1;
        
        // Count by property type
        const property = lead.propertyType;
        propertyMap[property] = (propertyMap[property] || 0) + 1;
      });
      
      setConversionStats(stats);
      setLeadsBySource(sourceMap);
      setLeadsByPurpose(purposeMap);
      setLeadsByProperty(propertyMap);
      
      // Calculate conversion rate (closed / total)
      if (parsedLeads.length > 0) {
        const closedLeads = parsedLeads.filter(lead => lead.stage === 'closed').length;
        setConversionRate(Math.round((closedLeads / parsedLeads.length) * 100));
      }
    }
  }, []);

  const getStagePercentage = (stage: keyof typeof conversionStats) => {
    return conversionStats.total > 0 
      ? Math.round((conversionStats[stage] / conversionStats.total) * 100) 
      : 0;
  };
  
  const getTopSource = () => {
    let topSource = '';
    let maxCount = 0;
    
    Object.entries(leadsBySource).forEach(([source, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topSource = source;
      }
    });
    
    return {
      source: topSource.replace(/_/g, ' '),
      count: maxCount,
      percentage: conversionStats.total > 0 
        ? Math.round((maxCount / conversionStats.total) * 100) 
        : 0
    };
  };
  
  const topSource = getTopSource();

  return (
    <div className="w-full">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lead Conversion Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your lead conversion journey and analyze performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-primary" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mt-2">{conversionStats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Across all stages and sources
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mt-2">{conversionRate}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              Of leads reaching closed stage
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-primary" />
              Top Lead Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold mt-2 capitalize">{topSource.source}</div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {topSource.count} leads ({topSource.percentage}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span>New Leads</span>
                  </div>
                  <span className="text-sm font-medium">
                    {conversionStats.new} ({getStagePercentage('new')}%)
                  </span>
                </div>
                <Progress value={getStagePercentage('new')} className="h-2" />
              </div>
              
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>Contacted</span>
                  </div>
                  <span className="text-sm font-medium">
                    {conversionStats.contacted} ({getStagePercentage('contacted')}%)
                  </span>
                </div>
                <Progress value={getStagePercentage('contacted')} className="h-2 bg-blue-100" />
              </div>
              
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span>Qualified</span>
                  </div>
                  <span className="text-sm font-medium">
                    {conversionStats.qualified} ({getStagePercentage('qualified')}%)
                  </span>
                </div>
                <Progress value={getStagePercentage('qualified')} className="h-2 bg-amber-100" />
              </div>
              
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <span>Proposal</span>
                  </div>
                  <span className="text-sm font-medium">
                    {conversionStats.proposal} ({getStagePercentage('proposal')}%)
                  </span>
                </div>
                <Progress value={getStagePercentage('proposal')} className="h-2 bg-indigo-100" />
              </div>
              
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span>Negotiation</span>
                  </div>
                  <span className="text-sm font-medium">
                    {conversionStats.negotiation} ({getStagePercentage('negotiation')}%)
                  </span>
                </div>
                <Progress value={getStagePercentage('negotiation')} className="h-2 bg-purple-100" />
              </div>
              
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Closed</span>
                  </div>
                  <span className="text-sm font-medium">
                    {conversionStats.closed} ({getStagePercentage('closed')}%)
                  </span>
                </div>
                <Progress value={getStagePercentage('closed')} className="h-2 bg-green-100" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadsBySource).length > 0 ? (
                Object.entries(leadsBySource)
                  .sort(([, countA], [, countB]) => countB - countA)
                  .map(([source, count]) => {
                    const percentage = Math.round((count / conversionStats.total) * 100);
                    return (
                      <div key={source} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {source.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Leads by Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadsByPurpose).length > 0 ? (
                Object.entries(leadsByPurpose)
                  .sort(([, countA], [, countB]) => countB - countA)
                  .map(([purpose, count]) => {
                    const percentage = Math.round((count / conversionStats.total) * 100);
                    let color = '';
                    switch (purpose) {
                      case 'buy': color = 'bg-blue-100'; break;
                      case 'rent': color = 'bg-green-100'; break;
                      case 'investment': color = 'bg-purple-100'; break;
                      default: color = 'bg-gray-100';
                    }
                    
                    return (
                      <div key={purpose} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {purpose.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className={`h-2 ${color}`} />
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Leads by Property Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadsByProperty).length > 0 ? (
                Object.entries(leadsByProperty)
                  .sort(([, countA], [, countB]) => countB - countA)
                  .map(([property, count]) => {
                    const percentage = Math.round((count / conversionStats.total) * 100);
                    return (
                      <div key={property} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {property.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversionDashboard;
