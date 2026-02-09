import { createContext, useContext, useEffect, useState } from "react";
import loadCsv from "@/lib/loadCsv";
import { displayCsvFiles } from "@/data/contractsData";

const DataContext = createContext<any[]>([]);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [allRows, setAllRows] = useState<any[]>([]);

  useEffect(() => {
    async function preload() {
      const loaded: any[] = [];
      for (const filePath of Object.values(displayCsvFiles)) {
        const rows = await loadCsv(filePath);
        loaded.push(...rows);
      }
      setAllRows(loaded);
    }
    preload();
  }, []);

  return (
    <DataContext.Provider value={allRows}>
      {children}
    </DataContext.Provider>
  );
};

export const useAllRows = () => useContext(DataContext);
