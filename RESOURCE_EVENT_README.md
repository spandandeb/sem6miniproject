# AlumniConnect Resource and Event Management

This document provides information on how to use the Resource Library and Event Management features in the AlumniConnect application.

## Setup

1. Make sure MongoDB is running and accessible
2. Ensure your `.env` file in the `backend` directory has the correct MongoDB connection string
3. Start the backend server: `cd backend && npm run server`
4. Start the frontend: `npm run dev`

## Testing Database Connectivity

To test if your database is properly connected and the resource/event APIs are working:

```bash
cd backend
npm test
```

This will run the diagnostic tool that checks:
1. Database connectivity
2. Resource API functionality 
3. Event API functionality

## Resource Library

The Resource Library allows users to:
- Browse existing resources
- Filter by category (Learning Materials, Resume Templates, etc)
- Search for resources
- View resource details
- Download resources
- Upload new resources (for authenticated users)
- Rate and review resources

### Uploading Resources

1. Log in to the application
2. Navigate to the Resource Library page
3. Click the "Upload Resource" button
4. Fill in the required information:
   - Title
   - Description
   - Category
   - Industry (for Learning Materials)
   - File URL (link to your resource file)
   - Optional: Thumbnail URL
   - Optional: Tags (comma-separated)
5. Click "Upload Resource"

## Event Management

The Event Management system allows users to:
- Browse upcoming and past events
- Filter by event type (Mentoring Sessions, Workshops, etc)
- View event details
- Register for events
- Create new events (for authenticated users)

### Creating Events

1. Log in to the application
2. Navigate to the Events page
3. Click the "Create Event" button
4. Fill in the required information:
   - Title
   - Description
   - Event Type
   - Start and End Time
   - Location (physical address or "Online")
   - Meeting Link (for online events)
   - Capacity (maximum number of attendees)
   - Optional: Tags (comma-separated)
   - Optional: Image URL
5. Click "Create Event"

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Check that MongoDB is running
2. Verify your connection string in the `.env` file
3. Run the diagnostic tool: `cd backend && npm test`

### API Issues

If the APIs are not working correctly:

1. Check the backend console for error messages
2. Verify that the server is running on port 5000
3. Make sure your auth token is being properly set when logging in

## API Endpoints

### Resource API

- `GET /api/resources` - Get all resources (with optional filtering)
- `GET /api/resources/:id` - Get a specific resource
- `POST /api/resources` - Create a new resource (auth required)
- `PUT /api/resources/:id` - Update a resource (auth required)
- `DELETE /api/resources/:id` - Delete a resource (auth required)
- `POST /api/resources/:id/download` - Register a download
- `POST /api/resources/:id/review` - Add a review/rating (auth required)

### Event API

- `GET /api/events` - Get all events (with optional filtering)
- `GET /api/events/:id` - Get a specific event
- `POST /api/events` - Create a new event (auth required)
- `PUT /api/events/:id` - Update an event (auth required)
- `DELETE /api/events/:id` - Delete an event (auth required)
- `POST /api/events/:id/register` - Register for an event (auth required)
- `POST /api/events/:id/cancel` - Cancel registration (auth required) 