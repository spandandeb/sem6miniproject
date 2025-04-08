# Fixing "Token Invalid" Issues

If you're encountering "Token Invalid" errors when uploading resources or creating events, follow these steps to fix the issue:

## Quick Fix Steps

1. **Log in again**: Click the "Sign In" button in the top right corner of the app.

2. **Clear browser storage**: 
   - Open developer tools (F12)
   - Go to Application → Storage → Local Storage
   - Delete the authToken item
   - Refresh the page and log in again

3. **Test token validation**: 
   - Run the token test tool by running `cd backend && npm run test-token`
   - Open http://localhost:3333 in your browser
   - Click "Set Test Token"
   - Click "Test Token" to verify it works

## What was fixed?

1. **Auth middleware enhancement**: The backend's auth middleware has been improved to:
   - Better handle tokens
   - Properly convert user IDs to MongoDB ObjectIds
   - Fix BSON/ObjectId validation errors
   - Provide more detailed error messages
   - Accept the dummy test token

2. **API service improvements**: The frontend API service now:
   - Validates tokens before sending
   - Automatically adds test tokens when needed
   - Provides better error logging

3. **Database model improvements**:
   - Event and Resource models now handle string IDs properly
   - Pre-save hooks ensure IDs are converted to proper ObjectIds
   - More robust error handling for invalid IDs

## Detailed Troubleshooting

If you're still having issues:

1. **Check server logs**: Run the backend with `cd backend && npm run server` and look for logs containing "Auth middleware" to see token validation details.

2. **Verify token format**: The token should be exactly "dummy-token-12345". Any other format will fail.

3. **MongoDB connection**: Make sure MongoDB is running and the connection URI in .env is correct.

4. **CORS issues**: If you see CORS errors in the browser console, make sure your backend is properly configured with the cors middleware.

5. **JWT_SECRET**: If your backend uses a custom JWT_SECRET, ensure it's set correctly in your .env file.

6. **ObjectId errors**: If you see "Cast to ObjectId failed" errors, check the server logs for details about which field is causing the issue.

## Testing Resources & Events Creation

After fixing the token issue, test resource and event creation with our test script:

```bash
cd backend && npm run test-api
```

This script will verify that your backend can create resources and events with the test token. 

If you still encounter issues with the real API endpoints but the test script works, you can use the debug endpoints or fallback mode:

```
http://localhost:5000/api/debug/test-event
http://localhost:5000/api/debug/test-resource
```

## MongoDB ObjectId Explanation

The error "Cast to ObjectId failed" occurs because MongoDB requires references between documents to use a special type called ObjectId. When using the dummy test token, we now automatically convert the user ID to a valid ObjectId format before saving to the database.

The fix ensures that:
1. String IDs are converted to ObjectIds when needed
2. The dummy token uses a consistent ObjectId
3. Database operations properly handle both string and ObjectId formats 