import axios from 'axios';

export interface PlantIdentification {
  id: string;
  name: string;
  commonNames: string[];
  confidence: number;
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  description: string;
  imageUrl?: string;
}

// We'll use the Plant.id API for plant identification
const PLANT_ID_API_KEY = 'PSI1Jq3wCJG8hk8VnCzSVCCVYWqQCbOgDv6RzVppbEYcB1dJaq'; // Replace with actual API key
const API_URL = 'https://api.plant.id/v2/identify';

export async function identifyPlant(imageBase64: string): Promise<PlantIdentification[]> {
  try {
    const response = await axios.post(API_URL, {
      images: [imageBase64],
      modifiers: ["crops_fast", "similar_images"],
      plant_language: "en",
      plant_details: [
        "common_names",
        "taxonomy",
        "description"
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANT_ID_API_KEY
      }
    });

    return response.data.suggestions.map((suggestion: any) => ({
      id: suggestion.id,
      name: suggestion.plant_name,
      commonNames: suggestion.plant_details.common_names || [],
      confidence: suggestion.probability,
      taxonomy: {
        kingdom: suggestion.plant_details.taxonomy.kingdom,
        phylum: suggestion.plant_details.taxonomy.phylum,
        class: suggestion.plant_details.taxonomy.class,
        order: suggestion.plant_details.taxonomy.order,
        family: suggestion.plant_details.taxonomy.family,
        genus: suggestion.plant_details.taxonomy.genus,
        species: suggestion.plant_details.taxonomy.species
      },
      description: suggestion.plant_details.description?.value || '',
      imageUrl: suggestion.similar_images?.[0]?.url
    }));
  } catch (error) {
    console.error('Error identifying plant:', error);
    throw error;
  }
}
