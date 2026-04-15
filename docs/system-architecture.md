# System Architecture

## Overview
This solution is designed as a university-linked digital platform with separate experiences for students, landlords, and university administrators.

```mermaid
flowchart TD
    A[Student Web/Mobile App] --> B[Frontend Web or Mobile]
    L[Landlord Portal] --> B
    U[University Admin Dashboard] --> B
    B --> C[Firebase Auth]
    B --> D[Firestore]
    B --> E[Firebase Storage]
    B --> F[Cloud Functions]
    F --> G[Reporting / Aggregation Jobs]
    D --> G
```

## Components
### 1. Frontend
- Student portal
- Landlord portal
- University admin dashboard

### 2. Backend services
- Authentication
- Listing moderation
- Complaint processing
- Aggregated residential analytics

### 3. Data and storage
- User profiles
- Properties
- Reviews
- Reports
- Area summaries

## Privacy note
The admin dashboard should show aggregated residential data by zone or neighborhood rather than exposing individual student residences publicly.
