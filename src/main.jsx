import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './index.css'
import {Login,Register,Home,Logout,YouTubeWatch,Index,YouTubeSubscriptions, VideoUploadPage, SearchResult,YouTubePlaylists,YouTubeHistory,YouTubeLikevideo} from './components/index.js'
import Layout from "./Layout.jsx"
import YouTubeProfile from './components/YouTubeProfile/YouTubeProfile.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout/>}>
      <Route path='login' element={<Login/>}/>
      <Route path='subscriptions' element={<YouTubeSubscriptions/>}/>
      <Route path='logout' element={<Logout/>}/>
      <Route path='register' element={<Register/>}/>
      <Route path='index' element={<Home/>}/>
      <Route path='getChannelProfile/:userName' element={<YouTubeProfile/>}/>
      <Route path='video/:videoId' element={<YouTubeWatch/>}/>
      <Route path='video/uploadVideo' element={<VideoUploadPage/>}/>
      <Route path='search/:query' element={<SearchResult/>}/>
      <Route path='playlist' element={<YouTubePlaylists/>}/>
      <Route path='history' element={<YouTubeHistory/>}/>
      <Route path='likevideo' element={<YouTubeLikevideo/>}/>
      <Route path='' element={<Index/>}/>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <RouterProvider router={router}/>
  // </StrictMode>,
)
