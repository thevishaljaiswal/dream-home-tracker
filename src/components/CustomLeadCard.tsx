
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarClock, 
  Phone, 
  Mail, 
  MapPin, 
  Home, 
  Building2, 
  Banknote, 
  Star,
  StarOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

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
  inquiryPurpose: string;
  timeline: string;
  createdAt: string;
  isHot?: boolean;
  stage?: string;
  assignedTo?: string;
}

interface CustomLeadCardProps {
  lead: Lead;
  onHotToggle: () => void;
}

const CustomLeadCard: React.FC<CustomLeadCardProps> = ({ lead, onHotToggle }) => {
  const navigate = useNavigate();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const timeDistance = formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true });
  const formattedBudget = `${formatCurrency(lead.budgetRange[0])} - ${formatCurrency(lead.budgetRange[1])}`;

  return (
    <Card className="glass-card hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{lead.firstName} {lead.lastName}</h3>
            <p className="text-sm text-muted-foreground mb-3">{timeDistance}</p>
          </div>
          <Button
            variant="ghost" 
            size="icon"
            className={`h-8 w-8 ${lead.isHot ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation
              onHotToggle();
            }}
          >
            {lead.isHot ? (
              <Star className="h-5 w-5 fill-current" />
            ) : (
              <Star className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="outline" className="bg-secondary/20">
            {lead.inquiryPurpose === 'buy' ? 'Buying' : 
             lead.inquiryPurpose === 'rent' ? 'Renting' : 
             lead.inquiryPurpose === 'investment' ? 'Investment' : 'Inquiry'}
          </Badge>
          
          {lead.stage && (
            <Badge variant="outline" className={`capitalize ${
              lead.stage === 'closed' ? 'bg-green-100 text-green-800' : 
              lead.stage === 'new' ? 'bg-blue-100 text-blue-800' : 
              'bg-primary/10 text-primary'
            }`}>
              {lead.stage.replace(/_/g, ' ')}
            </Badge>
          )}
          
          {lead.isHot && (
            <Badge className="bg-red-100 text-red-800">
              Hot Lead
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{lead.contactNumber}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{lead.email}</span>
          </div>
          
          <div className="flex items-center text-sm">
            {lead.propertyType === 'apartment' || lead.propertyType === 'penthouse' ? (
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
            ) : (
              <Home className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            <span className="capitalize">{lead.propertyType.replace(/_/g, ' ')}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{lead.locationPreference}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formattedBudget}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="capitalize">{lead.timeline.replace(/_/g, ' ')}</span>
          </div>

          {lead.assignedTo && (
            <div className="flex items-start text-sm">
              <span className="mt-0.5 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                Assigned to: {lead.assignedTo}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-3 bg-secondary/10 flex justify-between">
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

export default CustomLeadCard;
