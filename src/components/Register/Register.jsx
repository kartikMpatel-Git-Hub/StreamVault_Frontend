import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const HOST = import.meta.env.VITE_HOST;
  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    email: "",
    password: "",
    avatar: null,
    coverImage: null,
  });
  const [toastMsg, setToastMsg] = useState("");
  const [loading,setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFile = (file, type) => {
    const maxSize = 3 * 1024 * 1024;
    const validFormate = {
      coverImage: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      avatar: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    };
    if (file.size > maxSize) return `File size exceeds 3MB limit`;
    if (!validFormate[type].includes(file.type))
      return `Invalid Image format for ${type}. Try a different format!`;
    return null;
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));
      let error = validateFile(file, type);

      if (error) {
        setToastMsg(error);
        setTimeout(() => setToastMsg(""), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === "avatar") {
          setAvatarPreview(e.target.result);
        } else {
          setCoverImagePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    try {
      let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (
        !formData.userName.trim() &&
        !formData.fullName &&
        !formData.email &&
        !formData.password &&
        !formData.avatar &&
        !formData.coverImage
      )
        throw "All Field Is Required !!";
      console.log()
      if (!formData.userName.trim()) throw "User's userName Required !";
      if (formData.userName.trim().charAt(0) <= '9' && formData.userName.trim().charAt(0) >= '0') throw "userName Not Startwith Number";
      if (!formData.fullName.trim()) throw "User's Full Name Required !";
      if (!formData.email.trim()) throw "User's Email Required !";
      if (!regex.test(formData.email.trim())) throw "Invalid Email address";
      if (!formData.password || formData.password.length < 8) throw "password must required 8 letters";
      if (!formData.avatar) throw "User's Avatar Required !";
      if (!formData.coverImage) throw "User's CoverImage Required !";
    } catch (error) {
      setToastMsg(error);
      setTimeout(() => setToastMsg(""), 3000);
      return false;
    }
    return true
  };

  const register = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("userName", formData.userName);
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("avatar", formData.avatar);
    formDataToSend.append("coverImage", formData.coverImage);

    try {
        setLoading(true)
      const response = await fetch(`${HOST}/api/v1/users/register`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await response.json();
      if(data.success){
        navigate("/login")
        setLoading(false)
      }
      setToastMsg(data.message);
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
        setLoading(false)
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Registering You Data !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-900 flex items-center justify-center p-4">
      {toastMsg && (
        <div
          className="fixed top-20 bg-red-500 text-black px-4 py-2 rounded shadow-lg z-50
                    opacity-100 translate-y-0 transition-all duration-300 ease-in-out hover:bg-black"
        >
          {toastMsg}
        </div>
      )}
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
            Create Account
          </h1>
          <p className="text-slate-300 text-lg">
            Join us and start your journey
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="space-y-6">
            {/* Cover Image Upload */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Cover Image *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "coverImage")}
                  className="hidden"
                  id="coverImage"
                  required
                />
                <label
                  htmlFor="coverImage"
                  className="block w-full h-32 bg-white/5 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:border-purple-400 transition-colors duration-200 relative overflow-hidden"
                >
                  {coverImagePreview ? (
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                      <svg
                        className="w-8 h-8 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">
                        Click to upload cover image
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Profile Avatar *
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/20 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "avatar")}
                    className="hidden"
                    id="avatar"
                    required
                  />
                  <label
                    htmlFor="avatar"
                    className="inline-block bg-neutral-700 hover:bg-neutral-800 border border-neutral-600 text-neutral-200 hover:text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    Choose Avatar
                  </label>
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter username"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={register}
              className="w-full bg-neutral-500 hover:bg-neutral-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/25"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Already have an account?
            <Link to="../">
              <span className="text-blue-400 hover:text-blue-300 cursor-pointer ml-1 font-medium">
                Sign in
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
