import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SubscriptionItem = ({
  id,
  channelImage,
  channelName,
  channelHandle,
  subscriberCount,
  description,
  isSubscribed,
  onClick = () => {},
  onSubscribeClick = () => {},
}) => {
  const handleSubscribeClick = (e) => {
    e.stopPropagation();
    onSubscribeClick(id, isSubscribed, subscriberCount);
  };

  return (
    <div
      className="flex items-start p-6 hover:bg-neutral-800 cursor-pointer transition-all duration-200 border-b border-neutral-800 group"
      onClick={onClick}
    >
      {/* Channel Avatar */}
      <div className="flex-shrink-0 mr-6">
        <div className="relative">
          <img
            src={channelImage}
            alt={channelName}
            className="w-40 h-40 rounded-full object-cover ring-2 ring-neutral-700 group-hover:ring-red-500/50 transition-all duration-200 shadow-lg"
          />
        </div>
      </div>

      {/* Channel Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 w-full justify-center">
        <Link
          to={`/getChannelProfile/${channelHandle}`}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center mb-2">
            <h3 className="text-white font-semibold text-lg mr-3 transition-colors duration-200">
              {channelName}
            </h3>
          </div>

          <div className="text-gray-400 text-sm mb-3 font-medium">
            <span className="text-gray-300">{channelHandle}</span>
          </div>
          <div className="text-gray-400 text-sm mb-3 font-medium">
            <span className="text-neutral-300">
              {subscriberCount} subscribers
            </span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed line-clamp-1 group-hover:text-gray-200 transition-colors duration-200 mb-3">
            {description}
          </p>
        </Link>

        <div className="flex sm:my-10 sm:justify-end">
          <button
            onClick={handleSubscribeClick}
            className={`flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
              isSubscribed
                ? "bg-neutral-700 text-white hover:bg-neutral-600"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </button>

          {/* Subscribe Button */}
        </div>
      </div>
    </div>
  );
};

const YouTubeSubscriptions = () => {
  const HOST = import.meta.env.VITE_HOST;
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${HOST}/api/v1/subscriptions/getMySubscribed`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const result = await response.json();

      if (result.success) {
        const subscriptionsData = result.data.subscribeds.map(
          (subscription) => ({
            id: subscription._id,
            channelImage: subscription.avatar,
            channelName: subscription.fullName,
            channelHandle: subscription.userName,
            subscriberCount: subscription.subscribers || 0,
            description: subscription.description || "No description available",
            isSubscribed: true, // Since these are already subscribed channels
          })
        );
        setSubscriptions(subscriptionsData);
      } else {
        console.error("Failed to fetch subscriptions:", result.message);
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeClick = async (
    channelId,
    currentSubscriptionStatus,
    currentSubscriberCount
  ) => {
    try {
      // Optimistic update - immediately update UI
      setSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((sub) => {
          if (sub.id === channelId) {
            return {
              ...sub,
              isSubscribed: !currentSubscriptionStatus,
              subscriberCount: currentSubscriptionStatus
                ? Math.max(0, currentSubscriberCount - 1) // Decrease when unsubscribing
                : currentSubscriberCount + 1, // Increase when subscribing
            };
          }
          return sub;
        })
      );

      // Make API call
      const response = await fetch(
        `${HOST}/api/v1/subscriptions/toggleSubscribe/${channelId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!result.success) {
        // Revert optimistic update if API call failed
        console.error("Subscription toggle failed:", result.message);
        setSubscriptions((prevSubscriptions) =>
          prevSubscriptions.map((sub) => {
            if (sub.id === channelId) {
              return {
                ...sub,
                isSubscribed: currentSubscriptionStatus,
                subscriberCount: currentSubscriberCount,
              };
            }
            return sub;
          })
        );

        // You could show a toast notification here
        alert("Failed to update subscription. Please try again.");
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);

      // Revert optimistic update on error
      setSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((sub) => {
          if (sub.id === channelId) {
            return {
              ...sub,
              isSubscribed: currentSubscriptionStatus,
              subscriberCount: currentSubscriberCount,
            };
          }
          return sub;
        })
      );

      alert("Network error. Please check your connection and try again.");
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium">
            Loading Subscriptions...
          </p>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="min-h-100 bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📺</div>
          <h2 className="text-white text-2xl font-semibold mb-2">
            No Subscriptions Yet
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Start subscribing to channels to see them here
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-neutral-700 text-white rounded-full hover:bg-neutral-600 transition-colors duration-200"
          >
            Explore Channels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 min-h-100">
      {/* Centered Content Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Subscriptions List */}
          <div className="divide-y divide-neutral-800 mt-10">
            {subscriptions.map((channel, index) => (
              <div
                key={channel.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <SubscriptionItem
                  id={channel.id}
                  channelImage={channel.channelImage}
                  channelName={channel.channelName}
                  channelHandle={channel.channelHandle}
                  subscriberCount={channel.subscriberCount}
                  description={channel.description}
                  isSubscribed={channel.isSubscribed}
                  onClick={() =>
                    console.log(`Clicked on ${channel.channelName}`)
                  }
                  onSubscribeClick={handleSubscribeClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSubscriptions;
