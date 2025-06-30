

interface DemoRequest {
  name: string;
  email: string;
  company: string;
  message?: string;
  source?: string;
  timestamp?: string;
}

interface AirtableResponse {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

class AirtableService {
  private baseId: string;
  private tableId: string;
  private apiKey: string;

  constructor() {
    // These should be set as environment variables in production
    this.baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || '';
    this.tableId = import.meta.env.VITE_AIRTABLE_TABLE_ID || 'tblaNc3Thn4rAxVk2';
    this.apiKey = import.meta.env.VITE_AIRTABLE_API_KEY || '';
  }

  async submitDemoRequest(request: DemoRequest): Promise<AirtableResponse> {
    if (!this.apiKey || !this.baseId) {
      throw new Error('Airtable configuration missing. Please set VITE_AIRTABLE_API_KEY and VITE_AIRTABLE_BASE_ID environment variables.');
    }

    const url = `https://api.airtable.com/v0/${this.baseId}/${this.tableId}`;
    
    const payload = {
      fields: {
        Name: request.name,
        Email: request.email,
        Company: request.company,
        Message: request.message || '',
        Source: request.source || 'Website',
        'Submitted At': request.timestamp || new Date().toISOString(),
        Status: 'New'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

export const airtableService = new AirtableService();
export type { DemoRequest, AirtableResponse };

