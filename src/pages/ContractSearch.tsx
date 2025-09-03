import { useState } from "react";
import { Search, Filter, Download, ExternalLink, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockContracts, Contract } from "@/data/contractsData";

const ContractSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [selectedContractType, setSelectedContractType] = useState("all");
  const [selectedSetAside, setSelectedSetAside] = useState("all");

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-success/10 text-success border-success/20',
      'Completed': 'bg-info/10 text-info border-info/20',
      'Terminated': 'bg-destructive/10 text-destructive border-destructive/20',
      'Cancelled': 'bg-muted text-muted-foreground border-border'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getCompetitionColor = (competition: string) => {
    const colors: Record<string, string> = {
      'Full and Open Competition': 'bg-success/10 text-success',
      'Limited Sources': 'bg-warning/10 text-warning',
      'Not Competed': 'bg-destructive/10 text-destructive',
      'Set Aside': 'bg-info/10 text-info'
    };
    return colors[competition] || 'bg-muted text-muted-foreground';
  };

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = !searchQuery || 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAgency = selectedAgency === "all" || contract.subAgency === selectedAgency;
    const matchesType = selectedContractType === "all" || contract.contractType === selectedContractType;
    const matchesSetAside = selectedSetAside === "all" || contract.setAsideType === selectedSetAside;

    return matchesSearch && matchesAgency && matchesType && matchesSetAside;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contract Search</h1>
        <p className="text-muted-foreground">
          Search and analyze defense contracts with advanced filtering capabilities
        </p>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-navy" />
            Advanced Contract Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts, contractors, or systems..."
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

            <Select value={selectedContractType} onValueChange={setSelectedContractType}>
              <SelectTrigger>
                <SelectValue placeholder="Contract Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Firm Fixed Price">Firm Fixed Price</SelectItem>
                <SelectItem value="Cost Plus">Cost Plus</SelectItem>
                <SelectItem value="Time and Materials">Time and Materials</SelectItem>
                <SelectItem value="Indefinite Delivery">Indefinite Delivery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSetAside} onValueChange={setSelectedSetAside}>
              <SelectTrigger>
                <SelectValue placeholder="Set-Aside Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Set-Asides</SelectItem>
                <SelectItem value="None">No Set-Aside</SelectItem>
                <SelectItem value="Small Business">Small Business</SelectItem>
                <SelectItem value="SDVOSB">SDVOSB</SelectItem>
                <SelectItem value="WOSB">WOSB</SelectItem>
                <SelectItem value="HUBZone">HUBZone</SelectItem>
                <SelectItem value="8(a)">8(a)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="bg-navy hover:bg-navy-dark">
              <Search className="mr-2 h-4 w-4" />
              Search Contracts ({filteredContracts.length} results)
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Contract Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Title</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Award Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contract.title}</div>
                        <div className="text-sm text-muted-foreground">{contract.contractNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{contract.contractor}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{contract.agency}</div>
                        <div className="text-sm text-muted-foreground">{contract.subAgency}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-bold text-navy">{formatCurrency(contract.totalValue)}</div>
                        <div className="text-sm text-muted-foreground">
                          Obligated: {formatCurrency(contract.obligatedAmount)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(contract.awardDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCompetitionColor(contract.competitionType)}>
                        {contract.competitionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredContracts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No contracts found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractSearch;