
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";

// Define the form schema
const formSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  contactNumber: z.string().min(10, "Phone number must be at least 10 digits."),
  email: z.string().email("Please enter a valid email address."),
  preferredContactMethod: z.enum(["email", "phone", "sms", "whatsapp"]),
  
  // Property Preferences
  propertyType: z.enum(["apartment", "villa", "plot", "penthouse", "commercial", "other"]),
  budgetRange: z.array(z.number()).length(2),
  locationPreference: z.string().min(1, "Location is required."),
  bedrooms: z.string(),
  bathrooms: z.string(),
  amenities: z.array(z.string()).optional(),
  
  // Additional Details
  leadSource: z.enum([
    "website", 
    "social_media", 
    "real_estate_portal", 
    "walk_in", 
    "call_center", 
    "email_marketing", 
    "chatbot", 
    "referral",
    "other"
  ]),
  inquiryPurpose: z.enum(["buy", "rent", "investment", "other"]),
  timeline: z.enum(["immediate", "1_3_months", "3_6_months", "6_plus_months", "not_sure"]),
  preferredContactTime: z.enum(["morning", "afternoon", "evening", "anytime"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LeadForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      email: "",
      preferredContactMethod: "email",
      propertyType: "apartment",
      budgetRange: [500000, 1500000],
      locationPreference: "",
      bedrooms: "2",
      bathrooms: "2",
      amenities: [],
      leadSource: "website",
      inquiryPurpose: "buy",
      timeline: "not_sure",
      preferredContactTime: "anytime",
      notes: ""
    },
  });
  
  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "contactNumber", "email", "preferredContactMethod"];
    } else if (step === 2) {
      fieldsToValidate = ["propertyType", "budgetRange", "locationPreference", "bedrooms", "bathrooms", "amenities"];
    }
    
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the data to your backend API
      console.log("Form submitted:", data);
      
      // For now, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store leads in localStorage for demo purposes
      const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]');
      const newLead = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...data
      };
      localStorage.setItem('leads', JSON.stringify([...existingLeads, newLead]));
      
      toast.success("Lead created successfully", {
        description: "The lead has been added to your database."
      });
      
      navigate('/leads');
    } catch (error) {
      toast.error("Failed to create lead", {
        description: "There was an error saving this lead. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const amenitiesOptions = [
    { id: "swimming_pool", label: "Swimming Pool" },
    { id: "gym", label: "Gym" },
    { id: "parking", label: "Parking" },
    { id: "security", label: "24/7 Security" },
    { id: "garden", label: "Garden" },
    { id: "balcony", label: "Balcony" },
    { id: "elevator", label: "Elevator" },
    { id: "furnished", label: "Furnished" }
  ];
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const stepsTitle = [
    "Personal Information",
    "Property Preferences",
    "Additional Details",
    "Review & Submit"
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {stepsTitle.map((title, idx) => (
            <div 
              key={idx} 
              className={`text-xs md:text-sm font-medium transition-colors ${
                idx + 1 === step ? 'text-primary' : idx + 1 < step ? 'text-primary/70' : 'text-muted-foreground'
              }`}
            >
              {idx + 1}. {title}
            </div>
          ))}
        </div>
        <div className="relative mt-2 h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((step - 1) / (stepsTitle.length - 1)) * 100}%` }}
          />
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
          {step === 1 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide the lead's contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} className="glass-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} className="glass-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" {...field} className="glass-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} className="glass-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="preferredContactMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="email" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Email</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="phone" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Phone</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="sms" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">SMS</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="whatsapp" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">WhatsApp</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  className="btn-primary"
                >
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 2 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Property Preferences</CardTitle>
                <CardDescription>
                  Capture details about the property the lead is interested in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass-input">
                            <SelectValue placeholder="Select a property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="plot">Plot</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="budgetRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={100000}
                            max={5000000}
                            step={50000}
                            value={field.value}
                            onValueChange={field.onChange}
                            className="py-4"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatCurrency(field.value[0])}</span>
                            <span>{formatCurrency(field.value[1])}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Selected range: {formatCurrency(field.value[0])} - {formatCurrency(field.value[1])}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="locationPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Preference</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter preferred location" {...field} className="glass-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="glass-input">
                              <SelectValue placeholder="Select number of bedrooms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5+">5+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="glass-input">
                              <SelectValue placeholder="Select number of bathrooms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5+">5+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Amenities</FormLabel>
                        <FormDescription>
                          Select all amenities that are important to the lead
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {amenitiesOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="amenities"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="btn-ghost"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 3 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Gather more information about the lead's requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="leadSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass-input">
                            <SelectValue placeholder="Select lead source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="website">Website Inquiry</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="real_estate_portal">Real Estate Portal</SelectItem>
                          <SelectItem value="walk_in">Walk-in</SelectItem>
                          <SelectItem value="call_center">Call Center</SelectItem>
                          <SelectItem value="email_marketing">Email Marketing</SelectItem>
                          <SelectItem value="chatbot">Chatbot</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inquiryPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inquiry Purpose</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="buy" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Buy</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="rent" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Rent</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="investment" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Investment</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="other" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Other</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline for Purchase</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass-input">
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="1_3_months">1-3 Months</SelectItem>
                          <SelectItem value="3_6_months">3-6 Months</SelectItem>
                          <SelectItem value="6_plus_months">6+ Months</SelectItem>
                          <SelectItem value="not_sure">Not Sure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredContactTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass-input">
                            <SelectValue placeholder="Select preferred time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                          <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                          <SelectItem value="anytime">Anytime</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes or Additional Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional information about the lead's requirements..."
                          className="glass-input min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include any specific requirements or important details about this lead.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="btn-ghost"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Review <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 4 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>
                  Please review the lead information before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-semibold mb-2 text-primary">Personal Information</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Name:</dt>
                        <dd className="text-sm">{form.getValues("firstName")} {form.getValues("lastName")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Contact:</dt>
                        <dd className="text-sm">{form.getValues("contactNumber")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Email:</dt>
                        <dd className="text-sm">{form.getValues("email")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Preferred Contact:</dt>
                        <dd className="text-sm capitalize">{form.getValues("preferredContactMethod")}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2 text-primary">Property Preferences</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Property Type:</dt>
                        <dd className="text-sm capitalize">{form.getValues("propertyType").replace('_', ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Budget:</dt>
                        <dd className="text-sm">
                          {formatCurrency(form.getValues("budgetRange")[0])} - {formatCurrency(form.getValues("budgetRange")[1])}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Location:</dt>
                        <dd className="text-sm">{form.getValues("locationPreference")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Size:</dt>
                        <dd className="text-sm">{form.getValues("bedrooms")} Bed / {form.getValues("bathrooms")} Bath</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2 text-primary">Additional Details</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Lead Source:</dt>
                        <dd className="text-sm capitalize">{form.getValues("leadSource").replace('_', ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Purpose:</dt>
                        <dd className="text-sm capitalize">{form.getValues("inquiryPurpose")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Timeline:</dt>
                        <dd className="text-sm capitalize">{form.getValues("timeline").replace(/_/g, ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Contact Time:</dt>
                        <dd className="text-sm capitalize">{form.getValues("preferredContactTime").replace(/_/g, ' ')}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2 text-primary">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {form.getValues("amenities")?.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {amenity.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {!form.getValues("amenities")?.length && (
                        <span className="text-sm text-muted-foreground">No amenities selected</span>
                      )}
                    </div>
                    
                    {form.getValues("notes") && (
                      <div className="mt-4">
                        <h3 className="text-md font-semibold mb-2 text-primary">Notes</h3>
                        <p className="text-sm whitespace-pre-line">{form.getValues("notes")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="btn-ghost"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Edit Information
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>Submit Lead <CheckCircle2 className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
