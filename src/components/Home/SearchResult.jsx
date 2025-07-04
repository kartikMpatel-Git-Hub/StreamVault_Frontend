import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { timeAgo } from "../util/AgoTime";
import { getCurrentUser } from "../../context/UserContext";

function SearchResult() {
  const HOST = import.meta.env.VITE_HOST;
  const [videos, setVideos] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [chennels,setChannels] = useState([])
  const isOnline = navigator.onLine;
  const [isLoading, setIsLoading] = useState(true);
  const { query } = useParams();
  const currentUser = getCurrentUser()

  const fetchVideos = async () => {
    setVideos([]);
    const response = await fetch(
      `${HOST}/api/v1/videos/getSeachVideos/${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    let result = await response.json();
    result = result.data;
    const videos = result.map((video) => {
      return {
        id: video._id,
        title: video.title,
        channel: video.owner.userName,
        views: video.views > 1000 ? `${(video.views / 1000).toFixed(1)}k` : video.views,
        time: timeAgo(video.createdAt),
        thumbnail: video.thumbnail,
        description: video.description,
        duration:
          Math.round(Math.floor(video.duration) / 60) +
          ":" +
          (Math.floor(video.duration) % 60 < 10 ? "0" : "") +
          (Math.floor(video.duration) % 60),
        avatar: video.owner.avatar,
      };
    });
    setVideos(videos);
  };

  const fetchChannels = async ()=>{
    try {
      const response = await fetch(`${HOST}/api/v1/users/searchChannel/${query}`)
      let data = await response.json();
      data = data.data;
      const channels = data.map((channel)=>{
        return {
          id: channel._id,
          userName: channel.userName,
          avatar: channel.avatar,
          subscribers: channel.subscribersCount,
          fullName: channel.fullName,
          description: channel.description || "No description",
        }
      })
      setChannels(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      setChannels([]);
    }
  }

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
          description: video.description,
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

  useEffect(() => {
    setIsLoading(true);
    fetchVideos();
    fetchChannels();
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
    setTimeout(() => {
      fetchRecomendedVideo();
    }, 500);
  }, [query,currentUser]);

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-neutral-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            Check Your Network Connection And Referesh
          </p>
        </div>
      </div>
    );
  }

  const ChannelCard = ({chennel})=>(
    <div
      className="flex items-center p-6 hover:bg-neutral-800 cursor-pointer transition-all duration-200 border-b border-neutral-800 group"
      // onClick={onClick}
    >
      {/* Channel Avatar */}
      <div className="flex-shrink-0 mr-6">
        <div className="relative">
          <img
            src={chennel.avatar}
            alt={chennel.fullName}
            className="w-40 h-40 rounded-full object-cover ring-2 ring-neutral-700 group-hover:ring-red-500/50 transition-all duration-200 shadow-lg"
          />
        </div>
      </div>

      {/* Channel Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 w-full justify-center">
        <div
          className="flex-1 min-w-0"
        >
          <div className="flex items-center mb-2">
            <h3 className="text-white font-semibold text-lg mr-3 transition-colors duration-200">
              {chennel.fullName}
            </h3>
          </div>

          <div className="text-gray-400 text-sm mb-3 font-medium">
            <span className="text-gray-300">{chennel.userName}</span>
          </div>
          <div className="text-gray-400 text-sm mb-3 font-medium">
            <span className="text-neutral-300">
              {chennel.subscribers} subscribers
            </span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed line-clamp-1 group-hover:text-gray-200 transition-colors duration-200 mb-3">
            {chennel.description || "No description"}
          </p>
        </div>

      </div>
    </div>
  )

  const VideoCard = ({ video }) => (
    <div className="flex flex-col md:flex-row gap-4 pl-3 py-3 rounded-lg bg-neutral-900 transition cursor-pointer mb-4">
      <div className="sm:w-120 w-80 relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full sm:h-70 object-cover rounded-lg"
        />
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-s px-2 py-0.5 rounded">
          {video.duration}
        </span>
      </div>

      {/* Video Info */}
      <div className="flex-1 text-white ml-2 w-80 sm:w-80">
        <h3 className="sm:text-xl text-xl font-medium leading-snug line-clamp-2">
          {video.title}
        </h3>
        <p className="text-m text-neutral-400 py-2">
          {video.views} views • {video.time}
        </p>
        <div
          // to={`../getChannelProfile/${video.channel}`}
          className="text-m text-neutral-400 flex gap-2 py-2"
        >
          <img src={video.avatar} className="w-8 h-8 rounded-2xl object-cover" />
          {video.channel}
        </div>
        <p className="text-m text-neutral-400 py-2 break-words leading-tight">
          {window.innerWidth <= 720
            ? video.description?.substring(0, 50) + "..."
            : video.description?.substring(0,200) + "..."} 
        </p>
      </div>
      <hr className="text-neutral-700"/>
    </div>
  );

  return (
    <>
      <div className="flex justify-center min-h-screen w-full bg-neutral-900 border-white">
        {/* Header */}

        <div className="flex mt-2 sm:w-7xl ">
          {/* Main Content */}
          <main className="flex-1 sm:ml-0 text-neutral-800 sm:pl w-full">
            {/* {
              chennels &&
              <div className=" lg:p-6">
                {!isLoading && (
                  <div className="h-20 bg-neutral-900 flex items-center justify-center font-bold">
                    <div className="text-center text-white">
                      {chennels.map((chennel)=>(
                        <Link to={`../getChannelProfile/${chennel.userName}`} key={chennel._id}> 
                          <ChannelCard chennel={chennel}/>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            } */}
            <div className=" lg:p-6">
              {isLoading ? (
                <div className="h-20 m:p-10 bg-neutral-900 flex items-center justify-center font-bold">
                  <div className="text-center">
                    <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">
                    </p>
                  </div>
                </div>
              ) : videos.length || chennels.length ? (
                <div className="flex flex-col">
                  <div>
                    {chennels.length > 0 && chennels.map((chennel) => (
                      <Link to={`../getChannelProfile/${chennel.userName}`} key={chennel.id}>
                        <ChannelCard chennel={chennel} />
                      </Link>
                    ))}
                  </div>
                  <div>
                    {videos.length > 0 && videos.map((video) => (
                      <Link to={`../video/${video.id}`} key={video.id}>
                        <VideoCard video={video} key={video.id} />
                      </Link>
                    ))}
                  </div>
                </div>
              ) :
              (
                <div className="h-20 bg-neutral-900 flex items-center justify-center font-bold">
                  <div className="text-center">
                    {/* <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div> */}
                    <p className="text-white text-lg">
                      No Result '{query}' Found
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* <hr/> */}
            {/* <hr/> */}
            <div className="lg:p-6">
              {recommendedVideos && (
                <div className="flex flex-col">
                <div className="text-white text-3xl font-bold sm:p-10 p-2">
                  Recomended Videos
                </div>
                  {recommendedVideos.map((video) => (
                    <Link to={`../video/${video.id}`} key={video.id}>
                      <VideoCard video={video} />
                    </Link>
                  ))}
                </div>
              ) }
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default SearchResult;
