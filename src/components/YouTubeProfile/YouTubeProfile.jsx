import React from "react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Header, SlideBar } from "../index";
import { timeAgo } from "../util/AgoTime";
import { getCurrentUser } from "../../context/UserContext";
import { MoreVertical, Play, History } from "lucide-react";

function YouTubeProfile() {
  const HOST = import.meta.env.VITE_HOST;
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("videos");
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  let [videos, setVideos] = useState([]);
  const [noOfVideo, setNoOfVideo] = useState(0);
  const currentUser = getCurrentUser();
  const [alertMsg, setAlertMsg] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [totalView, setTotalViews] = useState(0);
  const { userName } = useParams();

  useEffect(() => {
    document.title = userName;
    // if (window.innerWidth <= 720) setSidebarOpen(false);
    document.title = "Youtube Clone";
    fetchUserProfile();
    fetchUserVideos();
    fetchPlaylists();
    // fetchCurrentUser();
    // //console.log(videos);
  }, [setVideos, userName, currentUser]);

  const fetchPlaylists = async () => {
    setPlaylistsLoading(true);
    try {
      const response = await fetch(
        `${HOST}/api/v1/playLists/getChannelPlaylists/${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      const list = data.data.map((item) => {
        return {
          id: item._id,
          title: item.title,
          profile: item.owner.avatar,
          channel: item.owner.userName,
          type: "Playlist",
          videoCount: item.videos.length,
          thumbnail: item?.videos[0]?.thumbnail || "../../empty_img.jpg",
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

  const fetchUserVideos = async () => {
    try {
      setVideosLoading(true);
      const response = await fetch(
        `${HOST}/api/v1/videos/getChannelVideos/${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.message);
      }
      const videosData = resData.data;
      setNoOfVideo(videosData?.length || 0);
      const newVideos =
        videosData &&
        videosData.map((video) => {
          setTotalViews((prev) => prev + video.views);
          return {
            id: video._id,
            title: video.title,
            thumbnail: video.thumbnail,
            video: video.videoFile,
            views:
              video.views > 1000
                ? `${(video.views / 1000).toFixed(1)}k`
                : video.views,
            uploadDate: timeAgo(video.createdAt),
            duration:
              Math.round(Math.floor(video.duration) / 60) +
              ":" +
              (Math.floor(video.duration) % 60 < 10 ? "0" : "") +
              (Math.floor(video.duration) % 60),
          };
        });
      setVideos(newVideos);
    } catch (error) {
      setVideos([]);
      console.error("Error fetching profile:", error);
    } finally {
      setTimeout(() => {
        setVideosLoading(false);
      }, 1000);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${HOST}/api/v1/users/${
          currentUser ? "getChannelProfile" : "getChannelProfileUnknownUser"
        }/${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      )
        .then((data) => data.json())
        .then((data) => data.data)
        .then((data) => {
          // console.log(data);
          setUserProfile(data);
        });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to sample data for demo
      setUserProfile({
        _id: "0",
        userName: "not found",
        email: "not found",
        fullName: "not found",
        avatar: "not found",
        coverImage: "not found",
        subscribersCount: 0,
        subscribedCount: 0,
        isSubscribed: false,
      });
      setLoading(false);
    }
  };

  // TODO
  const handleSubscribe = async () => {
    try {
      setUserProfile((prev) => ({
        ...prev,
        isSubscribed: !prev.isSubscribed,
        subscribersCount: prev.isSubscribed
          ? prev.subscribersCount - 1
          : prev.subscribersCount + 1,
      }));
      const response = await fetch(
        `${HOST}/api/v1/subscriptions/toggleSubscribe/${userProfile._id}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      const result = await response.json();
      if (result.success) {
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };

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

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen w-full bg-neutral-900/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {alertMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="py-10 sm:py-15 px-20 sm:px-30 bg-black rounded-xl shadow-lg text-white">
            <div className="flex justify-center">
              <h2 className="flex justify-centertext-xl font-semibold mb-4 text-xl">
                login Required
              </h2>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setAlertMsg(false)}
                className="px-4 py-2 bg-neutral-600 active:bg-neutral-800 text-white rounded"
              >
                Close
              </button>
              <button
                onClick={() => navigate("../login")}
                className=" px-4 py-2 bg-neutral-600 active:bg-neutral-800 text-white rounded"
              >
                login
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="relative">
        <div className="14 min-h-screen bg-neutral-900/100 text-white">
          <div className="relative h-48 md:h-64 lg:h-80 overflow-hidden">
            <img
              src={userProfile.coverImage}
              t="Cover"
              className="w-screen h-full object-cover"
              onError={(e) => {
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = "true";
                  e.target.src = "/fallbacks/cover-placeholder.png"; // Use local image
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
          </div>

          {/* Profile Header */}
          <div className="container mx-auto px-4 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
              {/* Avatar */}
              <div className="relative group">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.fullName}
                  className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-white shadow-lg object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = "true";
                      e.target.src = "/fallbacks/avatar-placeholder.png";
                    }
                  }}
                />
                {userProfile.isSubscribed && (
                  <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
                    ✓ Subscribed
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl font-extrabold mb-1 truncate flex items-center gap-2">
                  {userProfile.fullName}
                  {/* {userProfile.isVerified && <VerifiedIcon />} */}
                </h1>
                <p className="text-neutral-400 mb-2 text-lg">
                  @{userProfile.userName}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-base text-neutral-300 mb-4">
                  <span>
                    <span className="font-semibold">
                      {userProfile.subscribersCount.toLocaleString()}
                    </span>{" "}
                    subscribers
                  </span>
                  <span className="opacity-50">•</span>
                  <span>{userProfile.subscribedCount} subscribed</span>
                  <span className="opacity-50">•</span>
                  <span>{noOfVideo} Videos</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {currentUser &&
                  currentUser.userName == userProfile.userName ? (
                    <Link
                      to="../video/uploadVideo"
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 bg-neutral-700 hover:bg-neutral-600 text-white stroke-3`}
                    >
                      Upload Videos
                    </Link>
                  ) : (
                    <button
                      onClick={() =>
                        currentUser ? handleSubscribe() : setAlertMsg(true)
                      }
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-100 transform hover:scale-105 ${
                        userProfile.isSubscribed
                          ? "bg-neutral-700 text-white hover:bg-neutral-600"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }
                      `}
                    >
                      {userProfile.isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  )}
                  <button className="px-6 py-2 rounded-full font-medium bg-neutral-700 hover:bg-neutral-600 text-white shadow transition">
                    Join
                  </button>
                  {currentUser &&
                  userProfile.userName == currentUser.userName ? (
                    <Link to="../logout">
                      <button className="px-6 py-2 bg-neutral-700 text-white rounded-full font-medium hover:bg-neutral-600 transition-colors">
                        Logout
                      </button>
                    </Link>
                  ) : (
                    <></>
                  )}

                  {/* <button className="p-2 bg-neutral-700 text-white rounded-full hover:bg-neutral-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button> */}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-700 mb-8">
              <nav className="flex space-x-8">
                {["videos", "playlists", "about"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-1 border-b-2 font-semibold text-base uppercase tracking-wide transition-colors ${
                      activeTab === tab
                        ? "border-red-500 text-white"
                        : "border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="pb-12">
              {activeTab === "videos" && 
              (videosLoading ? (
                <div className="mt-30 w-full bg-neutral-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Getting videos</p>
                  </div>
                </div>
              ):(
                <>
                  {videos && videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <Link to={`/video/${video.id}`} key={video.id}>
                        <div className="group cursor-pointer bg-neutral-900 rounded-xl shadow hover:shadow-xl hover:bg-neutral-800 transition duration-200">
                          <div className="relative mb-3 overflow-hidden rounded-t-xl">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                              {video.duration}
                            </div>
                          </div>
                          <div className="px-3 pb-3">
                            <h3 className="text-base font-semibold break-words max-w-full leading-tight line-clamp-2 transition-colors">
                              {video.title}
                            </h3>
                            <div className="text-xs text-neutral-400 mt-1">
                              {video.views} views • {video.uploadDate}
                            </div>
                          </div>
                        </div>
                      </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="min-h-100 bg-neutral-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📺</div>
                        <h2 className="text-white text-2xl font-semibold mb-2">
                          No Videos Yet
                        </h2>
                      </div>
                    </div>
                  )}
                </>
              ) 
              )}
              {activeTab === "playlists" &&
                (playlistsLoading ? (
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
                        </div>
                      </div>
                    )}
                  </>
                ))}
              {activeTab === "about" && (
                <div className="max-w-4xl bg-neutral-800 rounded-xl p-8 mb-6 shadow">
                  <h3 className="text-xl font-bold mb-4">Description</h3>
                  <p className="text-neutral-300 mb-4">
                    {userProfile.description || "No description provided."}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                      <h4 className="font-medium mb-3">Channel Details</h4>
                      <div className="space-y-2 text-sm text-white">
                        <p>📧 {userProfile.email}</p>
                        <p>👤 @{userProfile.userName}</p>
                        <p>📅 Joined January 2025</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Stats</h4>
                      <div className="space-y-2 text-sm text-white">
                        <p>{userProfile.subscribersCount} subscribers</p>
                        <p>{userProfile.subscribedCount} subscriptions</p>
                        <p>
                          {totalView > 1000
                            ? `${(totalView / 1000).toFixed(1)}k`
                            : totalView}{" "}
                          total Views
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* {["shorts", "playlists", "community"].includes(activeTab) && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📺</div>
                  <h3 className="text-xl font-medium mb-2">
                    No {activeTab} yet
                  </h3>
                  <p className="text-white">This section is coming soon!</p>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default YouTubeProfile;
