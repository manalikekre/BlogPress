import React, { useEffect, useContext } from 'react';
import Page from './Page';
import { useParams, NavLink, Switch, Route } from 'react-router-dom';
import Axios from 'axios';
import StateContext from '../StateContext';
import ProfilePosts from './ProfilePosts';
import ProfileFollowers from './ProfileFollowers';
import ProfileFollowing from './ProfileFollowing';
import { useImmer } from 'use-immer';

function Profile() {
	const appState = useContext(StateContext);

	const { username } = useParams();
	const [state, setState] = useImmer({
		followActionLoading: false,
		startFollowingRequestCount: 0,
		stopFollowingRequestCount: 0,
		profileData: {
			profileUsername: '...',
			profileAvatar: 'https://gravatar.com/avatar/?s=128',
			isFollowing: false,
			counts: { postCount: '', followerCount: '', followingCount: '0' },
		},
	});

	useEffect(() => {
		try {
			async function fetchProfile() {
				const response = await Axios.post(`/profile/${username}`, {
					token: appState.user.token,
				});
				setState((draft) => {
					draft.profileData = response.data;
					draft.profileFetching = false;
				});
			}
			fetchProfile();
		} catch (e) {
			console.log('problem', e);
		}
	}, [username]);

	function startFollowing() {
		setState((draft) => {
			draft.startFollowingRequestCount++;
		});
	}

	useEffect(() => {
		if (state.startFollowingRequestCount > 0) {
			setState((draft) => {
				draft.followActionLoading = true;
			});
			const ourRequest = Axios.CancelToken.source();

			async function fetchData() {
				try {
					const response = await Axios.post(
						`/addFollow/${state.profileData.profileUsername}`,
						{
							token: appState.user.token,
						}
					);
					setState((draft) => {
						draft.profileData.isFollowing = true;
						draft.profileData.counts.followerCount++;
						draft.followActionLoading = false;
					});
				} catch (e) {
					console.log('problem', e);
				}
			}
			fetchData();
			return () => {
				ourRequest.cancel();
			};
		}
	}, [state.startFollowingRequestCount]);

	function stopFollowing() {
		setState((draft) => {
			draft.stopFollowingRequestCount++;
		});
	}

	useEffect(() => {
		if (state.stopFollowingRequestCount > 0) {
			setState((draft) => {
				draft.followActionLoading = true;
			});
			const ourRequest = Axios.CancelToken.source();

			async function fetchData() {
				try {
					const response = await Axios.post(
						`/removeFollow/${state.profileData.profileUsername}`,
						{
							token: appState.user.token,
						}
					);
					setState((draft) => {
						draft.profileData.isFollowing = false;
						draft.profileData.counts.followerCount--;
						draft.followActionLoading = false;
					});
				} catch (e) {
					console.log('problem', e);
				}
			}
			fetchData();
			return () => {
				ourRequest.cancel();
			};
		}
	}, [state.stopFollowingRequestCount]);

	return (
		<Page title="Profile">
			<h2>
				<img className="avatar-small" src={state.profileData.profileAvatar} />{' '}
				{username}
				{appState.loggedIn &&
				!state.profileFetching &&
				state.profileData.profileUsername != '...' &&
				state.profileData.profileUsername != appState.user.username ? (
					!state.profileData.isFollowing ? (
						<button
							onClick={startFollowing}
							disabled={state.followActionLoading}
							className="btn btn-primary btn-sm ml-2"
						>
							Follow <i className="fas fa-user-plus"></i>
						</button>
					) : (
						<button
							onClick={stopFollowing}
							disabled={state.followActionLoading}
							className="btn btn-danger btn-sm ml-2"
						>
							Unfollow <i className="fas fa-user-times"></i>
						</button>
					)
				) : (
					''
				)}
			</h2>

			<div className=" state.profileData-nav nav nav-tabs pt-2 mb-4">
				<NavLink
					exact
					to={`/profile/${state.profileData.profileUsername}`}
					className="nav-item nav-link"
				>
					Posts: {state.profileData.counts.postCount}
				</NavLink>
				<NavLink
					to={`/profile/${state.profileData.profileUsername}/followers`}
					className=" nav-item nav-link"
				>
					Followers: {state.profileData.counts.followerCount}
				</NavLink>
				<NavLink
					to={`/profile/${state.profileData.profileUsername}/following`}
					className="nav-item nav-link"
				>
					Following: {state.profileData.counts.followingCount}
				</NavLink>
			</div>

			<Switch>
				<Route exact path="/profile/:username">
					<ProfilePosts />
				</Route>
				<Route path="/profile/:username/followers">
					<ProfileFollowers />
				</Route>
				<Route path="/profile/:username/following">
					<ProfileFollowing />
				</Route>
			</Switch>
		</Page>
	);
}

export default Profile;
