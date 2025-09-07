// src/seeders/data-loader.ts
import fs from "fs";
import path from "path";

export class DataLoader {
  // ✅ Load all JSON files from directory
  static loadJharkhandPincodes(): any[] {
    const dataDir = path.join(__dirname, "../pincode-data");
    const allPincodes: any[] = [];

    try {
      const files = fs
        .readdirSync(dataDir)
        .filter(
          (file) => file.startsWith("jharkhand-") && file.endsWith(".json")
        );

      files.forEach((file) => {
        const filePath = path.join(dataDir, file);
        const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Add default values for missing fields
        const processedData = fileData.map((item: any) => ({
          ...item,
          state: item.state || "Jharkhand",
          codAvailable: item.codAvailable ?? true,
          isServiceable: item.isServiceable ?? true,
          maxWeight: item.maxWeight || 10,
          courierPartner: item.courierPartner || "self",
        }));

        allPincodes.push(...processedData);
      
      });

      return allPincodes;
    } catch (error) {
      
      return [];
    }
  }

  // ✅ Simple environment handler - loads all zone files for now
  static loadEnvironmentData(env: string = "development") {
    console.log(`🌱 Loading all zone files for ${env} environment`);
    return this.loadJharkhandPincodes();
  }

  // TODO: Future environment-specific loading
  /*
  static loadEnvironmentDataAdvanced(env: string = "development") {
    const environments = {
      development: "jharkhand-popular.json",
      staging: "jharkhand-extended.json", 
      production: "jharkhand-complete.json",
    };
    
    const filename = environments[env as keyof typeof environments];
    if (filename) {
      // Load specific file when available
      const filePath = path.join(__dirname, "../data/pincode-data", filename);
      try {
        const rawData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return rawData.map((item: any) => ({
          ...item,
          state: item.state || "Jharkhand",
          codAvailable: item.codAvailable ?? true,
          isServiceable: item.isServiceable ?? true,
          maxWeight: item.maxWeight || 10,
          courierPartner: item.courierPartner || "self",
        }));
      } catch (error) {
        console.log(`File ${filename} not found, using default data`);
      }
    }
    
    // Fallback to all files
    return this.loadJharkhandPincodes();
  }
  */
}
