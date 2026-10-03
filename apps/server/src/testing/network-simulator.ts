/**
 * Rural 3G Network Simulator & Latency Profiler
 * Emulates the connectivity conditions of rural Eastern UP (Bhadohi district)
 * Parameters: 200 kbps downstream, 50 kbps upstream, 400ms base RTT + jitter.
 */

export interface NetworkProfile {
  name: string;
  downloadKbps: number;
  uploadKbps: number;
  rttMs: number;
  jitterMs: number;
  packetLossRate: number; // 0.0 to 1.0
}

export const BHADOHI_RURAL_3G: NetworkProfile = {
  name: 'Bhadohi Rural 3G Intermittent',
  downloadKbps: 200,
  uploadKbps: 50,
  rttMs: 400,
  jitterMs: 150,
  packetLossRate: 0.05
};

export const BHADOHI_EDGE_SLOW: NetworkProfile = {
  name: 'Bhadohi 2G / EDGE High Latency',
  downloadKbps: 64,
  uploadKbps: 32,
  rttMs: 1200,
  jitterMs: 300,
  packetLossRate: 0.15
};

export class NetworkSimulator {
  private profile: NetworkProfile;

  constructor(profile: NetworkProfile = BHADOHI_RURAL_3G) {
    this.profile = profile;
  }

  /**
   * Calculates realistic simulated transmission duration in ms for a payload
   */
  calculateTransmissionDelay(payloadBytes: number, direction: 'UP' | 'DOWN'): number {
    const bandwidthKbps = direction === 'UP' ? this.profile.uploadKbps : this.profile.downloadKbps;
    const bandwidthBps = (bandwidthKbps * 1000) / 8; // bytes per second
    const serializationMs = (payloadBytes / bandwidthBps) * 1000;
    const jitter = (Math.random() - 0.5) * 2 * this.profile.jitterMs;
    const totalMs = this.profile.rttMs + serializationMs + jitter;
    return Math.max(50, Math.round(totalMs));
  }

  /**
   * Executes an asynchronous operation with retry logic and exponential backoff
   * Simulates mobile app network stack resilience
   */
  async executeWithBackoff<T>(
    operation: (attempt: number) => Promise<T>,
    options: {
      maxAttempts?: number;
      initialDelayMs?: number;
      backoffFactor?: number;
      timeoutMs?: number;
    } = {}
  ): Promise<{ result: T; attempts: number; totalDurationMs: number }> {
    const maxAttempts = options.maxAttempts || 3;
    const initialDelay = options.initialDelayMs || 500;
    const factor = options.backoffFactor || 2;
    const timeout = options.timeoutMs || 5000;

    let attempt = 0;
    let delay = initialDelay;
    const startTime = Date.now();

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('NETWORK_TIMEOUT')), timeout);
        });

        const result = await Promise.race([operation(attempt), timeoutPromise]);
        return {
          result,
          attempts: attempt,
          totalDurationMs: Date.now() - startTime
        };
      } catch (err: any) {
        if (attempt >= maxAttempts) {
          throw new Error(`NETWORK_REQUEST_FAILED_AFTER_${attempt}_ATTEMPTS: ${err.message}`);
        }
        await new Promise(res => setTimeout(res, delay));
        delay *= factor;
      }
    }

    throw new Error('NETWORK_REQUEST_EXHAUSTED');
  }

  /**
   * Audits response payload size against rural 3G payload budget
   */
  auditPayloadBudget(
    data: any,
    maxBudgetKb: number = 50
  ): {
    byteLength: number;
    sizeKb: number;
    maxBudgetKb: number;
    isCompliant: boolean;
  } {
    const jsonString = JSON.stringify(data);
    const byteLength = Buffer.byteLength(jsonString, 'utf8');
    const sizeKb = Number((byteLength / 1024).toFixed(2));
    return {
      byteLength,
      sizeKb,
      maxBudgetKb,
      isCompliant: sizeKb <= maxBudgetKb
    };
  }
}

export const ruralSimulator = new NetworkSimulator(BHADOHI_RURAL_3G);
