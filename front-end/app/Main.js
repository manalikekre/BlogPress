import React, { useState, useReducer, useEffect, Suspense } from 'react';
import { useImmerReducer } from 'use-immer';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

// My components
import Header from './components/Header';
import HomeGuest from './components/HomeGuest';
import FlashMessage from './components/FlashMessage';
import Home from './components/Home';
import Footer from './components/Footer';
import About from './components/About';
import Terms from './components/Terms';
const CreatePost = React.lazy(() => import('./components/CreatePost'));
const Search = React.lazy(() => import('./components/Search'));
const Chat = React.lazy(() => import('./components/Chat'));
import Axios from 'axios';
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'));
import StateContext from './StateContext';
import DispatchContext from './DispatchContext';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import { CSSTransition } from 'react-transition-group';
import LoadingIcon from './components/LoadingIcon';

Axios.defaults.baseURL = process.env.BACKENDURL || '';

function Main() {
	const initialState = {
		loggedIn: Boolean(localStorage.getItem('blogpressToken')),
		flashMessages: [],
		user: {
			token: localStorage.getItem('blogpressToken'),
			username: localStorage.getItem('blogpressUsername'),
			avatar: localStorage.getItem('blogpressAvatar'),
		},
		displaySearch: false,
		isChatOpen: false,
		unreadChatCount: 0,
	};

	function ourReducer(draft, action) {
		switch (action.type) {
			case 'loggedIn':
				draft.loggedIn = true;
				draft.user = action.data;
				return;
			case 'loggedOut':
				draft.loggedIn = false;
				return;
			case 'addFlashMessage':
				draft.flashMessages.push(action.message);
				return;
			case 'displaySearch':
				draft.displaySearch = true;
				return;
			case 'hideSearch':
				draft.displaySearch = false;
				return;
			case 'toggleChat':
				draft.isChatOpen = !draft.isChatOpen;
				return;
			case 'closeChat':
				draft.isChatOpen = false;
				return;
			case 'incrementUnreadChatCount':
				draft.unreadChatCount++;
				return;
			case 'clearUnreadChatCount':
				draft.unreadChatCount = 0;
				return;
		}
	}
	const [state, dispatch] = useImmerReducer(ourReducer, initialState);
	useEffect(() => {
		if (state.loggedIn) {
			// Save to local storage
			localStorage.setItem('blogpressToken', state.user.token);
			localStorage.setItem('blogpressUsername', state.user.username);
			localStorage.setItem('blogpressAvatar', state.user.avatar);
		} else {
			// Save to local storage
			localStorage.removeItem('blogpressToken');
			localStorage.removeItem('blogpressUsername');
			localStorage.removeItem('blogpressAvatar');
		}
	}, [state.loggedIn]);

	//check if token expired or not
	useEffect(() => {
		if (state.loggedIn) {
			const ourRequest = Axios.CancelToken.source();
			async function fetchResults() {
				try {
					const response = await Axios.post(
						'/checkToken',
						{ token: state.user.token },
						{ cancelToken: ourRequest.CancelToken }
					);
					if (!response.data) {
						dispatch({ type: 'loggedOut' });
						dispatch({
							type: 'addFlashMessage',
							message: 'Your session has expired. Please log in again.',
						});
					}
				} catch (e) {
					console.log('Error occurred - ', e);
				}
			}
			fetchResults();
			return ourRequest.cancel();
		}
	}, []);

	return (
		<StateContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				<BrowserRouter>
					<FlashMessage />
					<Header />
					<Suspense fallback={<LoadingIcon />}>
						<Switch>
							<Route path="/" exact>
								{state.loggedIn ? <Home /> : <HomeGuest />}
							</Route>
							<Route path="/about-us">
								<About />
							</Route>
							<Route path="/profile/:username">
								<Profile />
							</Route>
							<Route path="/post/:id" exact>
								<ViewSinglePost />
							</Route>
							<Route path="/post/:id/edit" exact>
								<EditPost />
							</Route>

							<Route path="/terms">
								<Terms />
							</Route>
							<Route path="/create-post">
								<CreatePost />
							</Route>
							<Route>
								<NotFound />
							</Route>
						</Switch>
					</Suspense>
					<CSSTransition
						timeout={300}
						classNames="search-overlay"
						unmountOnExit
						in={state.displaySearch}
					>
						<div className="search-overlay">
							<Suspense fallback="">
								<Search />
							</Suspense>
						</div>
					</CSSTransition>
					<Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
					<Footer />
				</BrowserRouter>
			</DispatchContext.Provider>
		</StateContext.Provider>
	);
}

ReactDOM.render(<Main />, document.querySelector('#app'));

if (module.hot) {
	module.hot.accept();
}
