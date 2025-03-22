
import React, { useState } from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, BarChart3 } from 'lucide-react';
import AssignmentDashboard from '@/components/AssignmentDashboard';
import ConversionDashboard from '@/components/ConversionDashboard';

const LeadsOverview = () => {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="container-custom pt-28 md:pt-32">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="leads">All Leads</TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center">
              <UserCog className="h-4 w-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="conversions" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Conversions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="leads">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="assignments">
            <AssignmentDashboard />
          </TabsContent>
          
          <TabsContent value="conversions">
            <ConversionDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LeadsOverview;
