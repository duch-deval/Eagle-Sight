import { useState } from "react";
import { Search, Building2, MapPin, Award, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockContractors } from "@/data/contractsData";

const Contractors = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getBusinessTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Large Business': 'bg-navy/10 text-navy border-navy/20',
      'Small Business': 'bg-success/10 text-success border-success/20',
      'SDVOSB': 'bg-info/10 text-info border-info/20',
      'WOSB': 'bg-purple-100 text-purple-800 border-purple-200',
      'HUBZone': 'bg-orange-100 text-orange-800 border-orange-200',
      '8(a)': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const filteredContractors = mockContractors.filter(contractor =>
    !searchQuery || 
    contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contractor.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Defense Contractors</h1>
        <p className="text-muted-foreground">
          Explore prime contractors and their capabilities in the defense sector
        </p>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-navy" />
            Search Contractors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contractors, capabilities, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button className="bg-navy hover:bg-navy-dark">
              Search ({filteredContractors.length} results)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {filteredContractors.map((contractor) => (
          <Card key={contractor.id} className="shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{contractor.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getBusinessTypeColor(contractor.businessType)}>
                      {contractor.businessType}
                    </Badge>
                    {contractor.securityClearance && contractor.securityClearance !== 'None' && (
                      <Badge variant="outline" className="border-red-200 text-red-800">
                        {contractor.securityClearance} Clearance
                      </Badge>
                    )}
                  </div>
                </div>
                <Building2 className="h-6 w-6 text-navy" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">DUNS Number</div>
                  <div className="font-mono">{contractor.duns}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">CAGE Code</div>
                  <div className="font-mono">{contractor.cage}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Employees</div>
                  <div className="font-medium">{contractor.employeeCount?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Annual Revenue</div>
                  <div className="font-medium text-navy">
                    {contractor.revenue ? formatCurrency(contractor.revenue) : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Headquarters</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {contractor.address.city}, {contractor.address.state} {contractor.address.zipCode}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Core Capabilities</div>
                <div className="flex flex-wrap gap-1">
                  {contractor.capabilities.slice(0, 3).map((capability, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                  {contractor.capabilities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{contractor.capabilities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Past Performance</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Total Contracts: <span className="font-medium">{contractor.pastPerformance.totalContracts.toLocaleString()}</span></div>
                    <div>Total Value: <span className="font-medium text-navy">{formatCurrency(contractor.pastPerformance.totalValue)}</span></div>
                    {contractor.pastPerformance.averageRating && (
                      <div>Rating: <span className="font-medium">{contractor.pastPerformance.averageRating}/5.0</span></div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Key Facilities</div>
                  <div className="text-sm text-muted-foreground">
                    {contractor.facilities.slice(0, 2).map((facility, index) => (
                      <div key={index} className="truncate">{facility}</div>
                    ))}
                    {contractor.facilities.length > 2 && (
                      <div className="text-xs">+{contractor.facilities.length - 2} more locations</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-navy hover:bg-navy-dark" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
                {contractor.website && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContractors.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No contractors found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Contractors;