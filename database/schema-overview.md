# Database Schema Overview

## Main collections / entities
### users
- id
- role
- fullName
- email
- phone
- universityId
- verified
- createdAt

### studentProfiles
- userId
- yearOfStudy
- faculty
- gender (optional, privacy-aware)
- preferredBudgetRange
- preferredAreas

### landlordProfiles
- userId
- nationalIdNumber
- verificationStatus
- companyName

### properties
- id
- landlordId
- title
- description
- locationName
- latitude
- longitude
- rentAmount
- amenities
- imageUrls
- verificationStatus
- createdAt

### reviews
- id
- propertyId
- studentId
- rating
- comment
- createdAt

### reports
- id
- submittedBy
- propertyId
- category
- severity
- description
- status
- createdAt

### areaAnalytics
- areaName
- averageRent
- listingCount
- complaintCount
- safetyScore
- studentDensityEstimate
- updatedAt
