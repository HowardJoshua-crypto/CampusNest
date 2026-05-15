# Database Schema Overview

## Main collections / entities
### users
- UserID (Primary Key)
- Name
- fullName
- Email
- phone
- universityId
- verified
- DateJoined
- UserType (Student, Landlord, Admin, Welfare Officer, Security Officer)
- PasswordHash
- ProfileStatus (Active, Suspended, Pending Verification)


### studentProfiles
- StudentID (Primary Key, FK to UserID)
- Course/Department
- YearOfStudy
- Preferences (JSON or separate table for housing preferences)
- EmergencyContact
- gender(optional for privacy)

### landlordProfiles
- LandlordID (Primary Key, FK to UserID)
- VerifiedStatus (Boolean or enum: Pending, Verified, Rejected)
- IdentityDocuments (Links to uploaded IDs)
- OwnershipProofDocuments
- BackgroundCheckStatus
- VerificationDate

### properties
- ListingID (Primary Key)
- LandlordID (Foreign Key)
- Title
- Description
- Address
- Latitude
- Longitude
- PropertyType (Apartment, Shared Room, Entire House, Studio)
- NumberOfRooms
- Price
- AvailabilityStatus (Available, Booked, Not Available)
- VerifiedStatus (Pending, Verified, Rejected)
- Photos (Links to photo records)
- ListingDate
- LastUpdated

## ListingVerificationDocuments
- DocumentID (Primary Key)
- ListingID (Foreign Key)
- DocumentType (OwnershipProof, RentalPermit, Photos, etc.)
- DocumentURL
- UploadDate

### reviews
- ReviewID (Primary Key)
- ListingID (Foreign Key)
- StudentID (Foreign Key)
- LandlordID (Foreign Key)
- Rating (Numeric)
- Comments
- ReviewDate
- ReviewStatus (Visible, Hidden, Flagged)

### reports
- ReportID (Primary Key)
- ReporterID (Foreign Key)
- PropertyID (Foreign Key)
- Description
- ReportDate
- Status (Open, In Progress, Resolved)

### areaAnalytics
- areaName
- averageRent
- listingCount
- complaintCount
- safetyScore
- studentDensityEstimate
- updatedAt

## Booking
- BookingID (Primary Key)
- ListingID (Foreign Key)
- StudentID (Foreign Key)
- BookingDate
- Status (Pending, Confirmed, Cancelled)
- PaymentDetails (optional, if integrated)

## Message
- MessageID (Primary Key)
- SenderID (Foreign Key)
- ReceiverID (Foreign Key)
- ListingID (Foreign Key, optional)
- MessageContent
- Timestamp
- ReadStatus

## AdminDashboardData
- AreaID
- NumberOfStudentsLiving
- NumberOfListings
- SafetyIncidents
- WelfareInterventions

## Amenities
- AmenityID (Primary Key)
- Name
- Description

## ListingAmenities
- ListingID (Foreign Key)
- AmenityID (Foreign Key)



