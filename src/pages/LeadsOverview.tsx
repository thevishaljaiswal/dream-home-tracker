
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';

const LeadsOverview = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="container-custom pt-28 md:pt-32">
        <Dashboard />
      </main>
    </div>
  );
};

export default LeadsOverview;
