const PEXELS_API_KEY = '38E77v9ynBrlxXvqlHAmiLey4lJI97icJbuAxg7WCTXVPVQ4V8cIEHul'; // We'll need to get this

export interface PlantImage {
  id: string;
  url: string;
  photographer: string;
  alt: string;
}

export async function searchPlantImages(query: string): Promise<PlantImage[]> {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' plant')}&per_page=10`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    const data = await response.json();
    
    return data.photos.map((photo: any) => ({
      id: photo.id.toString(),
      url: photo.src.medium,
      photographer: photo.photographer,
      alt: photo.alt || `${query} plant`,
    }));
  } catch (error) {
    console.error('Error fetching plant images:', error);
    return [];
  }
}
