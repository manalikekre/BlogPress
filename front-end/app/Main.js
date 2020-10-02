import React, { useState, useReducer, useEffect } from 'react';
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
import CreatePost from './components/CreatePost';
import Axios from 'axios';
import ViewSinglePost from './components/ViewSinglePost';
import StateContext from './StateContext';
import DispatchContext from './DispatchContext';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import Search from './components/Search';
import { CSSTransition } from 'react-transition-group';
Axios.defaults.baseURL = 'http://localhost:8080';

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

	return (
		<StateContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				<BrowserRouter>
					<FlashMessage />
					<Header />
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
					<CSSTransition
						timeout={300}
						classNames="search-overlay"
						unmountOnExit
						in={state.displaySearch}
					>
						<Search />
					</CSSTransition>

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
