# Fixing Server Error in AlumniConnect

If you're encountering server errors when uploading resources or creating events, follow these steps to diagnose and fix the issues.

## Quick Fix Steps

1. **Restart the server with better error handling**
   - The server code has been updated with improved error handling
   - Run: `cd backend && npm run server`
   - Look for any startup errors, especially MongoDB connection issues

2. **Use the fallback mode**
   - The frontend has been updated to work even if the server has issues
   - It will automatically use local storage for resources/events if needed
   - You will see a console message: "Using fallback implementation..."

3. **Run the debug tool**
   ```bash
   cd backend && npm run debug
   ```
   - The debug tool provides a menu to test different API endpoints
   - Use it to precisely identify which part of the system is failing

## Common Server Errors and Solutions

### MongoDB Connection Issues
- Error: "MongoDB connection error"
- Fix: Check that your MongoDB is running and the connection string in `.env` is correct
- The app now uses a fallback database if MongoDB isn't available

### JWT Secret Issues
- Error: "JWT_SECRET is not defined" 
- Fix: The app now provides a fallback JWT secret automatically
- For better security, add `JWT_SECRET=your-secret-key` to your `.env` file

### CORS Errors
- Error: "Access-Control-Allow-Origin" related errors in console
- Fix: The server has been updated with more permissive CORS settings
- It now accepts requests from localhost:5173 and other common development URLs

### Express Server Errors
- Error: 500 Internal Server Error
- Fix: Check the server logs for the specific error message
- Added enhanced logging to pinpoint the exact cause of server errors

## Using the Diagnostic Tools

We've added several diagnostic tools to help you debug:

1. **Server Debug Tool** - Interactive testing tool
   ```bash
   cd backend && npm run debug
   ```

2. **Token Test Tool** - Test authentication
   ```bash
   cd backend && npm run test-token
   ```

3. **API/Database Test** - Test API connectivity
   ```bash
   cd backend && npm run test-api
   ```

## Fallback Mode

The application now includes a fallback mode that works even when the server is unavailable:

- Resources and events can be created locally
- They'll be stored in browser memory
- They won't persist between page refreshes
- They'll be marked with "isLocalOnly: true"

This allows you to continue development and testing of the UI even if the backend is having issues.

## Need More Help?

If you're still encountering server errors:

1. Check the server console for detailed error messages
2. Look at the browser console for API-related errors
3. Use the debug tool to test specific endpoints
4. Try clearing your browser cache and local storage 