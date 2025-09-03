import Papa from "papaparse";

const loadCsv = async (filePath: string): Promise<any[]> => {
  console.log("📂 Trying to fetch CSV:", filePath);

  return new Promise<any[]>((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log("✅ CSV fetch success", result);
        resolve(result.data as any[]);
      },
      error: (err) => {
        console.error("❌ CSV fetch failed", err);
        reject(err);
      },
    });
  });
};

export default loadCsv;
