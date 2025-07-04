import React, { useState, useEffect } from "react";
import { MoreVertical, Play, History } from "lucide-react";
import { timeAgo } from "../util/AgoTime";
import { Link } from "react-router-dom";

const YouTubePlaylists = () => {
  const HOST = import.meta.env.VITE_HOST;
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);

  const fetchPlaylists = async () => {
    setPlaylistsLoading(true);
    try {
      const response = await fetch(`${HOST}/api/v1/playLists/getMyPlayList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      const list = data.data.map((item) => {
        return {
          id: item._id,
          title: item.title,
          profile: item.owner.avatar,
          channel: item.owner.userName,
          type: "Playlist",
          videoCount: item.videos.length,
          thumbnail: item?.videos[0]?.thumbnail || "public/empty_img.jpg",
          isPrivate: !item.visibility,
          updatedDays: timeAgo(item.updatedAt),
        };
      });
      setPlaylists(list);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setTimeout(() => {
        setPlaylistsLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const PlaylistCard = ({ playlist }) => (
    <div className="bg-[#181818] rounded-xl overflow-hidden shadow hover:shadow-lg hover:bg-[#232323] transition group cursor-pointer border border-transparent hover:border-neutral-400 duration-1000">
      <div className="relative aspect-video bg-neutral-800">
        <img
          src={playlist.thumbnail}
          alt={playlist.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {/* Overlay Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
          <Play size={40} className="text-white drop-shadow-lg" />
        </div>
        {/* Video Count Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
          {playlist.videoCount > 0
            ? `${playlist.videoCount} videos`
            : playlist.views
            ? `${playlist.views} views`
            : "No videos"}
        </div>
        {/* Private Badge */}
        {playlist.isPrivate && (
          <div className="absolute top-2 left-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded">
            Private
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white text-base font-semibold line-clamp-2 mb-1">
          {playlist.title}
        </h3>
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <div>
            <div className="flex items-center">
              <img
                src={playlist.profile}
                alt={playlist.channel}
                className="w-5 h-5 rounded-full"
              />
              <span className="mx-1 font-medium">{playlist.channel}</span>
              <span className="mr-1">•</span>
              <span>{playlist.type}</span>
              {playlist.updatedDays && (
                <span className="ml-1"> • Updated {playlist.updatedDays}</span>
              )}
            </div>
          </div>
          <MoreVertical size={18} className="hover:text-white cursor-pointer" />
        </div>
        <div className="text-blue-400 text-xs mt-2 hover:underline cursor-pointer">
          View full playlist
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

        {/* Page title and tabs */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Playlists</h1>
          <div className="flex gap-6 border-b border-neutral-800"></div>
        </div>

        {/* Playlists grid */}
        {playlistsLoading ? (
          <div className="mt-30 w-full bg-neutral-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Getting playlist</p>
            </div>
          </div>
        ) : (
          <>
            {playlists && playlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            ) : (
              <div className="min-h-100 bg-neutral-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📺</div>
                  <h2 className="text-white text-2xl font-semibold mb-2">
                    No Playlists Yet
                  </h2>
                  <p className="text-gray-400 text-lg mb-6">
                    Start creating playlists to see them here
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

export default YouTubePlaylists;
