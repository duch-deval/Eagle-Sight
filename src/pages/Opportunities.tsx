import { useState } from "react";
import { Search, Filter, Calendar, MapPin, DollarSign, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockOpportunities } from "@/data/contractsData";

const Opportunities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Open': 'bg-success/10 text-success border-success/20',
      'Closed': 'bg-muted text-muted-foreground border-border',
      'Cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
      'Awarded': 'bg-info/10 text-info border-info/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getSolicitationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'RFP': 'bg-navy/10 text-navy',
      'RFQ': 'bg-success/10 text-success',
      'RFI': 'bg-warning/10 text-warning',
      'IFB': 'bg-info/10 text-info',
      'Sources Sought': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'text-destructive';
    if (days <= 30) return 'text-warning';
    return 'text-muted-foreground';
  };

  const filteredOpportunities = mockOpportunities.filter(opportunity => {
    const matchesSearch = !searchQuery || 
      opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.solicitationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAgency = selectedAgency === "all" || opportunity.subAgency === selectedAgency;
    const matchesStatus = selectedStatus === "all" || opportunity.status === selectedStatus;

    return matchesSearch && matchesAgency && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contract Opportunities</h1>
        <p className="text-muted-foreground">
          Track upcoming defense contracting opportunities and procurement forecasts
        </p>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-navy" />
            Filter Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities, agencies, or solicitation numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
              <SelectTrigger>
                <SelectValue placeholder="All Agencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                <SelectItem value="Air Force">Air Force</SelectItem>
                <SelectItem value="Army">Army</SelectItem>
                <SelectItem value="Navy">Navy</SelectItem>
                <SelectItem value="Marines">Marines</SelectItem>
                <SelectItem value="Space Force">Space Force</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="bg-navy hover:bg-navy-dark">
              <Search className="mr-2 h-4 w-4" />
              Search ({filteredOpportunities.length} results)
            </Button>
            <Button variant="outline">
              Set Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-1">
        {filteredOpportunities.map((opportunity) => {
          const daysUntilDeadline = getDaysUntilDeadline(opportunity.responseDeadline);
          
          return (
            <Card key={opportunity.id} className="shadow-soft hover:shadow-medium transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                      <Badge className={getStatusColor(opportunity.status)}>
                        {opportunity.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getSolicitationTypeColor(opportunity.solicitationType)}>
                        {opportunity.solicitationType}
                      </Badge>
                      {opportunity.setAsideType && (
                        <Badge variant="outline">
                          {opportunity.setAsideType}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {opportunity.solicitationNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    {opportunity.estimatedValue && (
                      <div className="text-lg font-bold text-navy">
                        {formatCurrency(opportunity.estimatedValue)}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">Estimated Value</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{opportunity.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Key Dates</span>
                    </div>
                    <div className="space-y-1">
                      <div>Posted: {formatDate(opportunity.postedDate)}</div>
                      <div className={getUrgencyColor(daysUntilDeadline)}>
                        Deadline: {formatDate(opportunity.responseDeadline)}
                        {opportunity.status === 'Open' && (
                          <span className="ml-2 font-medium">
                            ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'PAST DUE'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Agency & Location</span>
                    </div>
                    <div className="space-y-1">
                      <div>{opportunity.agency}</div>
                      <div className="text-muted-foreground">{opportunity.subAgency}</div>
                      <div className="text-muted-foreground">
                        {opportunity.placeOfPerformance.city}, {opportunity.placeOfPerformance.state}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Contact Information</span>
                    </div>
                    {opportunity.contactInfo ? (
                      <div className="space-y-1">
                        <div>{opportunity.contactInfo.name}</div>
                        <div className="text-muted-foreground">{opportunity.contactInfo.email}</div>
                        {opportunity.contactInfo.phone && (
                          <div className="text-muted-foreground">{opportunity.contactInfo.phone}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">See solicitation for details</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">NAICS Code: </span>
                    <span className="font-mono">{opportunity.naicsCode}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Track Opportunity
                    </Button>
                    <Button className="bg-navy hover:bg-navy-dark" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Solicitation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No opportunities found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Opportunities;