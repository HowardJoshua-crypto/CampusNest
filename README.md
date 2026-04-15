# Campus Housing Intelligence System

A university-integrated student accommodation platform that helps students find verified off-campus housing while giving university administrators residential insights for planning, welfare, safety, and policy support.

## Why this project exists
Students, especially freshers, often struggle to find safe, affordable, and trustworthy accommodation near campus. They face scams, middlemen, poor living conditions, and limited verified information. Universities also lack structured visibility into off-campus student residence patterns, which weakens planning for welfare, transport, safety coordination, and housing policy.

## What the platform does
The system functions as an official student accommodation portal that can be linked under the university website.

### Student-facing
- Search verified housing listings
- Filter by price, distance, and area
- View photos, amenities, and landlord details
- Read student reviews and ratings
- Report safety or welfare issues
- Save and compare accommodation options

### University-facing
- View residential area trends in an admin dashboard
- Understand where students are concentrated
- Track common housing complaints and risk patterns
- Support policy decisions around off-campus housing
- Produce welfare and planning reports

## Recommended stack
### Frontend
- **Web admin + housing portal:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Maps:** Leaflet with OpenStreetMap or Google Maps

### Mobile
- **Student mobile app:** React Native with Expo

### Backend / Platform
- **Authentication:** Firebase Auth
- **Database:** Firestore
- **Storage:** Firebase Storage
- **Server logic:** Firebase Functions
- **Analytics exports:** Cloud Functions + scheduled reports

## Monorepo structure
```text
campus-housing-intelligence-system/
├── .github/
├── apps/
│   ├── mobile/
│   └── web/
├── database/
├── docs/
├── packages/
│   └── shared/
├── services/
│   └── firebase-functions/
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

## Getting started
### 1. Clone the repo
```bash
git clone <your-repo-url>
cd campus-housing-intelligence-system
```

### 2. Install dependencies
This repo is prepared as a workspace monorepo.
```bash
npm install
```

### 3. Copy environment variables
```bash
cp .env.example .env
```
Then update the Firebase and map keys.

### 4. Start with documentation-first delivery
Before building screens, finalize:
- Business statement
- Product requirements
- Core user roles
- Data model
- MVP feature list

## Roles
- **Student**
- **Landlord / Property manager**
- **University administrator**
- **Student welfare officer**
- **System administrator**

## MVP scope
### Must have
- User authentication
- Verified property listings
- Listing review and approval flow
- Search and filter by area / price / distance
- Student reviews
- Admin dashboard for area-level insights
- Incident / complaint reporting

### Later
- In-app booking workflow
- Payments / reservation deposits
- AI housing recommendations
- Emergency cluster alerts
- Semester trend forecasting

## Suggested first milestones
1. Finalize requirements and scope
2. Design Firestore collections
3. Build admin dashboard skeleton
4. Build listing submission and moderation flow
5. Build student housing discovery flow
6. Add analytics and reporting
7. Prepare pilot deployment with one university

## Git workflow
### Create repository
```bash
git init
git add .
git commit -m "chore: initialize campus housing intelligence system"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Feature branch flow
```bash
git checkout -b feat/admin-dashboard
# work on your changes
git add .
git commit -m "feat: add admin dashboard requirements"
git push -u origin feat/admin-dashboard
```

## Documentation index
- [Business statement](docs/business-statement.md)
- [Product requirements](docs/product-requirements.md)
- [System architecture](docs/system-architecture.md)
- [API design](docs/api-design.md)
- [Roadmap](docs/roadmap.md)
- [Database schema overview](database/schema-overview.md)

## License
MIT
