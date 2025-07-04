import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Logout() {
    const HOST = import.meta.env.VITE_HOST
    const navigate = useNavigate()

    const logOut = async ()=>{
      try {
        const response = await fetch(`${HOST}/api/v1/users/logout`,{
              method: "GET",
              credentials: "include",
          })
          .then((data)=>data.json())
          .then((data)=>{
              if(data.statusCode === 200){
                  navigate("../login")
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
              }
          })
      } catch (error) {
        //console.log(error)
      }
    }

    useEffect(()=>{

        logOut()
    },[])

  return (
    <div>
      Logout
    </div>
  )
}

export default Logout
