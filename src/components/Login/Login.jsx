import React, { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const HOST = import.meta.env.VITE_HOST;
  let [userId, setUserId] = useState("");
  let [password, setPassword] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const navigate = useNavigate();

  let login = async (e) => {
    e.preventDefault();
    let response = await fetch(`${HOST}/api/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ userId, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200) {
          navigate("../")
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }else{   
          setToastMsg(data.message);
          setTimeout(() => setToastMsg(""), 3000);
        }
      })
      .catch((err) => console.error(err));
  };

  const isLoggedIn = async ()=>{
    try {
      const response = await fetch(`${HOST}/api/v1/users/getCurrentUser`,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      const result = await response.json()
      if(result.success){
        navigate("../")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    isLoggedIn()
  },[])

  return (
    <div className="sm:min-h-200 w-full bg-neutral-900 flex items-center mt-0 sm:mt-0 justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-lg">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={userId}
                name="userId"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    login(e);
                  }
                }}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    login(e);
                  }
                }}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={login}
              value="LOGIN"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/25"
            >
              Submit
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-slate-400 text-sm">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Don't have an account?
            <Link to="/register">
              <span className="text-purple-400 hover:text-purple-300 cursor-pointer ml-1 font-medium">
                Sign up
              </span>
            </Link>
          </p>
        </div>
      </div>
      {toastMsg && (
        <div
          className="fixed top-10 bg-red-500 text-black px-4 py-2 rounded shadow-lg z-50
               opacity-100 translate-y-0 transition-all duration-300 ease-in-out hover:bg-black"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default Login;
