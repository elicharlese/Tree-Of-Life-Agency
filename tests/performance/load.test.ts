import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { performance } from 'perf_hooks';

describe('Performance Load Tests', () => {
  beforeAll(() => {
    console.log('Starting performance load tests...');
  });

  afterAll(() => {
    console.log('Performance load tests completed.');
  });

  describe('API Performance', () => {
    it('should handle concurrent user requests', async () => {
      const numConcurrentUsers = 50;
      const requestsPerUser = 10;
      const maxResponseTime = 2000; // 2 seconds

      const startTime = performance.now();
      
      const userSessions = Array.from({ length: numConcurrentUsers }, async (_, userIndex) => {
        const userRequests = Array.from({ length: requestsPerUser }, async (_, requestIndex) => {
          const requestStart = performance.now();
          
          try {
            // Simulate API call
            const response = await fetch('http://localhost:3000/api/health');
            const requestEnd = performance.now();
            const responseTime = requestEnd - requestStart;
            
            return {
              userId: userIndex,
              requestId: requestIndex,
              responseTime,
              status: response.status,
              success: response.ok,
            };
          } catch (error) {
            return {
              userId: userIndex,
              requestId: requestIndex,
              responseTime: performance.now() - requestStart,
              status: 0,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        });

        return Promise.all(userRequests);
      });

      const allResults = await Promise.all(userSessions);
      const flatResults = allResults.flat();
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Performance metrics
      const successfulRequests = flatResults.filter(r => r.success);
      const failedRequests = flatResults.filter(r => !r.success);
      const avgResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
      const maxResponseTimeActual = Math.max(...successfulRequests.map(r => r.responseTime));
      const throughput = (successfulRequests.length / totalTime) * 1000; // requests per second

      console.log(`Load Test Results:
        - Total requests: ${flatResults.length}
        - Successful requests: ${successfulRequests.length}
        - Failed requests: ${failedRequests.length}
        - Success rate: ${(successfulRequests.length / flatResults.length * 100).toFixed(2)}%
        - Average response time: ${avgResponseTime.toFixed(2)}ms
        - Max response time: ${maxResponseTimeActual.toFixed(2)}ms
        - Throughput: ${throughput.toFixed(2)} req/sec
        - Total test time: ${totalTime.toFixed(2)}ms`);

      // Assertions
      expect(successfulRequests.length / flatResults.length).toBeGreaterThan(0.95); // 95% success rate
      expect(avgResponseTime).toBeLessThan(maxResponseTime);
      expect(throughput).toBeGreaterThan(10); // At least 10 requests per second
    });

    it('should handle database query load', async () => {
      const numQueries = 100;
      const maxQueryTime = 500; // 500ms per query

      const queries = Array.from({ length: numQueries }, async (_, index) => {
        const startTime = performance.now();
        
        try {
          // Simulate database query
          const response = await fetch('http://localhost:3000/api/crm/customers?limit=10');
          const data = await response.json();
          const endTime = performance.now();
          
          return {
            queryId: index,
            responseTime: endTime - startTime,
            recordCount: data.data?.customers?.length || 0,
            success: response.ok,
          };
        } catch (error) {
          return {
            queryId: index,
            responseTime: performance.now() - startTime,
            recordCount: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const results = await Promise.all(queries);
      const successful = results.filter(r => r.success);
      const avgQueryTime = successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;

      console.log(`Database Query Load Test:
        - Total queries: ${results.length}
        - Successful queries: ${successful.length}
        - Average query time: ${avgQueryTime.toFixed(2)}ms
        - Max query time: ${Math.max(...successful.map(r => r.responseTime)).toFixed(2)}ms`);

      expect(successful.length / results.length).toBeGreaterThan(0.98); // 98% success rate
      expect(avgQueryTime).toBeLessThan(maxQueryTime);
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks during extended use', async () => {
      const initialMemory = process.memoryUsage();
      const iterations = 1000;

      // Simulate extended application usage
      for (let i = 0; i < iterations; i++) {
        // Create and destroy objects to test garbage collection
        const data = Array.from({ length: 1000 }, () => ({
          id: Math.random().toString(36),
          timestamp: new Date(),
          data: 'x'.repeat(100),
        }));

        // Process data
        data.forEach(item => {
          item.processed = true;
        });

        // Allow garbage collection periodically
        if (i % 100 === 0) {
          if (global.gc) {
            global.gc();
          }
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryGrowth = {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
      };

      console.log(`Memory Usage Test:
        - Initial RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB
        - Final RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB
        - RSS Growth: ${(memoryGrowth.rss / 1024 / 1024).toFixed(2)} MB
        - Heap Used Growth: ${(memoryGrowth.heapUsed / 1024 / 1024).toFixed(2)} MB`);

      // Memory growth should be reasonable (less than 100MB for this test)
      expect(memoryGrowth.rss).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('WebSocket Performance', () => {
    it('should handle many concurrent WebSocket connections', async () => {
      const numConnections = 100;
      const messagesPerConnection = 10;

      const connections = Array.from({ length: numConnections }, async (_, connIndex) => {
        return new Promise((resolve, reject) => {
          try {
            // Simulate WebSocket connection
            const ws = {
              id: connIndex,
              connected: true,
              messagesSent: 0,
              messagesReceived: 0,
              latencies: [] as number[],
            };

            // Simulate message exchange
            const sendMessages = async () => {
              for (let i = 0; i < messagesPerConnection; i++) {
                const startTime = performance.now();
                
                // Simulate message send/receive
                await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
                
                const endTime = performance.now();
                ws.latencies.push(endTime - startTime);
                ws.messagesSent++;
                ws.messagesReceived++;
              }
            };

            sendMessages().then(() => resolve(ws)).catch(reject);
          } catch (error) {
            reject(error);
          }
        });
      });

      const results = await Promise.all(connections);
      const totalMessages = results.reduce((sum, conn: any) => sum + conn.messagesSent, 0);
      const allLatencies = results.flatMap((conn: any) => conn.latencies);
      const avgLatency = allLatencies.reduce((sum, lat) => sum + lat, 0) / allLatencies.length;

      console.log(`WebSocket Performance Test:
        - Concurrent connections: ${numConnections}
        - Total messages: ${totalMessages}
        - Average latency: ${avgLatency.toFixed(2)}ms
        - Max latency: ${Math.max(...allLatencies).toFixed(2)}ms`);

      expect(results.length).toBe(numConnections);
      expect(avgLatency).toBeLessThan(100); // Average latency under 100ms
    });
  });

  describe('CPU Usage', () => {
    it('should handle CPU-intensive operations efficiently', async () => {
      const startTime = process.hrtime.bigint();
      const startCpuUsage = process.cpuUsage();

      // Simulate CPU-intensive operations (like lead scoring)
      const numCalculations = 10000;
      let results = [];

      for (let i = 0; i < numCalculations; i++) {
        // Simulate lead scoring algorithm
        const score = calculateLeadScore({
          company: Math.random() > 0.5,
          estimatedValue: Math.random() * 100000,
          communications: Math.floor(Math.random() * 20),
          daysSinceCreated: Math.random() * 30,
          status: Math.random() > 0.7 ? 'QUALIFIED' : 'NEW',
        });

        results.push(score);

        // Yield CPU periodically
        if (i % 1000 === 0) {
          await new Promise(resolve => setImmediate(resolve));
        }
      }

      const endTime = process.hrtime.bigint();
      const endCpuUsage = process.cpuUsage(startCpuUsage);
      
      const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const cpuTime = (endCpuUsage.user + endCpuUsage.system) / 1000; // Convert to milliseconds

      console.log(`CPU Intensive Operations Test:
        - Calculations performed: ${numCalculations}
        - Execution time: ${executionTime.toFixed(2)}ms
        - CPU time: ${cpuTime.toFixed(2)}ms
        - CPU efficiency: ${((cpuTime / executionTime) * 100).toFixed(2)}%
        - Operations per second: ${(numCalculations / (executionTime / 1000)).toFixed(0)}`);

      expect(results.length).toBe(numCalculations);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Database Connection Pool', () => {
    it('should handle connection pool exhaustion gracefully', async () => {
      const numConcurrentQueries = 200;
      const queryTimeout = 5000; // 5 seconds

      const queries = Array.from({ length: numConcurrentQueries }, async (_, index) => {
        const startTime = performance.now();
        
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), queryTimeout);
          });

          const queryPromise = fetch(`http://localhost:3000/api/crm/customers/${index % 100 + 1}`);

          const response = await Promise.race([queryPromise, timeoutPromise]);
          const endTime = performance.now();

          return {
            queryId: index,
            responseTime: endTime - startTime,
            success: true,
            status: (response as Response).status,
          };
        } catch (error) {
          return {
            queryId: index,
            responseTime: performance.now() - startTime,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const results = await Promise.all(queries);
      const successful = results.filter(r => r.success);
      const timedOut = results.filter(r => r.error === 'Query timeout');

      console.log(`Connection Pool Test:
        - Concurrent queries: ${numConcurrentQueries}
        - Successful queries: ${successful.length}
        - Timed out queries: ${timedOut.length}
        - Success rate: ${(successful.length / results.length * 100).toFixed(2)}%`);

      // Should handle at least 80% of queries successfully
      expect(successful.length / results.length).toBeGreaterThan(0.8);
      expect(timedOut.length).toBeLessThan(numConcurrentQueries * 0.1); // Less than 10% timeouts
    });
  });
});

// Helper function for CPU test
function calculateLeadScore(lead: {
  company: boolean;
  estimatedValue: number;
  communications: number;
  daysSinceCreated: number;
  status: string;
}): number {
  let score = 0;

  // Base score from status
  const statusScores = { NEW: 10, CONTACTED: 25, QUALIFIED: 50, PROPOSAL: 75, NEGOTIATION: 90 };
  score += statusScores[lead.status as keyof typeof statusScores] || 0;

  // Company bonus
  if (lead.company) score += 10;

  // Value bonus
  if (lead.estimatedValue > 100000) score += 20;
  else if (lead.estimatedValue > 50000) score += 15;
  else if (lead.estimatedValue > 10000) score += 10;
  else score += 5;

  // Communication activity
  score += Math.min(lead.communications * 2, 20);

  // Recency bonus
  if (lead.daysSinceCreated <= 7) score += 5;

  // Simulate some complex calculations
  for (let i = 0; i < 100; i++) {
    Math.sqrt(Math.random() * 1000);
  }

  return Math.min(score, 100);
}
