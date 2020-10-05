import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import { useParams, Link, withRouter } from "react-router-dom"
import Axios from "axios"
import LoadingIcon from "./LoadingIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from "use-immer"
import NotFound from "./NotFound"
function EditPost(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchCompleted":
        draft.title.value = action.title
        draft.body.value = action.body
        draft.isFetching = false
        return
      case "titleChanged":
        draft.title.value = action.value
        if (action.value.trim()) {
          draft.title.hasErrors = false
        }
        return
      case "bodyChanged":
        draft.body.value = action.value
        if (action.value.trim()) {
          draft.body.hasErrors = false
        }
        return
      case "savingStarted":
        draft.isSaving = true
        return
      case "savingCompleted":
        draft.isSaving = false
        return
      case "submitRequest":
        draft.saveCount++
        return
      case "validateTitle":
        if (!action.title.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "Title should not be empty"
        }
        return
      case "validateBody":
        if (!action.body.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "Body should not be empty"
        }
        return
      case "notFound":
        draft.notFound = true
        return
    }
  }
  const [state, dispatcher] = useImmerReducer(ourReducer, {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    saveCount: 0,
    notFound: false,
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function getPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: ourRequest.token,
        })
        if (response.data) {
          dispatcher({
            type: "fetchCompleted",
            title: response.data.title,
            body: response.data.body,
          })
          if (response.data.author.username != appState.user.username) {
            appDispatch({
              type: "addFlashMessage",
              message: "You are not authorized to edit this post.",
            })
            props.history.push(`/post/${state.id}`)
          }
        } else {
          dispatcher({
            type: "notFound",
          })
        }
      } catch (e) {
        console.log("error occurred - ", e)
      }
    }
    getPost()
    return () => ourRequest.cancel()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    dispatcher({ type: "validateTitle", title: state.title.value })
    dispatcher({ type: "validateBody", body: state.body.value })
    dispatcher({ type: "submitRequest" })
  }

  useEffect(() => {
    async function savePost() {
      if (!state.title.hasErrors && !state.body.hasErrors) {
        try {
          dispatcher({ type: "savingStarted" })
          const response = await Axios.post(`/post/${state.id}/edit`, {
            title: state.title.value,
            body: state.body.value,
            token: appState.user.token,
          })
          console.log("edited post success")
          dispatcher({ type: "savingCompleted" })

          appDispatch({
            type: "addFlashMessage",
            message: "Successfully edited the post!!!!",
          })
          props.history.push(`/post/${state.id}`)
        } catch (e) {
          console.log("error", e)
        }
      }
    }
    if (state.saveCount) savePost()
  }, [state.saveCount])

  if (state.notFound) {
    return <NotFound />
  }
  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <Link className="small font-weight bold" to={`/post/${state.id}`}>
        &laquo; Back to view post
      </Link>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
          {state.title.hasErrors ? (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          ) : (
            ""
          )}
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            onChange={(e) =>
              dispatcher({ type: "titleChanged", value: e.target.value })
            }
            value={state.title.value}
            onBlur={(e) =>
              dispatcher({ type: "validateTitle", title: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          {state.body.hasErrors ? (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          ) : (
            ""
          )}
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            onChange={(e) =>
              dispatcher({ type: "bodyChanged", value: e.target.value })
            }
            value={state.body.value}
            onBlur={(e) =>
              dispatcher({ type: "validateBody", body: e.target.value })
            }
          ></textarea>
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? "Saving ..." : "Save Post"}{" "}
        </button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
