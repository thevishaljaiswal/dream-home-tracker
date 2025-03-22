
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import Header from '@/components/Header';
import LeadForm from '@/components/LeadForm';
import { Button } from '@/components/ui/button';

const LeadCapture = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="container-custom pt-28 md:pt-32">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Capture New Lead</h1>
          <p className="text-muted-foreground">
            Fill out the form below to add a new real estate lead to your database
          </p>
        </div>
        
        <LeadForm />
      </main>
    </div>
  );
};

export default LeadCapture;
