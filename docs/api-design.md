# API Design Notes

## Core resources
- `/auth`
- `/students`
- `/landlords`
- `/properties`
- `/listings`
- `/reviews`
- `/reports`
- `/analytics`

## Example operations
### Listings
- `GET /listings`
- `GET /listings/:id`
- `POST /listings`
- `PATCH /listings/:id`
- `POST /listings/:id/verify`

### Reviews
- `POST /properties/:id/reviews`
- `GET /properties/:id/reviews`

### Reports
- `POST /reports`
- `GET /reports?status=open`

### Analytics
- `GET /analytics/areas`
- `GET /analytics/rent-trends`
- `GET /analytics/complaint-categories`


