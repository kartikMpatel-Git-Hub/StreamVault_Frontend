import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { timeAgo } from "../util/AgoTime";
import { getCurrentUser } from "../../context/UserContext";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
} from "lucide-react";

function EnhancedVideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const controlsTimeout = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Show controls on mouse move, hide after 3s
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  // Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Seek
  const handleSeek = (e) => {
    const video = videoRef.current;
    const seekTime = (e.target.value / 100) * duration;
    video.currentTime = seekTime;
    setCurrent(seekTime);
  };

  // Volume
  const handleVolume = (e) => {
    const video = videoRef.current;
    video.volume = e.target.value;
    setVolume(e.target.value);
    setIsMuted(e.target.value === "0");
  };

  // Mute/Unmute
  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted && volume === 0) {
      setVolume(0.5);
      video.volume = 0.5;
    }
  };

  // Skip 5 seconds
  const skip = (amount) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(video.currentTime + amount, duration));
    setCurrent(video.currentTime);
  };

  // Fullscreen
  const handleFullscreen = () => {
    const videoContainer = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Update time
  useEffect(() => {
    const video = videoRef.current;
    const update = () => setCurrent(video.currentTime);
    video.addEventListener("timeupdate", update);
    video.addEventListener("loadedmetadata", () => setDuration(video.duration));
    video.play().then(() => {
      setIsPlaying(true)
    }).catch(() => {
      setIsPlaying(false)
    })
    return () => {
      video.removeEventListener("timeupdate", update);
    };
  }, []);

  // Hide controls after 3s
  useEffect(() => {
    if (showControls) {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(controlsTimeout.current);
  }, [showControls]);

  // Format time
  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div
      className="relative aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
        onClick={togglePlay}
        tabIndex={0}
        muted={isMuted}
      />
      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 w-full px-4 pb-3 pt-2 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } flex flex-col`}
      >
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={100}
          value={duration ? (current / duration) * 100 : 0}
          onChange={handleSeek}
          className="w-full accent-red-600 h-0.5"
        />
        <div className="flex justify-between mt-2 gap-2">
          {/* Skip Back 5s
          <button
            onClick={() => skip(-5)}
            className="text-white hover:text-red-500 text-xl focus:outline-none"
            aria-label="Skip Back 5 Seconds"
          >
            <SkipBack size={28} />
          </button> */}
          {/* Play/Pause */}
          <div className="flex items-center justify-between mt-2 gap-2">
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 text-2xl focus:outline-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            {/* Skip Forward 5s */}
            <button
              onClick={() => skip(5)}
              className="text-white hover:text-red-500 text-xl focus:outline-none"
              aria-label="Skip Forward 5 Seconds"
            >
              <SkipForward size={28} />
            </button>
            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className="text-white hover:text-red-500 text-xl focus:outline-none"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            {/* Volume */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolume}
              className="accent-red-600 w-24 mx-2"
              aria-label="Volume"
            />
            <span className="text-white text-sm mt-2 font-mono min-w-[90px] text-center">
              {format(current)} / {format(duration)}
            </span>
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-red-500 text-xl focus:outline-none justify-end"
              aria-label="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </div>
            {/* Time */}
          {/* Fullscreen */}
        </div>
      </div>
    </div>
  );
}

function YouTubeWatch() {
  const currentUser = getCurrentUser()
  const HOST = import.meta.env.VITE_HOST;
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const { videoId } = useParams();
  // const [currentUser, setCurrentUser] = useState({});
  const [recommendedVideos, setRecommendedVideos] = useState(null);
  const videoRef = useRef(null);
  const [toastMsg, setToastMsg] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);
  const [fethcingComments, setFethcingComments] = useState(true);

  const fetchRecomendedVideo = async () => {
    try {
      const response = await fetch(`${HOST}/api/v1/videos/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const resData = await response.json();
      const videosData = resData.data;

      const recomendedVideos = videosData.map((video) => {
        return {
          id: video._id,
          title: video.title,
          channel: video.owner.userName,
          views: video.views > 1000 ? `${(video.views / 1000).toFixed(1)}k` : video.views,
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
      setRecommendedVideos(recomendedVideos);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchVideoData = async (videoId) => {
    const response = await fetch(
      `${HOST}/api/v1/videos/${currentUser ? "watchVideo" : "watchVideoUnknownUser"}/${videoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    /**
     * chnage in api
     * add user data (video owner)
     * add comments
     */
    let data = await response.json();
    let currentVideo;
    //console.log(data);
    if (!data.success) {
      currentVideo = {
        id: 0,
        url: "",
        title: "NOT Available",
        description: "NOT Available",
        views: 0,
        likes: 0,
        isLiked: false,
        uploadDate: "NOT Available",
        duration: "0:00",
        channel: "UNDEFINED",
      };
    } else {
      data = data.data;
      currentVideo = {
        id: data._id,
        url: data.videoFile,
        title: data.title,
        description: data.description,
        views: data.views > 1000 ? `${(data.views / 1000).toFixed(1)}k` : data.views,
        likes: data.likes,
        isLiked: false,
        uploadDate: timeAgo(data.createdAt),
        duration:
          Math.round(Math.floor(data.duration) / 60) +
          ":" +
          (Math.floor(data.duration) % 60 < 10 ? "0" : "") +
          (Math.floor(data.duration) % 60),
        channel: data.owner.userName,
      };
    }
    setVideo(currentVideo);
    fetchChannelData(currentVideo.channel);
  };

  const fetchChannelData = async (userName) => {
    if (userName == "" || userName == "UNDEFINED") {
      setChannel({
        name: "NOT FOUND",
        userName: "NOT FOUND",
        avatar: "NOT FOUND",
        subscribers: "NOT FOUND",
        isVerified: false,
      });
      return;
    }
    const response = await fetch(
      `${HOST}/api/v1/users/${currentUser ? "getChannelProfile" : "getChannelProfileUnknownUser"}/${userName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    let user = await response.json();
    user = user.data;
    const channelData = {
      id: user._id,
      name: user.userName,
      userName: user.userName,
      avatar: user.avatar,
      subscribers: user.subscribersCount,
      isVerified: false,
    };
    setChannel(channelData);
  };

  const fetchVideoComments = async () => {
    const response = await fetch(
      `${HOST}/api/v1/comments/${currentUser ? "getComments" : "getCommentsUnkownUser"}/${videoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    let comments = await response.json();
    comments = comments.data;
    const commentsList = comments.map((comment) => {
      return {
        id: comment._id,
        isLiked: comment.isLiked,
        owner: comment.owner._id,
        author: comment.owner.userName,
        avatar: comment.owner.avatar,
        content: comment.content,
        likes: comment.likes,
        showComment: false,
        timeAgo: timeAgo(comment.createdAt),
        isPinned: false,
      };
    });
    setComments(commentsList);
  };

  const addToWatchHistory = async (videoId) => {
    await fetch(`${HOST}/api/v1/users/addToWatchHistory/${videoId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
    });
  };

  const fetchEngagement = async () => {
    const response = await fetch(
      `${HOST}/api/v1/videos/userEngagement/${videoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    let engagement = await response.json();
    if(engagement.statusCode == 200){
      engagement = engagement.data;
      //console.log(engagement);
      setIsLiked(engagement.isLiked);
      setIsSubscribed(engagement.isSubscribed);
    }
    else{
      setIsLiked(false);
      setIsSubscribed(false);
    }
  };

  useEffect(() => {
    setComments([])
    setVideo(null)
    setFethcingComments(true)
    document.title = "Youtube Clone";
    setTimeout(() => {
      fetchVideoData(videoId);
    }, 300)
    addToWatchHistory(videoId);
    fetchEngagement();
    setTimeout(() => {
      fetchVideoComments();
      fetchRecomendedVideo();
      setFethcingComments(false);
    }, 2000);
  }, [setVideo, setChannel, videoId]);

  useEffect(() => {
    document.title = video?.title + " • " + video?.channel || "Youtube Clone";
  }, [video]);



  const removeVideo = async () => {
    await fetch(`${HOST}/api/v1/videos/removeVideo/${videoId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    navigate("../../");
  };

  const handleLike = async () => {
    if (isLiked) {
      video.likes -= 1;
      setToastMsg("remove like");
    } else {
      video.likes += 1;
      setToastMsg("add like");
    }
    setIsLiked(!isLiked);
    setTimeout(() => setToastMsg(""), 3000);
    const response = await fetch(`${HOST}/api/v1/likes/video/${videoId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    let data = await response.json();
  };

  const handleSubscribe = async () => {
    if (isSubscribed) {
      setToastMsg("unsubscribed !");
      channel.subscribers -= 1;
    } else {
      setToastMsg("subscribed !");
      channel.subscribers += 1;
    }
    setIsSubscribed(!isSubscribed);
    setTimeout(() => setToastMsg(""), 3000);
    const response = await fetch(
      `${HOST}/api/v1/subscriptions/toggleSubscribe/${channel.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    await response.json();
  };

  const handleCommentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        owner: currentUser.id,
        author: "You",
        avatar: currentUser.avatar,
        content: newComment,
        likes: 0,
        replies: 0,
        timeAgo: "Just now",
      };
      setComments([comment, ...comments]);
      setToastMsg("Comment Added Succesfully !");
      setTimeout(() => setToastMsg(""), 3000);
      const response = await fetch(
        `${HOST}/api/v1/comments/addComment/${videoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content: newComment }),
        }
      );
      const res = await response.json();
      comment.id = res.data._id;
      if (res.statusCode == 200) {
        setComments([comment, ...comments]);
        setNewComment("");
      }
    }
  };

  const handleCommentDelete = async (commentId) => {
    // alert("Do you Want to Delete !");
    const response = await fetch(
      `${HOST}/api/v1/comments/removeComment/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const res = await response.json();
    //console.log(res);
    if (res.statusCode === 200) {
      setToastMsg("Comment deleted successfully");
      fetchVideoComments();
      setTimeout(() => setToastMsg(""), 3000);
    } else {
      setToastMsg("Failed to delete comment");
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  const handleCommentLike = async (comment) => {
    comments.map(c => {
      if(c.id == comment.id){
        c.isLiked = !c.isLiked;
        c.likes += c.isLiked ? 1 : -1;
      }
    });

    const response = await fetch(`${HOST}/api/v1/likes/comment/${comment.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const res = await response.json();
    //console.log(res)
    if (res.statusCode == 200) {
      // fetchVideoComments();  
      setToastMsg(res.message);
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  const handleCopyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        setToastMsg("url copied To clipboard");
        setTimeout(() => setToastMsg(""), 3000);
      })
      .catch((err) => {});
  };


  if (!channel || !video) {
    return (
      <div className="min-h-screen w-full bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading video...</p>
        </div>
      </div>
    );
  }

  const VideoCard = ({ video }) => (
    <div className="flex flex-col sm:flex-row rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer m-2">
      <div className="relative rou">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full sm:w-60 h-48 sm:h-30 object-cover rounded"
        />
        <span className="absolute bottom-2.5 right-2 bg-neutral-900 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </span>
      </div>
      <div className="p-1">
        <div className="flex gap-3">
          {/* <img
            src={video.avatar}
            alt={video.channel}
            className="w-9 h-9 rounded-full flex-shrink-0 mt-4"
          /> */}
          <div className="flex-1 min-w-0 sm:w-50">
            <h3 className="text-base font-medium break-words max-w-full leading-tight">
              {video.title}
            </h3>
            <p className="text-neutral-300 text-sm mb-1">{video.channel}</p>
            <p className="text-neutral-300 text-sm">
              {video.views} views • {video.time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {alertMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="py-10 sm:py-15 px-20 sm:px-30 bg-black rounded-xl shadow-lg text-white">
            <div className="flex justify-center">
              <h2 className="flex justify-centertext-xl font-semibold mb-4 text-xl">login Required</h2>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setAlertMsg(false)}className="px-4 py-2 bg-neutral-600 active:bg-neutral-800 text-white rounded">Close</button>
              <button onClick={() => navigate("../login")}className=" px-4 py-2 bg-neutral-600 active:bg-neutral-800 text-white rounded">login</button>
            </div>
          </div>
        </div>
      )}
      <div className="relative bg-neutral-900">
        <div className="lg:ml-10 max-w-full min-h-screen bg-neutral-900/80 text-white">
          <div className="flex flex-col lg:flex-row gap-6 sm:py-15 px-1">
            {/* Main Content */}

            <div className="flex-1 sm:w-330">
              <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] group">
                <EnhancedVideoPlayer src={video.url} poster={video.thumbnail} />
              </div>

              {/* Video Info */}
              <div className="mt-2 mb-6">
                <h1 className="text-xl font-semibold mb-3 leading-tight break-words max-w-full">
                  {video.title}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Views & Date */}
                  <div className="flex items-center text-sm text-neutral-300">
                    <span>{video.views} views</span>
                    <span className="mx-2">•</span>
                    <span>{video.uploadDate}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 relative">
                    {/* Like Button */}
                    <div className="flex bg-neutral-700 rounded-full overflow-hidden">
                      <button
                        onClick={()=>{
                          currentUser ? handleLike() : setAlertMsg(true)
                        }
                        }
                        className={`flex items-center gap-2 px-4 py-2 hover:bg-neutral-800 transition-colors ${
                          isLiked ? "text-white" : "text-white"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        <span>{video.likes}</span>
                      </button>
                      <div className="w-px bg-gray-700"></div>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={handleCopyURL}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-800 rounded-full transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                      Share
                    </button>

                    {/* Expand Options Menu */}
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="fab-toggle"
                        className="peer hidden"
                      />

                      {/* Options that appear above the + button */}
                      {currentUser &&  channel.userName == currentUser.userName ? (
                        <div
                          className="absolute bottom-full -right-10 flex flex-col items-end   transition-all
                            opacity-0 translate-y-4 pointer-events-none 
                            peer-checked:opacity-100 peer-checked:translate-y-0 peer-checked:pointer-events-auto z-50 mb-3"
                        >
                          <button
                            onClick={removeVideo}
                            className="px-17 py-2 text-sm bg-neutral-700 text-red-500 hover:bg-neutral-500 shadow rounded-t-md duration-700"
                          >
                            Remove Video
                          </button>
                          <button className="px-15 py-2 text-sm bg-neutral-700 text-yellow-300  hover:bg-neutral-500  shadow  duration-700">
                            private/ public
                          </button>
                          <button className="px-15 py-2 text-sm bg-neutral-700 text-green-500  hover:bg-neutral-500  shadow rounded-b-md duration-700">
                            Change Thumbnail
                          </button>
                        </div>
                      ) : (
                        <div
                          className="absolute bottom-full -right-10 flex flex-col items-end   transition-all
                            opacity-0 translate-y-4 pointer-events-none 
                            peer-checked:opacity-100 peer-checked:translate-y-0 peer-checked:pointer-events-auto z-50 mb-3"
                        >
                          <button
                            // onClick={removeVideo}
                            className="px-17 py-2 text-sm bg-neutral-700 text-red-500 hover:bg-neutral-500 shadow rounded-t-md duration-700"
                          >
                            Download
                          </button>
                        </div>
                      )}

                      {/* Toggle Button (+ / ×) */}
                      <label
                        htmlFor="fab-toggle"
                        className="cursor-pointer w-9 h-9 flex items-center justify-center bg-neutral-700 hover:bg-gray-700 text-white text-base rounded-full shadow transition"
                      >
                        <span className="peer-checked:hidden block">+</span>
                        {/* <span className="hidden peer-checked:block">x</span> */}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Channel Info */}
              <div className="bg-neutral-700 rounded-lg p-4 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <Link to={`../getChannelProfile/${channel.name}`}>
                    <div className="flex items-center gap-3">
                      <img
                        src={channel.avatar}
                        alt={channel.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/48x48/6b7280/ffffff?text=CH";
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{channel.name}</h3>
                          {channel.isVerified && (
                            <svg
                              className="w-4 h-4 text-neutral-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-neutral-300">
                          {channel.subscribers} subscribers
                        </p>
                      </div>
                    </div>
                  </Link>
                  {currentUser && channel.userName == currentUser.userName ? (
                    <button
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-200 bg-neutral-600 hover:bg-neutral-500`}
                    >
                      Subscribe
                    </button>
                  ) : (
                    <button
                      onClick={
                        ()=>{
                        currentUser ? handleSubscribe() : setAlertMsg(true)
                        }
                      }
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-800 ${
                        isSubscribed
                          ? "bg-neutral-600 text-white hover:bg-neutral-500"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  )}
                </div>

                <div className="text-sm">
                  <div
                    className={`${
                      showDescription ? "" : "line-clamp-2"
                    } text-gray-300 break-all whitespace-pre-wrap max-w-full overflow-hidden`}
                  >
                    {video.description}
                  </div>
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="text-neutral-300 hover:text-white mt-2 font-medium"
                  >
                    {showDescription ? "Show less" : "Show more"}
                  </button>
                </div>
              </div>

              {toastMsg && (
                <div
                  className="fixed bottom-5 right-5 bg-neutral-900/50 text-white px-4 py-2 rounded shadow-lg z-50
                opacity-100 translate-y-0 transition-all duration-300 ease-in-out hover:bg-neutral-900"
                >
                  {toastMsg}
                </div>
              )}
              {/**comment */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">
                    {comments.length} Comments
                  </h2>
                  {/* <button className="flex items-center gap-2 text-neutral-300 hover:text-white">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Sort by
                  </button> */}
                </div>

                <div className="flex gap-3">
                  <img
                    src={currentUser && currentUser.avatar || "../public/unknownUser.png"}
                    alt={currentUser && currentUser.userName || "You"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) =>
                        newComment.length < 50
                          ? setNewComment(e.target.value)
                          : ""
                      }
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-gray-700 focus:border-white outline-none py-2 text-white placeholder-neutral-300"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          if (currentUser) handleCommentSubmit(e);
                          else {
                            setAlertMsg(true)
                          }
                        }
                      }}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setNewComment("")}
                        className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={
                          ()=>{
                            currentUser ? handleCommentSubmit() : setAlertMsg(true)
                          }
                        }
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {!fethcingComments ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 break-words">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {!currentUser || comment.author == currentUser.userName
                                ? "You"
                                : comment.author}
                            </span>
                            <span className="text-xs text-neutral-300">
                              {comment.timeAgo}
                            </span>
                            {comment.isPinned && (
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                📌 Pinned
                              </span>
                            )}
                          </div>
                          <div
                            className={`line-clamp-2 text-gray-300 break-all whitespace-pre-wrap max-w-full overflow-hidden`}
                          >
                            {comment.content}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <button
                              onClick={() => {
                                currentUser ? handleCommentLike(comment) : setAlertMsg(true)
                              }}
                              className="flex items-center gap-1 text-neutral-300 hover:text-white"
                              aria-label={
                                comment.isLiked
                                  ? "Unlike comment"
                                  : "Like comment"
                              }
                            >
                              <svg
                                className={`w-4 h-4 ${
                                  comment.isLiked
                                    ? "stroke-white"
                                    : "stroke-neutral-300"
                                }`}
                                fill={comment.isLiked ? "white" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                              </svg>
                              {comment.likes}
                            </button>
                            {currentUser && currentUser.id === comment.owner && (
                              <button
                                onClick={() => handleCommentDelete(comment.id)}
                              >
                                Delete
                              </button>
                            )}
                            {currentUser && currentUser.userName === video.channel && (
                              <button
                                className="text-red-500"
                                onClick={() => handleCommentDelete(comment.id)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-white-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-lg"></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold mb-4 mx-5">Up next</h3>
              {recommendedVideos ? (
                recommendedVideos.map((recVideo) => (
                  <Link
                    to={`/video/${recVideo.id}`}
                    key={recVideo.id}
                    onClick={()=>{window.scrollTo({top: 0,behavior: 'auto'});}}
                    // reloadDocument
                  >
                    <VideoCard video={recVideo} />
                  </Link>
                ))
              ) : (
                <div className="sm:w-106 flex items-center mt-6 justify-center">
                  <div className="text-center sm:pt-50">
                    <div className="w-16 h-16 border-4 border-white-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg"></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default YouTubeWatch;
