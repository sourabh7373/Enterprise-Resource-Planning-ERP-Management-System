# Enterprise Resource Planning (ERP) Management System - Known Limitations

This document outlines the known limitations, incomplete features, security boundaries, and deployment considerations for the MERN Stack ERP Management System.

---

## 1. Feature & Functional Limitations
- **Payroll & Payslip Generation**: While employee salaries, financial expenses, and income transactions are fully tracked, automated monthly tax deduction and automated payslip generation PDF downloads are stubbed/basic.
- **Advanced Multi-Currency Support**: Financial transactions and invoices are denominated in base currency (`USD` / standard units); multi-currency real-time exchange rate conversions are not implemented.
- **Real-Time WebSockets**: Real-time notifications and chat messaging rely on database storage and HTTP polling/refresh rather than persistent WebSocket (Socket.io) connections.

## 2. Testing Limitations
- **Automated End-to-End UI Tests**: Automated browser testing (Cypress / Playwright) is not included in the test suite. Frontend quality was verified via Vite production builds, static analysis, and manual route/component inspections.
- **Concurrent Load Testing**: High-concurrency stress testing (e.g., thousands of simultaneous check-ins) has not been benchmarked against high-load production clusters.

## 3. Security Limitations
- **JWT Expiration Handling**: Client-side session expiration relies on token TTL stored in localStorage; automatic silent token refresh (refresh tokens) is not implemented.
- **Rate Limiting**: Basic request protection is implemented, but advanced distributed rate limiting (e.g., Redis-backed sliding window per IP for login endpoints) is not configured for production scale.

## 4. Deployment Limitations
- **Single Server Architecture**: The backend Express application and frontend Vite build are structured for standard monolithic or decoupled deployments (e.g., Render, Vercel, Heroku) backed by MongoDB Atlas. Containerized Kubernetes orchestration configs are not provided.
