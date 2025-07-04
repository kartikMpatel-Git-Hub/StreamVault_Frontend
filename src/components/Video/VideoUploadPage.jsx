import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Film,
  Image,
  Type,
  FileText,
  Play,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  Settings,
  Eye,
  Globe,
  Lock,
  Users,
} from "lucide-react";
import axios from "axios";

function VideoUploadPage(currentUser) {
  const HOST = import.meta.env.VITE_HOST;
  const [errors, setErrors] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [visibility, setVisibility] = useState("public"); // public, unlisted, private

  const [dragStates, setDragStates] = useState({
    video: false,
    thumbnail: false,
  });
  const [previewUrls, setPreviewUrls] = useState({
    video: null,
    thumbnail: null,
  });
  const videoRef = useRef(null);
  const thumbnailRef = useRef(null);

  const validateFile = (file, type) => {
    const maxSize = {
      video: 1000 * 1024 * 1024,
      thumbnail: 10 * 1024 * 1024,
    };
    const validFormate = {
      video: ["video/mp4"],
      thumbnail: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    };
    if (file.size > maxSize[type])
      return `File size exceeds ${type == "video" ? "1GB" : "10MB"} limit`;
    if (!validFormate[type].includes(file.type))
      return `Invalid file format for ${type}. Try a different format!`;
    return null;
  };

  const createPreviewUrl = (file, type) => {
    if (previewUrls[type]) {
      URL.revokeObjectURL(previewUrls[type]);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrls((prev) => ({ ...prev, [type]: url }));
    return url;
  };

  const processFile = (file, type) => {
    const error = validateFile(file, type);
    if (error) {
      setErrors((prev) => ({ ...prev, [type]: error }));
      return;
    }
    setErrors((prev) => ({ ...prev, [type]: null }));

    // Create preview URL
    createPreviewUrl(file, type);

    if (type == "video") {
      setVideoFile(file);
    } else {
      setThumbnailFile(file);
    }
  };

  const handleFileUpload = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], type);
    }
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragStates((prev) => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setDragStates((prev) => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragStates((prev) => ({ ...prev, [type]: false }));

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0], type);
    }
  };

  const removeFile = (type) => {
    if (previewUrls[type]) {
      URL.revokeObjectURL(previewUrls[type]);
    }
    setPreviewUrls((prev) => ({ ...prev, [type]: null }));

    if (type === "video") {
      setVideoFile(null);
      if (videoRef.current) videoRef.current.value = "";
    } else {
      setThumbnailFile(null);
      if (thumbnailRef.current) thumbnailRef.current.value = "";
    }

    setErrors((prev) => ({ ...prev, [type]: null }));
  };

  const validateFiles = () => {
    let videoError = videoFile
      ? validateFile(videoFile, "video")
      : "Please select a video file";
    let thumbnailError = thumbnailFile
      ? validateFile(thumbnailFile, "thumbnail")
      : "Please select a thumbnail image";
    let flag = true;

    if (videoError) {
      setErrors((prev) => ({ ...prev, ["video"]: videoError }));
      flag = false;
    }
    if (thumbnailError) {
      setErrors((prev) => ({ ...prev, ["thumbnail"]: thumbnailError }));
      flag = false;
    }
    if (!title.trim() || title.length > 100) {
      setErrors((prev) => ({
        ...prev,
        ["title"]: "Title cannot be empty or more than 100 characters",
      }));
      flag = false;
    }
    if (!description.trim()) {
      setErrors((prev) => ({
        ...prev,
        ["description"]: "Description cannot be empty",
      }));
      flag = false;
    }
    return flag;
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setThumbnailFile(null);
    setErrors({});
  };

  const uploadVideo = async () => {
    setErrors({});
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage("Preparing upload...");

    if (!validateFiles()) {
      setIsUploading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", title);
    formDataToSend.append("description", description);
    formDataToSend.append("videoFile", videoFile);
    formDataToSend.append("thumbnail", thumbnailFile);
    formDataToSend.append("visibility", visibility);

    try {
      // Set initial progress
      setUploadProgress(5);
      setUploadStage("Starting upload...");

      const response = await axios.post(
        `${HOST}/api/v1/videos/uploadVideo`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              const currentProgress = Math.max(5, Math.min(percent, 95));
              setUploadProgress(currentProgress);

              if (currentProgress < 25) {
                setUploadStage(`Uploading video... ${currentProgress}%`);
              } else if (currentProgress < 50) {
                setUploadStage(`Processing video... ${currentProgress}%`);
              } else if (currentProgress < 75) {
                setUploadStage(`Uploading thumbnail... ${currentProgress}%`);
              } else if (currentProgress < 90) {
                setUploadStage(`Finalizing... ${currentProgress}%`);
              } else {
                setUploadStage(`Almost done... ${currentProgress}%`);
              }
            } else {
              setUploadStage("Uploading... Please wait");
            }
          },
          timeout: 300000, // 5 minutes timeout
        }
      );
      setUploadStage("Processing video...");
      setTimeout(() => {
        setUploadProgress(100);
        setUploadStage("Upload complete!");
        setUploadSuccess(true);

        setTimeout(() => {
          setUploadSuccess(false);
          setUploadProgress(0);
          setUploadStage("");
          clearForm();
        }, 3000);
      }, 1000);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadProgress(0);
      setUploadStage("");

      // Better error handling
      let errorMessage = "Upload failed. Please try again.";
      if (err.response) {
        if (err.response.status === 413) {
          errorMessage = "File too large. Please use a smaller video file.";
        } else if (err.response.status === 401) {
          errorMessage = "Please log in to upload videos.";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.code === "ECONNABORTED") {
        errorMessage =
          "Upload timed out. Please check your connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        //console.log("Upload state reset");
      }, 1000);
    }
  };

  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-300 text-lg">Getting Ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-8 bg-neutral-600/50 border border-neutral-100 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
              <span className="text-blue-300 font-medium">{uploadStage}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-700 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>

            {/* Progress Info */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col space-y-1">
                <span className="text-neutral-300 text-sm">
                  {videoFile && `File: ${videoFile.name}`}
                </span>
                <span className="text-neutral-400 text-xs">
                  {videoFile &&
                    `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`}
                </span>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="text-blue-300 font-semibold text-lg">
                  {uploadProgress}%
                </span>
                <span className="text-neutral-400 text-xs">
                  {uploadProgress < 100 ? "Uploading..." : "Complete!"}
                </span>
              </div>
            </div>

            {/* Additional Status */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3 pt-3 border-t border-neutral-600">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Status: {uploadStage}</span>
                  <span>Please don't close this page</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-8 bg-green-900/50 border border-green-700 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">
              Video uploaded successfully!
            </span>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-8 bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-medium">{errors.general}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Upload */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Film className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-medium text-white">Video</h3>
              </div>

              {!videoFile ? (
                <div
                  onDragOver={(e) => handleDragOver(e, "video")}
                  onDragLeave={(e) => handleDragLeave(e, "video")}
                  onDrop={(e) => handleDrop(e, "video")}
                  className={`relative transition-all duration-300 ${
                    dragStates.video
                      ? "border-red-400 bg-red-900/20 scale-105"
                      : "border-neutral-600 hover:border-red-400 hover:bg-neutral-700/50"
                  }`}
                >
                  <input
                    ref={videoRef}
                    type="file"
                    id="video-upload"
                    className="hidden"
                    accept="video/mp4"
                    onChange={(e) => handleFileUpload(e, "video")}
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload
                      className={`w-12 h-12 mb-4 transition-colors ${
                        dragStates.video ? "text-red-400" : "text-neutral-400"
                      }`}
                    />
                    <span className="text-neutral-300 text-center font-medium mb-2">
                      {dragStates.video
                        ? "Drop your video here"
                        : "Click to upload or drag & drop"}
                    </span>
                    <span className="text-neutral-500 text-sm">
                      MP4 format, max 1GB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                    <video
                      src={previewUrls.video}
                      controls
                      className="w-full h-64 rounded-lg object-cover"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%236B7280' viewBox='0 0 24 24'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {videoFile.name}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile("video")}
                        className="ml-3 p-2 bg-red-900/50 hover:bg-red-800/50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {errors.video && (
                <div className="mt-3 flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.video}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-col mt-8 w-full">
              <div className=" bg-neutral-800 border border-neutral-700 rounded-lg py-6 w-full">
                <div className="flex items-center space-x-3 mb-6 ml-6">
                  <Image className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">Thumbnail</h3>
                </div>

                {!thumbnailFile ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, "thumbnail")}
                    onDragLeave={(e) => handleDragLeave(e, "thumbnail")}
                    onDrop={(e) => handleDrop(e, "thumbnail")}
                    className={`relative transition-all duration-300 w-70 justify-center m-auto ${
                      dragStates.thumbnail
                        ? "border-blue-400 bg-blue-900/20 scale-105"
                        : "border-neutral-600 hover:border-blue-400 hover:bg-neutral-700/50"
                    }`}
                  >
                    <input
                      ref={thumbnailRef}
                      type="file"
                      id="thumbnail-upload"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handleFileUpload(e, "thumbnail")}
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-1 bg-neutral-800 border-neutral-500 rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload
                        className={`w-8 h-8 mb-2 transition-colors ${
                          dragStates.thumbnail
                            ? "text-blue-400"
                            : "text-neutral-400"
                        }`}
                      />
                      <span className="text-neutral-300 text-center font-medium mb-1">
                        {dragStates.thumbnail
                          ? "Drop your image here"
                          : "Click to upload or drag & drop"}
                      </span>
                      <span className="text-neutral-500 text-xs">
                        JPG, PNG, JPEG max 10MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative w-70 m-auto">
                    <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700 w-full">
                      <img
                        src={previewUrls.thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-32 rounded-lg object-cover"
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {thumbnailFile.name}
                          </p>
                          <p className="text-neutral-400 text-sm">
                            {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile("thumbnail")}
                          className="ml-3 p-2 bg-red-900/50 hover:bg-red-800/50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {errors.thumbnail && (
                  <div className="mt-3 flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.thumbnail}</span>
                  </div>
                )}
              </div>
              <div className=" bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full">
                <div className="flex items-center space-x-3 mb-4">
                  <Eye className="w-5 h-5 text-neutral-400" />
                  <h3 className="text-lg font-medium text-white">Visibility</h3>
                </div>

                <div className="space-y-3 flex flex-col items-center">
                  <div className="flex flex-col">
                    <label className="flex items-center space-x-3 cursor-pointer p-3">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={visibility === "public"}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-neutral-600 focus:ring-blue-500 bg-neutral-700"
                      />
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-neutral-400" />
                        <div>
                          <span className="text-white font-medium">Public</span>
                          <p className="text-neutral-400 text-sm">
                            Everyone can search for and view
                          </p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={visibility === "private"}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-neutral-600 focus:ring-blue-500 bg-neutral-700"
                      />
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-neutral-400" />
                        <div>
                          <span className="text-white font-medium">Private</span>
                          <p className="text-neutral-400 text-sm">
                            Only you can view
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Title Input */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Type className="w-5 h-5 text-neutral-400" />
                <h3 className="text-lg font-medium text-white">Title</h3>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title that describes your video"
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />

              {errors.title && (
                <div className="mt-2 flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.title}</span>
                </div>
              )}
            </div>

            {/* Description Input */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-5 h-5 text-neutral-400" />
                <h3 className="text-lg font-medium text-white">Description</h3>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                rows={4}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />

              {errors.description && (
                <div className="mt-2 flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.description}</span>
                </div>
              )}
            </div>

            {/* Visibility Settings */}

            {/* Upload Button */}
            <div className="pt-4">
              <button
                onClick={uploadVideo}
                disabled={isUploading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>
                      {uploadProgress < 100
                        ? `Uploading ${uploadProgress}%`
                        : "Processing..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="lg:col-span-1"></div>

          {/* Right Column - Video Details */}
        </div>
      </div>
    </div>
  );
}

export default VideoUploadPage;
