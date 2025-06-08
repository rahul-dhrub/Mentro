import { DaySchedule, ScheduleTask } from '@/app/schedule/types';

export interface CreateScheduleItemData {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  attendees?: number;
  description?: string;
  isOnline?: boolean;
}

export interface UpdateScheduleItemData extends CreateScheduleItemData {
  id: string;
}

export interface ScheduleApiResponse {
  success: boolean;
  schedule?: DaySchedule[];
  scheduleItem?: ScheduleTask;
  message?: string;
  error?: string;
}

class ScheduleAPI {
  private baseUrl = '/api/schedule';

  async getSchedule(startDate?: string, endDate?: string): Promise<ScheduleApiResponse> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch schedule'
      };
    }
  }

  async createScheduleItem(data: CreateScheduleItemData): Promise<ScheduleApiResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating schedule item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create schedule item'
      };
    }
  }

  async updateScheduleItem(data: UpdateScheduleItemData): Promise<ScheduleApiResponse> {
    try {
      const { id, ...updateData } = data;
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update schedule item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating schedule item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update schedule item'
      };
    }
  }

  async deleteScheduleItem(id: string): Promise<ScheduleApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete schedule item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete schedule item'
      };
    }
  }
}

export const scheduleAPI = new ScheduleAPI(); 