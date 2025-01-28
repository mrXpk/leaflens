import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const PLANT_ID_API_KEY = 'PSI1Jq3wCJG8hk8VnCzSVCCVYWqQCbOgDv6RzVppbEYcB1dJaq';
const TREFLE_API_KEY = 'FAYGPqaz3UMtgbklr4AMiBpNdcwaWEjNf8asTUsSx3w';
const GEMINI_API_KEY = 'AIzaSyDO7D46SCjEg5bYGTbuC5zWY0U2EVC2SZw';
const SEARCH_HISTORY_KEY = '@leaflens/search_history';
const MAX_HISTORY_ITEMS = 10;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PLANT_CACHE_KEY = '@leaflens/plant_cache';

export interface PlantSearchResult {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  genus?: string;
  imageUrl?: string;
  description?: string;
  careLevel?: string;
  watering?: string;
  sunlight?: string[];
  uses?: string;
  distribution?: string;
  taxonomy?: any;
  careGuide?: string;
  flowerColor?: string;
  nativeStatus?: string;
  growthRate?: string;
  soilType?: string;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

interface CacheEntry {
  data: Partial<PlantSearchResult>;
  timestamp: number;
}

interface PlantCache {
  [key: string]: CacheEntry;
}

async function getPlantDetailsFromGemini(plantName: string): Promise<Partial<PlantSearchResult>> {
  try {
    // Remove any parentheses or extra text from plant name
    const cleanPlantName = plantName.split('(')[0].trim();
    
    const prompt = `Provide detailed information about the plant "${cleanPlantName}" in this exact JSON format without any additional text or markdown:
    {
      "commonName": "the most common name",
      "scientificName": "${cleanPlantName}",
      "family": "plant family name",
      "description": "A detailed description of the plant's appearance and characteristics",
      "careLevel": "easy/medium/hard",
      "watering": "specific watering needs (e.g., weekly, bi-weekly)",
      "sunlight": ["primary light need", "alternative light need"],
      "uses": "common uses and benefits of the plant",
      "careGuide": "Step-by-step care instructions",
      "soilType": "preferred soil conditions",
      "growthRate": "slow/moderate/fast"
    }`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1000,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        timeout: 10000
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini response');
    }

    const text = response.data.candidates[0].content.parts[0].text;
    // Improved JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    
    // Validate and clean the data
    return {
      ...parsedData,
      scientificName: parsedData.scientificName || cleanPlantName,
      commonName: parsedData.commonName || cleanPlantName,
      description: parsedData.description || "A beautiful and unique plant species.",
      careLevel: parsedData.careLevel || "medium",
      watering: parsedData.watering || "Regular watering needed",
      sunlight: Array.isArray(parsedData.sunlight) ? parsedData.sunlight : ["Moderate sunlight"],
      careGuide: parsedData.careGuide || "Provide proper watering and lighting according to the plant's needs."
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

async function getPlantDetailsFromTrefle(scientificName: string): Promise<Partial<PlantSearchResult>> {
  try {
    // Clean the scientific name
    const cleanName = scientificName.split('(')[0].trim();
    
    const searchResponse = await axios.get(
      `https://trefle.io/api/v1/species/search?q=${encodeURIComponent(cleanName)}`,
      {
        headers: {
          'Authorization': `Bearer ${TREFLE_API_KEY}`
        },
        timeout: 10000
      }
    );

    if (!searchResponse.data?.data?.[0]) {
      throw new Error('No results found in Trefle');
    }

    const plantId = searchResponse.data.data[0].id;
    const detailsResponse = await axios.get(
      `https://trefle.io/api/v1/species/${plantId}`,
      {
        headers: {
          'Authorization': `Bearer ${TREFLE_API_KEY}`
        },
        timeout: 10000
      }
    );

    const plantData = detailsResponse.data.data;
    
    // Enhanced data mapping with fallbacks
    return {
      commonName: plantData.common_name || cleanName,
      scientificName: plantData.scientific_name || cleanName,
      family: plantData.family_common_name || plantData.family,
      genus: plantData.genus?.name,
      description: plantData.observations || plantData.description || "A fascinating plant species.",
      careLevel: getCareLevel(plantData),
      watering: getWateringNeeds(plantData),
      sunlight: plantData.growth?.light || ['Moderate sunlight'],
      distribution: plantData.distribution?.native?.join(', '),
      flowerColor: plantData.flower?.color,
      nativeStatus: plantData.native_status,
      growthRate: plantData.growth?.rate || "moderate",
      soilType: plantData.growth?.soil_ph || "Well-draining soil"
    };
  } catch (error) {
    console.error('Trefle API error:', error);
    throw error;
  }
}

async function getCachedPlantDetails(scientificName: string): Promise<Partial<PlantSearchResult> | null> {
  try {
    const cacheStr = await AsyncStorage.getItem(PLANT_CACHE_KEY);
    if (!cacheStr) return null;

    const cache: PlantCache = JSON.parse(cacheStr);
    const entry = cache[scientificName];
    
    if (!entry) return null;
    
    // Check if cache is expired
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      return null;
    }
    
    console.log('Cache hit for:', scientificName);
    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

async function cachePlantDetails(scientificName: string, data: Partial<PlantSearchResult>): Promise<void> {
  try {
    const cacheStr = await AsyncStorage.getItem(PLANT_CACHE_KEY);
    const cache: PlantCache = cacheStr ? JSON.parse(cacheStr) : {};
    
    cache[scientificName] = {
      data,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(PLANT_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

async function getPlantDetails(scientificName: string): Promise<Partial<PlantSearchResult>> {
  console.log('Fetching details for:', scientificName);
  
  // Try cache first
  const cachedData = await getCachedPlantDetails(scientificName);
  if (cachedData) {
    console.log('Returning cached data for:', scientificName);
    return cachedData;
  }

  // Initialize with basic data
  let plantData: Partial<PlantSearchResult> = {
    scientificName,
    commonName: scientificName,
    description: "Loading plant information...",
    careLevel: "Medium",
    watering: "Regular watering needed",
    sunlight: ["Moderate sunlight"]
  };

  // Try Trefle API first as it's more reliable for basic info
  try {
    const trefleData = await Promise.race([
      getPlantDetailsFromTrefle(scientificName),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Trefle timeout')), 5000))
    ]);
    plantData = { ...plantData, ...trefleData };
  } catch (error) {
    console.error('Trefle API error:', error);
  }

  // Then try Gemini for additional details
  try {
    const geminiData = await Promise.race([
      getPlantDetailsFromGemini(scientificName),
      new Promise<Partial<PlantSearchResult>>((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 5000))
    ]) as Partial<PlantSearchResult>;
    
    // Merge Gemini data, preferring existing Trefle data for certain fields
    plantData = {
      ...plantData,
      description: plantData.description ?? geminiData.description,
      careGuide: geminiData.careGuide ?? plantData.careGuide,
      uses: geminiData.uses ?? plantData.uses,
      watering: plantData.watering ?? geminiData.watering,
      sunlight: plantData.sunlight ?? geminiData.sunlight
    };
  } catch (error) {
    console.error('Gemini API error:', error);
  }

  // Cache the results
  await cachePlantDetails(scientificName, plantData);
  
  return plantData;
}

function getCareLevel(plantData: any): string {
  if (!plantData.growth) return 'Medium';
  const factors = [
    plantData.growth.atmospheric_humidity,
    plantData.growth.soil_nutriments,
    plantData.growth.soil_salinity
  ];
  const avgDifficulty = factors.reduce((sum, factor) => sum + (factor || 5), 0) / factors.length;
  if (avgDifficulty <= 3) return 'Easy';
  if (avgDifficulty <= 7) return 'Medium';
  return 'Hard';
}

function getWateringNeeds(plantData: any): string {
  if (!plantData.growth?.minimum_precipitation) return 'Regular watering needed';
  const minPrecip = plantData.growth.minimum_precipitation;
  if (minPrecip < 250) return 'Low water needs';
  if (minPrecip < 500) return 'Moderate water needs';
  return 'High water needs';
}

export async function identifyPlant(imageBase64: string): Promise<PlantSearchResult | null> {
  try {
    console.log('Starting plant identification...');
    
    const identificationResponse = await axios.post('https://api.plant.id/v2/identify', {
      images: [imageBase64],
      plant_details: ['common_names', 'scientific_name', 'taxonomy'],
    }, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });

    if (!identificationResponse.data?.suggestions?.[0]) {
      console.log('No plant identification results');
      return null;
    }

    const plantId = identificationResponse.data.suggestions[0];
    const commonName = plantId.plant_details?.common_names?.[0] || 'Unknown';
    const scientificName = plantId.plant_details?.scientific_name || 'Unknown';

    console.log('Plant identified:', { commonName, scientificName });
    
    // Get details with fallback mechanism
    const details = await getPlantDetails(scientificName);

    return {
      id: identificationResponse.data.id || String(Date.now()),
      commonName: details.commonName || commonName,
      scientificName: details.scientificName || scientificName,
      family: details.family || plantId.plant_details?.taxonomy?.family || 'Unknown',
      genus: details.genus || plantId.plant_details?.taxonomy?.genus,
      imageUrl: imageBase64,
      description: details.description || `${commonName} (${scientificName}) is a plant species.`,
      careLevel: details.careLevel || 'Medium',
      watering: details.watering || 'Regular watering needed',
      sunlight: details.sunlight || ['Moderate sunlight'],
      uses: details.uses,
      distribution: details.distribution,
      taxonomy: plantId.plant_details?.taxonomy,
      careGuide: details.careGuide || 'Provide regular watering and appropriate sunlight.',
      flowerColor: details.flowerColor,
      nativeStatus: details.nativeStatus,
      growthRate: details.growthRate,
      soilType: details.soilType
    };
  } catch (error) {
    console.error('Error in plant identification:', error);
    throw error;
  }
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
}

export async function addToSearchHistory(query: string): Promise<void> {
  try {
    const history = await getSearchHistory();
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now()
    };

    const filteredHistory = history.filter(item => item.query !== query);
    const newHistory = [newItem, ...filteredHistory];
    const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
    
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
}

export async function clearSearchHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
}
