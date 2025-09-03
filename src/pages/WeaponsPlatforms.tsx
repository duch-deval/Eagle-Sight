import { useState } from "react";
import { Search, Filter, Download, ExternalLink, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { weaponsPlatforms, weaponCategories, searchWeapons, getWeaponsByCategory } from "@/data/weaponsPlatforms";
import DefenseBudgetBreakdown from "@/components/dashboard/DefenseBudgetBreakdown";

const WeaponsPlatforms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredWeapons = () => {
    let weapons = weaponsPlatforms;
    
    if (selectedCategory !== "all") {
      weapons = getWeaponsByCategory(selectedCategory);
    }
    
    if (searchQuery) {
      weapons = searchWeapons(searchQuery);
    }
    
    return weapons;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Aircraft': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Ground Vehicle': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Naval': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'Missile System': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Electronic System': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-success/10 text-success border-success/20',
      'Development': 'bg-warning/10 text-warning border-warning/20',
      'Retired': 'bg-muted text-muted-foreground border-border'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Weapons Platforms & Budget Analysis</h1>
        <p className="text-muted-foreground">
          Browse and analyze funding data for major defense weapon systems and budget breakdowns
        </p>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Platforms Index
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Budget Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6 mt-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-navy" />
                Filter Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search platforms, manufacturers, or systems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {weaponCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWeapons().map((weapon) => (
              <Card key={weapon.id} className="shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg leading-tight">{weapon.name}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getCategoryColor(weapon.category)}>
                          {weapon.category}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(weapon.status)}>
                          {weapon.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {weapon.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manufacturer:</span>
                      <span className="font-medium">{weapon.manufacturer}</span>
                    </div>
                    {weapon.firstDeployed && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">First Deployed:</span>
                        <span className="font-medium">{weapon.firstDeployed}</span>
                      </div>
                    )}
                    {weapon.totalFunding && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Funding:</span>
                        <span className="font-bold text-navy">{formatCurrency(weapon.totalFunding)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">FSC Code:</span>
                      <Badge variant="secondary">{weapon.fscCode}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NAICS Code:</span>
                      <Badge variant="secondary">{weapon.naicsCode}</Badge>
                    </div>
                  </div>

                  <Button className="w-full bg-navy hover:bg-navy-dark" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Funding Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWeapons().length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">No platforms found matching your search criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <DefenseBudgetBreakdown />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeaponsPlatforms;