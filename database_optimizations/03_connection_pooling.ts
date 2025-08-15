// Connection Pooling Optimization for Multimedia Pipeline
// Implementation Time: 1 hour | Risk: LOW | Impact: MEDIUM-HIGH

// Enhanced Supabase client configuration with pooling
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Enhanced client for multimedia operations with connection pooling
export const supabaseWithPooling = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false, // Disable for server-side operations
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public',
  },
  // Connection pooling configuration
  realtime: {
    params: {
      eventsPerSecond: 20, // Increased for multimedia operations
    },
  },
});

// Specialized client for heavy multimedia operations
export const supabaseMultimediaClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Add connection pooling headers
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=300, max=1000',
    },
    fetch: (url, options = {}) => {
      // Add timeout for long-running multimedia operations
      return fetch(url, {
        ...options,
        // 5 minute timeout for video generation
        signal: AbortSignal.timeout(300000),
      });
    },
  },
  db: {
    schema: 'public',
  },
});

// Connection management utilities
export class MultimediaConnectionManager {
  private static instance: MultimediaConnectionManager;
  private connectionPool: Map<string, any> = new Map();
  private maxConnections = 50;
  private currentConnections = 0;

  public static getInstance(): MultimediaConnectionManager {
    if (!MultimediaConnectionManager.instance) {
      MultimediaConnectionManager.instance = new MultimediaConnectionManager();
    }
    return MultimediaConnectionManager.instance;
  }

  async getConnection(operationType: 'read' | 'write' | 'multimedia'): Promise<any> {
    const poolKey = `${operationType}_${Date.now() % 10}`; // Simple round-robin
    
    if (this.connectionPool.has(poolKey) && this.currentConnections < this.maxConnections) {
      return this.connectionPool.get(poolKey);
    }

    // Create new connection based on operation type
    let client;
    switch (operationType) {
      case 'multimedia':
        client = supabaseMultimediaClient;
        break;
      case 'read':
        client = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
          global: { headers: { 'Prefer': 'return=minimal' } }
        });
        break;
      default:
        client = supabaseWithPooling;
    }

    this.connectionPool.set(poolKey, client);
    this.currentConnections++;
    
    return client;
  }

  releaseConnection(poolKey: string): void {
    if (this.connectionPool.has(poolKey)) {
      this.currentConnections = Math.max(0, this.currentConnections - 1);
    }
  }

  getConnectionStats(): { active: number, max: number, poolSize: number } {
    return {
      active: this.currentConnections,
      max: this.maxConnections,
      poolSize: this.connectionPool.size
    };
  }
}

// Usage example for multimedia services
export async function executeMultimediaQuery<T>(
  query: (client: any) => Promise<T>,
  operationType: 'read' | 'write' | 'multimedia' = 'multimedia'
): Promise<T> {
  const connectionManager = MultimediaConnectionManager.getInstance();
  const client = await connectionManager.getConnection(operationType);
  
  try {
    const startTime = Date.now();
    const result = await query(client);
    
    // Log performance metrics for monitoring
    console.log(`Query executed in ${Date.now() - startTime}ms`, {
      operationType,
      connectionStats: connectionManager.getConnectionStats()
    });
    
    return result;
  } catch (error) {
    console.error('Multimedia query failed:', error);
    throw error;
  }
}

// Batch operation helper for multimedia processing
export async function executeBatchMultimediaOperations<T>(
  operations: Array<(client: any) => Promise<T>>,
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  // Process in batches to avoid overwhelming the connection pool
  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(op => executeMultimediaQuery(op, 'multimedia'))
    );
    results.push(...batchResults);
  }
  
  return results;
}