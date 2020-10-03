import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';

function HeaderLoggedIn(props) {
	const appDispatch = useContext(DispatchContext);
	const appState = useContext(StateContext);

	function handleLogout() {
		appDispatch({
			type: 'loggedOut',
		});
	}

	function displaySearch(e) {
		e.preventDefault();
		appDispatch({
			type: 'displaySearch',
		});
	}

	useEffect(() => {
		document.addEventListener('keyup', keyListener);
		return () => document.removeEventListener('keyup', keyListener);
	}, []);

	function keyListener(e) {
		if (e.keyCode == 27) {
			appDispatch({
				type: 'hideSearch',
			});
		}
	}
	return (
		<div className="flex-row my-3 my-md-0">
			<a
				onClick={displaySearch}
				href="#"
				className="text-white mr-2 header-search-icon"
			>
				<i className="fas fa-search"></i>
			</a>
			<span
				onClick={() => appDispatch({ type: 'toggleChat' })}
				className={
					'mr-2 header-chat-icon ' +
					(appState.unreadChatCount ? 'text-danger' : 'text-white')
				}
			>
				<i className="fas fa-comment"></i>
				{appState.unreadChatCount ? (
					<span className="chat-count-badge text-white">
						{' '}
						{appState.unreadChatCount < 10 ? appState.unreadChatCount : '9+'}
					</span>
				) : (
					''
				)}
			</span>
			<Link to={`/profile/${appState.user.username}`} className="mr-2">
				<img className="small-header-avatar" src={appState.user.avatar} />
			</Link>
			<Link className="btn btn-sm btn-success mr-2" to="/create-post">
				Create Post
			</Link>
			<button onClick={handleLogout} className="btn btn-sm btn-secondary">
				Sign Out
			</button>
		</div>
	);
}

export default HeaderLoggedIn;
