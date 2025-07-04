# History API Endpoints

To implement the history functionality, you need to create the following backend API endpoints:

## 1. Record Watch History
**Endpoint:** `POST /api/v1/videos/recordWatchHistory/:videoId`

**Description:** Records when a user watches a video

**Request:**
- Method: POST
- Headers: Content-Type: application/json
- Authentication: Required (cookies/session)
- Body: None

**Response:**
```json
{
  "statusCode": 200,
  "message": "Watch history recorded successfully",
  "data": {
    "_id": "history_id",
    "user": "user_id",
    "video": "video_id",
    "watchedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 2. Get User History
**Endpoint:** `GET /api/v1/videos/getUserHistory`

**Description:** Retrieves the watch history for the current user

**Request:**
- Method: GET
- Headers: Content-Type: application/json
- Authentication: Required (cookies/session)

**Response:**
```json
{
  "statusCode": 200,
  "message": "History retrieved successfully",
  "data": [
    {
      "_id": "history_id",
      "user": "user_id",
      "video": {
        "_id": "video_id",
        "title": "Video Title",
        "description": "Video Description",
        "thumbnail": "thumbnail_url",
        "videoFile": "video_url",
        "duration": 120,
        "views": 1000,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "owner": {
          "_id": "owner_id",
          "userName": "channel_name",
          "avatar": "avatar_url"
        }
      },
      "watchedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Database Schema

You'll need to create a `WatchHistory` collection/table with the following structure:

```javascript
// MongoDB Schema Example
const watchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  watchedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add indexes for better performance
watchHistorySchema.index({ user: 1, watchedAt: -1 });
watchHistorySchema.index({ user: 1, video: 1 }, { unique: true });
```

## Implementation Notes

1. **Duplicate Prevention:** The history should prevent duplicate entries for the same user watching the same video multiple times. Instead, update the `watchedAt` timestamp.

2. **History Limit:** Consider implementing a limit on the number of history entries per user (e.g., keep only the last 1000 watched videos).

3. **Privacy:** Ensure that users can only access their own watch history.

4. **Performance:** Use pagination for large history lists and implement proper indexing.

## Example Backend Implementation (Node.js/Express)

```javascript
// Record watch history
router.post('/recordWatchHistory/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id; // From authentication middleware

    // Check if history entry already exists
    let historyEntry = await WatchHistory.findOne({ user: userId, video: videoId });
    
    if (historyEntry) {
      // Update existing entry
      historyEntry.watchedAt = new Date();
      await historyEntry.save();
    } else {
      // Create new entry
      historyEntry = new WatchHistory({
        user: userId,
        video: videoId,
        watchedAt: new Date()
      });
      await historyEntry.save();
    }

    res.status(200).json({
      statusCode: 200,
      message: "Watch history recorded successfully",
      data: historyEntry
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error recording watch history",
      error: error.message
    });
  }
});

// Get user history
router.get('/getUserHistory', async (req, res) => {
  try {
    const userId = req.user._id; // From authentication middleware

    const history = await WatchHistory.find({ user: userId })
      .populate('video')
      .populate('video.owner', 'userName avatar')
      .sort({ watchedAt: -1 })
      .limit(50); // Limit to recent 50 videos

    res.status(200).json({
      statusCode: 200,
      message: "History retrieved successfully",
      data: history
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error retrieving history",
      error: error.message
    });
  }
});
```

## Frontend Integration

The frontend is already set up to use these endpoints:

1. **Recording History:** Called automatically when a user loads a video page
2. **Displaying History:** Called when the user navigates to the History tab
3. **Navigation:** History link is available in the sidebar for authenticated users

The implementation includes:
- Loading states
- Error handling
- Empty state display
- Responsive grid layout
- Video cards with watch timestamps 