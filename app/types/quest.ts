/**
 * Quest Types
 * 
 * These types represent game quests and missions.
 * Used for quest display, progress tracking, and reward management.
 */

export interface Quest {
  id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'event';
  status: string;
  progress?: {
    current: number;
    required: number;
  };
  reward?: {
    experience?: number;
    items?: string[];
  };
  expires_at?: string | null;
  completed: boolean;
  requirement: {
    action: string;
    count: number;
    companion_type?: string;
  };
}
