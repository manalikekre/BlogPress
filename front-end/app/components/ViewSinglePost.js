import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import { useParams, Link, withRouter } from "react-router-dom"
import Axios from "axios"
import LoadingIcon from "./LoadingIcon"
import ReactMarkdown from "react-markdown"
import ReactTooltip from "react-tooltip"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const [isLoading, setLoading] = useState(true)
  const { id } = useParams()

  const [post, setPost] = useState({
    _id: "",
    title: "",
    body: "",
    createdDate: "",
    author: { username: "", avatar: "" },
    isVisitorOwner: false,
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function getPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: ourRequest.token,
        })

        if (
          response.data &&
          response.data.author.username == appState.user.username
        ) {
          response.data.isVisitorOwner = true
        }
        setPost(response.data)
        console.log(response.data)
        setLoading(false)
      } catch (e) {
        console.log("error occurred - ", e)
      }
    }
    getPost()
    return () => ourRequest.cancel()
  }, [id])

  async function deletePost() {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete the post?"
    )
    if (!shouldDelete) return

    try {
      console.log(appState)
      const response = await Axios.delete(`/post/${id}`, {
        data: { token: appState.user.token },
      })
      if (response.data == "Success") {
        appDispatch({
          type: "addFlashMessage",
          message: "Post deleted successfully!",
        })
        props.history.push(`/profile/${appState.user.username}`)
      } else {
        appDispatch({
          type: "addFlashMessage",
          message: "Unable to delete the post! Please retry later",
        })
      }
    } catch (e) {
      console.log("error occurred - ", e)
    }
  }

  if (!isLoading && !post) {
    return <NotFound />
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    )

  const date = new Date(post.createdDate)
  const formattedDate = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {post.isVisitorOwner && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tip="Edit"
              data-for="edit"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>{" "}
            <ReactTooltip id="edit" />
            <a
              data-tip="Delete"
              data-for="delete"
              className="delete-post-button text-danger"
              title="Delete"
              onClick={deletePost}
            >
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{" "}
        on {formattedDate}
      </p>
      <ReactMarkdown source={post.body} />
    </Page>
  )
}

export default withRouter(ViewSinglePost)
