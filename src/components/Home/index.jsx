import React, { useEffect, useState } from "react";
import { data, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../util/AgoTime.js";
import {
  CircleAlert,
  EllipsisVertical,
  Earth,
  LockKeyhole,
  X,
  Plus,
} from "lucide-react";
import { getCurrentUser } from "../../context/UserContext.js";
import {
  handleAddToPlaylist,
  handleRemoveFromPlaylist,
} from "../util/PlaylistOperations.js";

const Index = () => {
  const HOST = import.meta.env.VITE_HOST;
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [serverStarted, setServerStarted] = useState(false);
  const [videos, setVideos] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [addToPlaylist, setAddToPlaylist] = useState(false);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    title: "",
    description: "",
    visibility: "private",
  });
  const [pointedVideoId, setPointedVideoId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [alertMsg, setAlertMsg] = useState(false);

  const toggleStatus = (playlist, pointedVideoId) => {
    if (playlist.isVideoAvailable) {
      if (
        handleRemoveFromPlaylist(
          playlist,
          pointedVideoId,
          setAllPlaylists,
          HOST
        )
      ) {
        setToastMsg({
          message: `video Removed From ${playlist.title}`,
          undo: () =>
            handleAddToPlaylist(
              playlist,
              pointedVideoId,
              setAllPlaylists,
              HOST
            ),
          playlist: playlist.id,
        });
      }
    } else {
      if (
        handleAddToPlaylist(playlist, pointedVideoId, setAllPlaylists, HOST)
      ) {
        setToastMsg({
          message: `video Added To ${playlist.title}`,
          undo: () =>
            handleRemoveFromPlaylist(
              playlist,
              pointedVideoId,
              setAllPlaylists,
              HOST
            ),
          playlist: playlist.id,
        });
      }
    }
    handleCancel();
    setTimeout(() => setToastMsg(null), 2000);
    fetchPlaylists();
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch(`${HOST}/api/v1/playLists/getMyPlayList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      let data = await response.json();
      // console.log(data.data);
      setAllPlaylists(data.data);
    } catch (error) {
      setAllPlaylists([]);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.title.trim() || !newPlaylist.description.trim()) return;

    // Add your playlist creation logic here (e.g. POST request)
    let response = await fetch(`${HOST}/api/v1/playLists/createPlayList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newPlaylist),
    });
    let playList = await response.json();
    handleAddToPlaylist(
      { id: playList.data._id, title: newPlaylist.title },
      pointedVideoId,
      setAllPlaylists,
      HOST
    );
    setAllPlaylists((prev) => [...prev, playList.data]);
    setToastMsg({
      message: `video Added In ${newPlaylist.title}`,
      undo: null,
    });
    setNewPlaylist({ title: "", description: "", visibility: "private" });
    handleCancel();
  };

  const handlePlaylist = (videoId) => {
    const playLists = allPlaylists.map((playlist) => {
      return {
        id: playlist._id,
        title: playlist.title,
        isVideoAvailable: new Set(
          playlist.videos.map((video) => video._id.toString())
        ).has(videoId.toString()),
        public: playlist.visibility,
      };
    });
    setPlaylists(playLists);
    setAddToPlaylist(true);
    setPointedVideoId(videoId);
  };

  const handleCancel = () => {
    setAddToPlaylist(false);
    setShowCreateForm(false);
    setPlaylists([]);
    setTimeout(() => {
      setPointedVideoId(null);
    }, 2000);
  };

  const fetchVideos = async () => {
    setServerStarted(false);
    try {
      const response = await fetch(`${HOST}/api/v1/videos/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.status == 401) navigate("../login");
      let api = await response.json();
      if (api.statusCode == 200) {
        api = api.data;
        const videos = api.map((video) => {
          return {
            id: video._id,
            title: video.title,
            channel: video.owner.userName,
            views:
              video.views > 1000
                ? `${(video.views / 1000).toFixed(1)}k`
                : video.views,
            time: timeAgo(video.createdAt),
            thumbnail: video.thumbnail,
            duration:
              Math.round(Math.floor(video.duration) / 60) +
              ":" +
              (Math.floor(video.duration) % 60 < 10 ? "0" : "") +
              (Math.floor(video.duration) % 60),
            avatar: video.owner.avatar,
          };
        });
        setVideos(videos);
        setServerStarted(true);
      } else {
        setVideos([]);
      }
    } catch (error) {
      setVideos([]);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isOnline) return;
    document.title = "Stream Vault";
    fetchVideos();
    fetchPlaylists();
  }, []);
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  if (!isOnline) {
    return (
      <div className="w-full min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            Check Your Network Connection And Referesh
          </p>
        </div>
      </div>
    );
  }

  if (!serverStarted) {
    return (
      <div className="min-h-100 w-full bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Videos...</p>
        </div>
      </div>
    );
  }
  const VideoCard = ({ video }) => (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-200 cursor-pointer min-w-0 bg-transparent">
      <Link
        to={`../video/${video.id}`}
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
      </Link>
      <div className="p-4">
        <div className="flex gap-3">
          <Link to={`getChannelProfile/${video.channel}`}>
            <img
              src={video.avatar}
              alt={video.channel}
              className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`../video/${video.id}`}>
              <h3 className="text-base font-semibold text-white line-clamp-2">
                {video.title}
              </h3>
              <p className="text-gray-300 text-sm truncate">{video.channel}</p>
              <p className="text-gray-400 text-xs truncate">
                {video.views} views • {video.time}
              </p>
            </Link>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              id={`fab-toggle-${video.id}`}
              className="peer hidden"
            />
            <div
              className="absolute top-10 right-0 z-10 flex flex-col items-stretch min-w-[170px]
               bg-neutral-900 rounded-lg shadow-lg overflow-hidden
               opacity-0 scale-95 pointer-events-none transition-all duration-300 
               peer-checked:opacity-100 peer-checked:scale-100 peer-checked:pointer-events-auto"
            >
              <button
                onClick={() =>
                  currentUser ? handlePlaylist(video.id) : setAlertMsg(true)
                }
                className="px-4 py-2 text-left text-sm text-white hover:bg-neutral-700 transition"
              >
                Add To Playlist
              </button>
            </div>
            <label
              htmlFor={`fab-toggle-${video.id}`}
              className="cursor-pointer w-9 h-9 flex items-center justify-center hover:bg-gray-700 text-white rounded-full shadow transition"
            >
              <EllipsisVertical className="w-5 h-5" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full flex justify-center min-h-screen bg-neutral-900 border-white">
        {/* Header */}
        <div className="flex mt-2">
          {/* Main Content */}
          <main className="flex-1 text-neutral-800">
            <div className="p-4 lg:p-6">
              {
                // videos
                videos?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 lg:gap-4 justify-center">
                    {videos.map((video) => (
                      <VideoCard video={video} key={video.id} />
                    ))}
                  </div>
                ) : (
                  <div className="min-h-80 bg-neutral-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-4">📺</div>
                      <h2 className="text-white text-2xl font-semibold mb-2">
                        No Videos Yet
                      </h2>
                    </div>
                  </div>
                )
              }
            </div>
          </main>
        </div>
      </div>
      {addToPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="px-5 py-5 bg-neutral-900 rounded-xl shadow-lg text-white">
            <div className="flex justify-center mb-4 gap-3">
              <h2 className="flex justify-centertext-xl font-semibold text-xl">
                save video to...
              </h2>
              <button
                onClick={() => handleCancel()}
                className="active:bg-neutral-800 text-white rounded"
              >
                <X className="font-light" />
              </button>
            </div>
            <div className="flex-row justify-center p-3">
              {playlists.map((playlist) => (
                <div className="flex mb-3" key={playlist.id}>
                  <input
                    type="checkbox"
                    className="w-5 justify-start bg-neutral-900"
                    onChange={() => {
                      toggleStatus(playlist, pointedVideoId);
                    }}
                    checked={playlist.isVideoAvailable}
                  />
                  <div className="py-2 px-10">{playlist.title}</div>
                  <div className="py-2 ml-auto">
                    {playlist.public ? <Earth /> : <LockKeyhole />}
                  </div>
                </div>
              ))}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex px-4 py-2 bg-neutral-600/50 active:bg-neutral-800 text-white rounded-4xl"
                >
                  <Plus />
                  New playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="p-10 bg-neutral-900 rounded-xl shadow-lg text-white">
            <div className="flex justify-center mb-4 gap-3">
              <h2 className="flex justify-centertext-xl font-semibold text-xl">
                new video to...
              </h2>
            </div>
            <div className="justify-center p-1">
              <div className="space-y-3 mb-6">
                <div className="">
                  <input
                    type="text"
                    placeholder="Playlist Title"
                    value={newPlaylist.title}
                    onChange={(e) =>
                      setNewPlaylist({ ...newPlaylist, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 rounded text-white outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Playlist Description"
                    value={newPlaylist.description}
                    no
                    onChange={(e) =>
                      setNewPlaylist({
                        ...newPlaylist,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 rounded text-white outline-none"
                  />
                </div>
                <div>
                  <select
                    className="w-full bg-neutral-800 p-2"
                    onChange={(e) =>
                      setNewPlaylist({
                        ...newPlaylist,
                        visibility: e.target.value,
                      })
                    }
                  >
                    <option value="private">private</option>
                    <option value="public">public</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleCancel()}
                  className="flex px-10 py-2 border-neutral-700 border-1 active:bg-neutral-800 text-white rounded-4xl"
                >
                  cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  className={`flex px-10 py-2 ${
                    !newPlaylist.title.trim() || !newPlaylist.description.trim()
                      ? "bg-neutral-600/50"
                      : "bg-blue-600 active:bg-blue-800"
                  } text-white rounded-4xl`}
                  disabled={!newPlaylist.title || !newPlaylist.description}
                >
                  create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      {toastMsg && (
        <div
          className="fixed will-change-auto bottom-0 left-0 w-100 sm:bottom-5 sm:left-6 bg-white text- px-4 py-2 rounded shadow-lg z-50
                opacity-100 translate-y-0 transition-all duration-300 ease-in-out"
        >
          {toastMsg.message}
          {toastMsg.undo && (
            <button
              className="ml-45 lg:ml-10 text-blue-500 underline-offset-1 hover:text-blue-500"
              onClick={() => {
                setToastMsg("");
                toastMsg.undo();
                handleCancel();
              }}
            >
              undo
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Index;
