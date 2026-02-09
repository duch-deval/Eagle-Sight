import Papa from "papaparse";

const loadCsv = async (filePath: string): Promise<any[]> => {
  // Always prefix with base to work on GitHub Pages
  const fullPath = `${import.meta.env.BASE_URL}${filePath.replace(/^\//, "")}`;
  return new Promise<any[]>((resolve, reject) => {
    Papa.parse(fullPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data as any[]),
      error: (err) => reject(err),
    });
  });
};

export default loadCsv;
