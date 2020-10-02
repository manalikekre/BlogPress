import React, { useEffect, useContext } from "react"
import Page from "./Page"
import { useParams } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import { useImmer } from "use-immer"

function Profile() {
  const appState = useContext(StateContext)

  const { username } = useParams()
  const [state, setState] = useImmer({
    profileFetching: true,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "0" },
    },
  })

  useEffect(() => {
    try {
      async function fetchProfile() {
        setState((draft) => {
          draft.profileFetching = true
        })
        const response = await Axios.post(`/profile/${username}`, {
          token: appState.user.token,
        })
        setState((draft) => {
          draft.profileData = response.data
          draft.profileFetching = false
        })
      }
      fetchProfile()
    } catch (e) {
      console.log("problem", e)
    }
  }, [])
  return (
    <Page title="Profile">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />{" "}
        {username}
        {!state.profileFetching &&
        state.profileData.profileUsername != appState.user.username ? (
          !state.profileData.isFollowing ? (
            <button className="btn btn-primary btn-sm ml-2">
              Follow <i className="fas fa-user-plus"></i>
            </button>
          ) : (
            <button className="btn btn-primary btn-sm ml-2">
              Unfollow <i className="fas fa-user-minus"></i>
            </button>
          )
        ) : (
          ""
        )}
      </h2>

      <div className=" state.profileData-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </a>
        <a href="#" className=" nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </a>
      </div>

      <ProfilePosts />
    </Page>
  )
}

export default Profile
