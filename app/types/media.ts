/**
 * Media Image Types
 * 
 * These types are used across the application for handling image assets
 * from the API response for companions, animals, and other visual content.
 */

export interface MediaImage {
  id: number;
  name: string;
  file_name: string;
  url: string;
  thumb_url: string;
  responsive_url: string;
}
