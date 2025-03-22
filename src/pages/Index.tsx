
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building, Users, Home, PieChart, Clock, UserPlus } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => {
      observer.observe(section);
    });
    
    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center pt-28 pb-20 md:pt-40 md:pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent" />
        
        <div className="container-custom max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 mb-6 text-sm font-medium bg-background/80 backdrop-blur-sm animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Streamlining Real Estate Lead Management
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Capture, Track, and <span className="text-primary">Convert</span> Real Estate Leads
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A modern, intuitive platform designed for real estate professionals to efficiently manage leads and turn opportunities into sales.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              onClick={() => navigate('/capture')} 
              size="lg" 
              className="btn-primary min-w-[180px]"
            >
              Add New Lead
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={scrollToFeatures}
              className="btn-ghost min-w-[180px]"
            >
              Explore Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-12 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-center md:justify-end">
              <span className="inline-block rounded-full bg-background border border-border shadow-sm px-4 py-1.5 text-sm">
                Streamlined Lead Capture
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="inline-block rounded-full bg-background border border-border shadow-sm px-4 py-1.5 text-sm">
                Intuitive Dashboard
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <span className="inline-block rounded-full bg-background border border-border shadow-sm px-4 py-1.5 text-sm">
                Detailed Lead Profiles
              </span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-accent/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4 fade-in-section">
              Powerful Features for Real Estate Professionals
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto fade-in-section">
              Everything you need to manage leads efficiently and grow your real estate business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border border-border/50 fade-in-section">
              <CardHeader>
                <div className="p-2 w-10 h-10 rounded-full bg-primary/10 mb-3">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Comprehensive Lead Forms</CardTitle>
                <CardDescription>
                  Capture all essential lead information with our structured forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Collect personal details, property preferences, budget requirements, and more in one place. Our forms ensure no critical information is missed.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="text-primary px-0"
                  onClick={() => navigate('/capture')}
                >
                  Try it now <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="glass-card border border-border/50 fade-in-section" style={{ transitionDelay: '0.1s' }}>
              <CardHeader>
                <div className="p-2 w-10 h-10 rounded-full bg-primary/10 mb-3">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Visual Dashboard</CardTitle>
                <CardDescription>
                  Get a clear overview of all your leads and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track lead sources, inquiry types, and property preferences with our intuitive dashboard. Filter and search to find the information you need quickly.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="text-primary px-0"
                  onClick={() => navigate('/leads')}
                >
                  View dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="glass-card border border-border/50 fade-in-section" style={{ transitionDelay: '0.2s' }}>
              <CardHeader>
                <div className="p-2 w-10 h-10 rounded-full bg-primary/10 mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Timeline Tracking</CardTitle>
                <CardDescription>
                  Follow your leads' journey from first contact to closing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Keep track of each lead's timeline preferences and history. Set reminders for follow-ups and never miss an opportunity to connect.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="text-primary px-0">
                  Coming soon <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Demo Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4 fade-in-section">
              Try Our Lead Management System
            </h2>
            <p className="text-muted-foreground mb-6 fade-in-section">
              Experience how easy it is to capture and manage real estate leads with our intuitive system
            </p>
          </div>
          
          <div className="fade-in-section">
            <Tabs defaultValue="capture" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="capture">Capture Leads</TabsTrigger>
                <TabsTrigger value="manage">Manage Leads</TabsTrigger>
              </TabsList>
              <TabsContent value="capture" className="mt-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2">
                    <h3 className="text-2xl font-semibold mb-3">Quick and Comprehensive Forms</h3>
                    <p className="text-muted-foreground mb-4">
                      Our lead capture system is designed to gather all the information you need from potential clients, without overwhelming them.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">Property preferences and requirements</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">Personal and contact information</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Home className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">Budget range and timeline details</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => navigate('/capture')} 
                      className="btn-primary mt-6"
                    >
                      Try Lead Capture
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="md:w-1/2 p-6 glass-card rounded-lg flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                      <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h4 className="text-lg font-medium mb-2">Start Adding Leads</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use our intelligent form to collect all the information you need
                      </p>
                      <Button 
                        onClick={() => navigate('/capture')} 
                        variant="outline"
                      >
                        Add New Lead
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="manage" className="mt-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2">
                    <h3 className="text-2xl font-semibold mb-3">Intuitive Lead Management</h3>
                    <p className="text-muted-foreground mb-4">
                      View, filter, and analyze all your leads from a centralized dashboard designed for real estate professionals.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <PieChart className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">Visual analytics and metrics</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">Timeline tracking and sorting</span>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">Lead categorization and prioritization</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => navigate('/leads')} 
                      className="btn-primary mt-6"
                    >
                      View Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="md:w-1/2 p-6 glass-card rounded-lg flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h4 className="text-lg font-medium mb-2">Track Your Performance</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        See all your leads and their status in one dashboard
                      </p>
                      <Button 
                        onClick={() => navigate('/leads')} 
                        variant="outline"
                      >
                        Open Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container-custom text-center">
          <div className="max-w-2xl mx-auto fade-in-section">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Transform Your Lead Management?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start capturing and managing leads more efficiently today with our intuitive real estate lead management system.
            </p>
            <Button 
              onClick={() => navigate('/capture')} 
              size="lg" 
              className="btn-primary"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
