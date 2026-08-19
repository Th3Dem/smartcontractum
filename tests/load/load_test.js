import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp-up to 50 VUs
    { duration: '20s', target: 100 }, // Peak sustained load
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<350'], // 95% of requests must complete below 350ms
    http_req_failed: ['rate<0.01'],   // Error rate below 1%
  },
};

export default function () {
  const res = http.get('http://localhost:8000/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'circuit breaker closed': (r) => r.json().circuit_breaker === 'closed',
  });
  sleep(1);
}
