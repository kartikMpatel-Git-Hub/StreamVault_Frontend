
const handleAddToPlaylist = async (
  playlist,
  pointedVideoId,
  setAllPlaylists,
  HOST
) => {
  try {
    const response = await fetch(
      `${HOST}/api/v1/playLists/addVideo/${pointedVideoId}/${playlist.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    let res = await response.json();
    if (res.statusCode === 200) {
      setAllPlaylists((prev) =>
        prev.map((p) =>
          p._id === playlist.id
            ? { ...p, video: [p.video, pointedVideoId] }
            : p
        )
      );
      return true;
    }
  } catch (error) {
    console.log(error)
    return false
  }
  return false;
};

const handleRemoveFromPlaylist = async (
  playlist,
  pointedVideoId,
  setAllPlaylists,
  HOST
) => {
  const response = await fetch(
    `${HOST}/api/v1/playLists/removeVideo/${pointedVideoId}/${playlist.id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  let res = await response.json();
  if (res.statusCode === 200) {
    setAllPlaylists((prev) =>
      prev && prev.map((p) =>
        p._id === playlist.id
          ? {
              ...p,
              video: p.video?.filter((videoId) => videoId !== pointedVideoId),
            }
          : p
      )
    );
    return true;
  }
  return false;
};

export {handleAddToPlaylist,handleRemoveFromPlaylist}