
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Phone, Mail, MapPin, Clock, CalendarClock, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LeadCardProps {
  lead: {
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
    stage?: string;
    assignedTo?: string;
    isHot?: boolean;
  };
  onHotToggle: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onHotToggle }) => {
  const navigate = useNavigate();
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Get a color based on inquiry purpose
  const getInquiryColor = (purpose: string) => {
    switch (purpose) {
      case 'buy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'rent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'investment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Convert timeline to human-readable format
  const getTimelineText = (timeline: string) => {
    switch (timeline) {
      case 'immediate':
        return 'Immediate';
      case '1_3_months':
        return '1-3 Months';
      case '3_6_months':
        return '3-6 Months';
      case '6_plus_months':
        return '6+ Months';
      case 'not_sure':
        return 'Not Sure';
      default:
        return timeline.replace(/_/g, ' ');
    }
  };

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">
              {lead.firstName} {lead.lastName}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              Added {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge 
            className={cn(
              "whitespace-nowrap",
              getInquiryColor(lead.inquiryPurpose)
            )}
          >
            {lead.inquiryPurpose.charAt(0).toUpperCase() + lead.inquiryPurpose.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">{lead.contactNumber}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm truncate">{lead.email}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm truncate">{lead.locationPreference}</span>
            </div>
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm capitalize">{lead.propertyType.replace(/_/g, ' ')} ({lead.bedrooms}B/{lead.bathrooms}B)</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between border-t border-dashed border-border pt-3">
            <div className="flex items-center space-x-1 text-sm">
              <span className="font-medium">Budget:</span>
              <span>
                {formatCurrency(lead.budgetRange[0])} - {formatCurrency(lead.budgetRange[1])}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm">
              <span className="font-medium">Timeline:</span>
              <span className="flex items-center">
                <CalendarClock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {getTimelineText(lead.timeline)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <span className="text-xs text-muted-foreground capitalize">
          Via {lead.leadSource.replace(/_/g, ' ')}
          {lead.assignedTo && ` • Assigned to ${lead.assignedTo}`}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8"
          onClick={() => navigate(`/lead/${lead.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LeadCard;
