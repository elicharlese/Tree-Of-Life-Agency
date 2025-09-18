#!/usr/bin/env ts-node

/**
 * Comprehensive Test Runner for Tree of Life Agency
 * Executes all tests in proper order and generates detailed report
 */

import { spawn, SpawnOptions } from 'child_process';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

interface TestSuite {
  name: string;
  description: string;
  command: string;
  args: string[];
  timeout: number;
  critical: boolean;
}

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
  coverage?: number;
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  private testSuites: TestSuite[] = [
    {
      name: 'Unit Tests',
      description: 'Core business logic and utility functions',
      command: 'npm',
      args: ['run', 'test:unit'],
      timeout: 120000, // 2 minutes
      critical: true,
    },
    {
      name: 'Integration Tests',
      description: 'API endpoints and database operations',
      command: 'npm',
      args: ['run', 'test:integration'],
      timeout: 300000, // 5 minutes
      critical: true,
    },
    {
      name: 'Database Tests',
      description: 'Schema validation and data integrity',
      command: 'npm',
      args: ['run', 'test:database'],
      timeout: 180000, // 3 minutes
      critical: true,
    },
    {
      name: 'Security Tests',
      description: 'Authentication, authorization, and input validation',
      command: 'npm',
      args: ['run', 'test:security'],
      timeout: 240000, // 4 minutes
      critical: true,
    },
    {
      name: 'Performance Tests',
      description: 'Load testing and performance benchmarks',
      command: 'npm',
      args: ['run', 'test:performance'],
      timeout: 600000, // 10 minutes
      critical: false,
    },
    {
      name: 'E2E Tests',
      description: 'End-to-end user workflows',
      command: 'npm',
      args: ['run', 'test:e2e'],
      timeout: 900000, // 15 minutes
      critical: true,
    },
    {
      name: 'Mobile Tests',
      description: 'React Native app functionality',
      command: 'npm',
      args: ['run', 'test:mobile'],
      timeout: 300000, // 5 minutes
      critical: false,
    },
    {
      name: 'GraphQL Tests',
      description: 'GraphQL schema and resolvers',
      command: 'npm',
      args: ['run', 'test:graphql'],
      timeout: 180000, // 3 minutes
      critical: true,
    },
    {
      name: 'WebSocket Tests',
      description: 'Real-time communication features',
      command: 'npm',
      args: ['run', 'test:websocket'],
      timeout: 120000, // 2 minutes
      critical: false,
    },
    {
      name: 'Integration API Tests',
      description: 'Third-party API integrations (Stripe, HubSpot, etc.)',
      command: 'npm',
      args: ['run', 'test:integrations'],
      timeout: 240000, // 4 minutes
      critical: false,
    },
  ];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting comprehensive test suite for Tree of Life Agency...\n');
    this.startTime = performance.now();

    await this.setupTestEnvironment();

    for (const suite of this.testSuites) {
      console.log(`📋 Running ${suite.name}: ${suite.description}`);
      const result = await this.runTestSuite(suite);
      this.results.push(result);
      
      if (result.passed) {
        console.log(`✅ ${suite.name} passed (${result.duration.toFixed(2)}ms)\n`);
      } else {
        console.log(`❌ ${suite.name} failed (${result.duration.toFixed(2)}ms)`);
        if (result.error) {
          console.log(`   Error: ${result.error}\n`);
        }
        
        if (suite.critical) {
          console.log(`💥 Critical test suite failed. Aborting remaining tests.\n`);
          break;
        }
      }
    }

    await this.generateReport();
    await this.cleanupTestEnvironment();
  }

  private async setupTestEnvironment(): Promise<void> {
    console.log('🔧 Setting up test environment...');
    
    // Check if required services are running
    const services = ['postgresql', 'redis'];
    for (const service of services) {
      try {
        await this.execCommand('docker', ['ps'], 30000);
        console.log(`   ✅ Docker is running`);
        break;
      } catch {
        console.log(`   ⚠️  Docker not available, using local services`);
      }
    }

    // Setup test database
    try {
      await this.execCommand('npm', ['run', 'db:test:setup'], 60000);
      console.log(`   ✅ Test database prepared`);
    } catch (error) {
      console.log(`   ⚠️  Database setup warning: ${error}`);
    }

    console.log('✅ Test environment ready\n');
  }

  private async runTestSuite(suite: TestSuite): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      const output = await this.execCommand(suite.command, suite.args, suite.timeout);
      const endTime = performance.now();
      
      // Extract coverage if available
      let coverage: number | undefined;
      const coverageMatch = output.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*(\d+(?:\.\d+)?)/);
      if (coverageMatch) {
        coverage = parseFloat(coverageMatch[1]);
      }

      return {
        suite: suite.name,
        passed: true,
        duration: endTime - startTime,
        output,
        coverage,
      };
    } catch (error) {
      const endTime = performance.now();
      
      return {
        suite: suite.name,
        passed: false,
        duration: endTime - startTime,
        output: '',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async execCommand(command: string, args: string[], timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const options: SpawnOptions = {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      };

      const child = spawn(command, args, options);
      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  private async generateReport(): Promise<void> {
    const endTime = performance.now();
    const totalDuration = endTime - this.startTime;
    
    const passedTests = this.results.filter(r => r.passed);
    const failedTests = this.results.filter(r => !r.passed);
    const criticalTests = this.testSuites.filter(s => s.critical);
    const criticalPassed = passedTests.filter(r => 
      criticalTests.some(s => s.name === r.suite)
    );

    // Calculate overall coverage
    const coverageResults = this.results.filter(r => r.coverage !== undefined);
    const avgCoverage = coverageResults.length > 0 
      ? coverageResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / coverageResults.length
      : 0;

    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST REPORT - TREE OF LIFE AGENCY');
    console.log('='.repeat(80));
    console.log(`🕒 Total Test Time: ${(totalDuration / 1000).toFixed(2)} seconds`);
    console.log(`📈 Test Success Rate: ${(passedTests.length / this.results.length * 100).toFixed(1)}%`);
    console.log(`🎯 Critical Tests: ${criticalPassed.length}/${criticalTests.length} passed`);
    console.log(`📋 Code Coverage: ${avgCoverage.toFixed(1)}%`);
    console.log('');

    // Detailed results
    console.log('📋 TEST SUITE RESULTS:');
    console.log('-'.repeat(80));
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = (result.duration / 1000).toFixed(2);
      const coverage = result.coverage ? ` (${result.coverage.toFixed(1)}% coverage)` : '';
      
      console.log(`${status.padEnd(8)} ${result.suite.padEnd(25)} ${duration.padStart(8)}s${coverage}`);
      
      if (!result.passed && result.error) {
        console.log(`         Error: ${result.error.substring(0, 100)}...`);
      }
    });

    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      console.log('-'.repeat(40));
      failedTests.forEach(result => {
        console.log(`• ${result.suite}: ${result.error?.substring(0, 200)}...`);
      });
    }

    // Performance metrics
    console.log('\n⚡ PERFORMANCE METRICS:');
    console.log('-'.repeat(40));
    console.log(`• Fastest test: ${Math.min(...this.results.map(r => r.duration / 1000)).toFixed(2)}s`);
    console.log(`• Slowest test: ${Math.max(...this.results.map(r => r.duration / 1000)).toFixed(2)}s`);
    console.log(`• Average test time: ${(this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length / 1000).toFixed(2)}s`);

    // System health assessment
    console.log('\n🏥 SYSTEM HEALTH ASSESSMENT:');
    console.log('-'.repeat(40));
    
    const healthScore = this.calculateHealthScore();
    const healthStatus = healthScore >= 90 ? '🟢 EXCELLENT' : 
                        healthScore >= 80 ? '🟡 GOOD' : 
                        healthScore >= 60 ? '🟠 FAIR' : '🔴 POOR';
    
    console.log(`• Overall Health Score: ${healthScore.toFixed(1)}% (${healthStatus})`);
    console.log(`• Production Readiness: ${criticalPassed.length === criticalTests.length ? '🟢 READY' : '🔴 NOT READY'}`);
    console.log(`• Code Quality: ${avgCoverage >= 90 ? '🟢 HIGH' : avgCoverage >= 80 ? '🟡 GOOD' : '🔴 NEEDS WORK'}`);

    // Save detailed report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      totalDuration: totalDuration / 1000,
      successRate: passedTests.length / this.results.length * 100,
      coverage: avgCoverage,
      healthScore,
      results: this.results,
      summary: {
        total: this.results.length,
        passed: passedTests.length,
        failed: failedTests.length,
        critical: criticalTests.length,
        criticalPassed: criticalPassed.length,
      },
    };

    const reportPath = path.join(__dirname, '../reports/test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    console.log('\n' + '='.repeat(80));
    
    if (criticalPassed.length === criticalTests.length && passedTests.length >= this.results.length * 0.8) {
      console.log('🎉 CONGRATULATIONS! Tree of Life Agency is ready for production! 🚀');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues before deployment.');
    }
  }

  private calculateHealthScore(): number {
    const passedTests = this.results.filter(r => r.passed);
    const criticalTests = this.testSuites.filter(s => s.critical);
    const criticalPassed = passedTests.filter(r => 
      criticalTests.some(s => s.name === r.suite)
    );

    const successRate = passedTests.length / this.results.length * 100;
    const criticalRate = criticalPassed.length / criticalTests.length * 100;
    
    const coverageResults = this.results.filter(r => r.coverage !== undefined);
    const avgCoverage = coverageResults.length > 0 
      ? coverageResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / coverageResults.length
      : 0;

    // Weighted health score
    const healthScore = (successRate * 0.4) + (criticalRate * 0.4) + (avgCoverage * 0.2);
    
    return Math.min(100, Math.max(0, healthScore));
  }

  private async cleanupTestEnvironment(): Promise<void> {
    console.log('\n🧹 Cleaning up test environment...');
    
    try {
      await this.execCommand('npm', ['run', 'db:test:cleanup'], 30000);
      console.log('   ✅ Test database cleaned up');
    } catch {
      console.log('   ⚠️  Database cleanup warning (may be expected)');
    }

    console.log('✅ Cleanup completed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch((error) => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}
