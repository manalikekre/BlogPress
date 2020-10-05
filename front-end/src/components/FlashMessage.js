import React, { useEffect, useContext } from "react"

import StateContext from "../StateContext"

function FlashMessage(props) {
  const appState = useContext(StateContext)

  return (
    <div className="floating-alerts">
      {appState.flashMessages.map((msg, index) => {
        return (
          <div
            key={index}
            className="alert alert-success test-cetner floating-alert shadow-sm"
          >
            {msg}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessage
