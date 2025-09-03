import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import loadCsv from "@/lib/loadCsv";


import { csvFiles } from "@/data/contractsData";

const SearchFilters = () => {
  // Selected filters
  const [offices, setOffices] = useState<string[]>([]);
  const [office, setOffice] = useState("");
  const [year, setYear] = useState("2022");   
  const [fscOptions, setFscOptions] = useState<string[]>([]);
  const [naicsOptions, setNaicsOptions] = useState<string[]>([]);
  const [setAsideOptions, setSetAsideOptions] = useState<string[]>([]);

  // Load CSV data whenever office or year changes
  useEffect(() => {
    async function fetchData() {
      if (!csvFiles[year]) return;
      const rows = await loadCsv(csvFiles[year]);
      if (!rows.length) return;

      const uniqueOffices = [
        ...new Set(rows.map((r: any) => r["Funding Office Name"]).filter(Boolean))
      ];
      setOffices(uniqueOffices);

      // if no office selected yet, default to the first one
      if (!office && uniqueOffices.length > 0) {
        setOffice(uniqueOffices[0]);
      }

      const filtered = rows.filter((r: any) =>
        (r["Funding Office Name"] || "").toUpperCase().includes(office.toUpperCase())
      );

      const fscs = [...new Set(filtered.map((r: any) => r["FSC"]?.trim()).filter(Boolean))];
      const naics = [...new Set(filtered.map((r: any) => r["NAICS"]?.trim()).filter(Boolean))];
      const setAsides = [...new Set(filtered.map((r: any) => r["Set Aside Type"]?.trim()).filter(Boolean))];

      setFscOptions(fscs);
      setNaicsOptions(naics);
      setSetAsideOptions(setAsides);
    }
    fetchData();
  }, [office, year]);


  return (
    <Card className="w-full shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-navy" />
          Search & Filter Defense Contracts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keyword">Keywords</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="keyword" placeholder="F-35, missile system..." className="pl-8" />
            </div>
          </div>

          {/* Contracting Office */}
          <div className="space-y-2">
            <Label>Contracting Office</Label>
            <Select value={office} onValueChange={setOffice}>
              <SelectTrigger><SelectValue placeholder="Select Office" /></SelectTrigger>
              <SelectContent>
                {offices.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fiscal Year */}
          <div className="space-y-2">
            <Label>Fiscal Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger><SelectValue placeholder="Select FY" /></SelectTrigger>
              <SelectContent>
                {Object.keys(csvFiles).map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FSC Code */}
          <div className="space-y-2">
            <Label>FSC Code</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select FSC Code" /></SelectTrigger>
              <SelectContent>
                {fscOptions.map((fsc) => (
                  <SelectItem key={fsc} value={fsc}>{fsc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NAICS Code */}
          <div className="space-y-2">
            <Label>NAICS Code</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select NAICS Code" /></SelectTrigger>
              <SelectContent>
                {naicsOptions.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Set Aside Type */}
          <div className="space-y-2">
            <Label>Set Aside Type</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select Set Aside" /></SelectTrigger>
              <SelectContent>
                {setAsideOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button className="flex-1 bg-navy hover:bg-navy-dark">
            <Search className="mr-2 h-4 w-4" />
            Search Contracts
          </Button>
          <Button variant="outline" className="flex-1">
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
