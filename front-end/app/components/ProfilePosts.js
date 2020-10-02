import React, { useEffect, useState } from "react"

import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingIcon from "./LoadingIcon"

function ProfilePosts() {
  const { username } = useParams()
  const [posts, setPosts] = useState([])
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    async function getPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`)
        setPosts(response.data)
        setLoading(false)
      } catch (e) {
        console.log("error - ", e)
      }
    }
    getPosts()
  }, [username])

  if (isLoading) return <LoadingIcon />

  return (
    <div className="list-group">
      {posts.map((post) => {
        post
        const date = new Date(post.createdDate)
        const formattedDate = `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`

        return (
          <Link
            key={post._id}
            to={`/post/${post._id}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={post.author.avatar} />{" "}
            <strong>{post.title}</strong>
            <span className="text-muted small"> on {formattedDate} </span>
          </Link>
        )
      })}
    </div>
  )
}

export default ProfilePosts
