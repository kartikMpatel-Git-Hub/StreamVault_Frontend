import React, { useState, useEffect } from "react";
import { History } from "lucide-react";
import { timeAgo } from "../util/AgoTime";
import { Link } from "react-router-dom";

const YouTubeLikevideo = () => {
  const HOST = import.meta.env.VITE_HOST;
  const [likeVideos, setLikeVideos] = useState([]);
  const [likeVideosLoading, setLikeVideosLoading] = useState(false);

  const fetchHistory = async () => {
    setLikeVideosLoading(true);
    try {
      const response = await fetch(`${HOST}/api/v1/users/getLikedVideos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        const historyList = data.data.map((item) => {
          return {
            id: item.videos._id,
            title: item.videos.title,
            channel: item.videos.owner.userName,
            views:
              item.videos.views > 1000
                ? `${(item.videos.views / 1000).toFixed(1)}k`
                : item.videos.views,
            time: timeAgo(item.videos.createdAt),
            thumbnail: item.videos.thumbnail,
            duration:
              Math.round(Math.floor(item.videos.duration) / 60) +
              ":" +
              (Math.floor(item.videos.duration) % 60 < 10 ? "0" : "") +
              (Math.floor(item.videos.duration) % 60),
            avatar: item.videos.owner.avatar,
            watchedAt: timeAgo(item.videos.updatedAt),
          };
        });
        setLikeVideos(historyList);
      } else {
        setLikeVideos([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setLikeVideos([]);
    } finally {
      setTimeout(() => {
        setLikeVideosLoading(false);
      }, 1000);
    }
  };
  useEffect(() => {
    fetchHistory();
  }, []);

  if (likeVideos === null) {
    return (
      <div className="min-h-screen w-full bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Getting Liked Videos</p>
        </div>
      </div>
    );
  }

  const HistoryVideoCard = ({ video }) => (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-200 cursor-pointer min-w-0 bg-transparent">
      <a
        href={`../video/${video.id}`}
        className="relative block aspect-[16/9] w-full"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover rounded-t-2xl"
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </span>
      </a>
      <div className="p-4">
        <div className="flex gap-3">
          <a href={`getChannelProfile/${video.channel}`}>
            <img
              src={video.avatar}
              alt={video.channel}
              className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
            />
          </a>
          <div className="flex-1 min-w-0">
            <a href={`../video/${video.id}`}>
              <h3 className="text-base font-semibold text-white line-clamp-2">
                {video.title}
              </h3>
              <p className="text-gray-300 text-sm truncate">{video.channel}</p>
              <p className="text-gray-400 text-xs truncate">
                {video.views} views • {video.time}
              </p>
              <p className="text-gray-500 text-xs truncate">
                Watched {video.watchedAt}
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-900 text-white min-h-screen flex">
      {/* Sidebar */}

      {/* Main content */}
      <div className="flex-1 p-6 md:mx-50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Liked Videos</h1>
          <div className="flex gap-6 border-b border-neutral-800"></div>
        </div>
        {likeVideosLoading ? (
          <div className="mt-30 w-full bg-neutral-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Getting History</p>
            </div>
          </div>
        ) : (
          <>          
          {likeVideos && likeVideos.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6 justify-center">
              {likeVideos.map((video) => (
                <HistoryVideoCard key={video.id} video={video} />
              ))}
            </div>
            ) : (
              <div className="min-h-100 bg-neutral-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📺</div>
                  <h2 className="text-white text-2xl font-semibold mb-2">
                    No Liked Videos Yet
                  </h2>
                  <p className="text-gray-400 text-lg mb-6">
                    Start liking videos to see them here
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 bg-neutral-700 text-white rounded-full hover:bg-neutral-600 transition-colors duration-200"
                  >
                    Explore Videos
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default YouTubeLikevideo;
