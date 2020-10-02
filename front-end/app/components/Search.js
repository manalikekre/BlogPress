import React, { useEffect, useContext } from 'react';
import DispatchContext from '../DispatchContext';
import Axios from 'axios';
import { useImmer } from 'use-immer';
import { Link } from 'react-router-dom';
import Post from './Post';

function Search() {
	const appDispatch = useContext(DispatchContext);
	const [state, setState] = useImmer({
		searchTerm: '',
		searchResults: [],
		show: 'neither',
		requestCount: 0,
	});
	function hideSearch() {
		appDispatch({
			type: 'hideSearch',
		});
	}
	useEffect(() => {
		const delayInMilliSeconds = 700;
		if (state.searchTerm.trim()) {
			const timeout = setTimeout(() => {
				setState((draft) => {
					draft.requestCount++;
				});
			}, delayInMilliSeconds);
			return () => clearTimeout(timeout);
		} else {
			setState((draft) => {
				draft.show = 'neither';
			});
		}
	}, [state.searchTerm]);

	useEffect(() => {
		if (state.requestCount) {
			const ourRequest = Axios.CancelToken.source();
			async function fetchResults() {
				try {
					const response = await Axios.post(
						'/search',
						{ searchTerm: state.searchTerm },
						{ cancelToken: ourRequest.CancelToken }
					);
					// console.log(response.data)
					setState((draft) => {
						draft.searchResults = response.data;
						draft.show = 'results';
					});
				} catch (e) {
					console.log('Error occurred - ', e);
				}
			}
			fetchResults();
			return ourRequest.cancel();
		}
	}, [state.requestCount]);

	function onChangeHandler(e) {
		const value = e.target.value;
		setState((draft) => {
			(draft.searchTerm = value), (draft.show = 'loading');
		});
	}
	return (
		<div className="search-overlay">
			<div className="search-overlay-top shadow-sm">
				<div className="container container--narrow">
					<label htmlFor="live-search-field" className="search-overlay-icon">
						<i className="fas fa-search"></i>
					</label>
					<input
						autoFocus
						type="text"
						autoComplete="off"
						id="live-search-field"
						className="live-search-field"
						placeholder="What are you interested in?"
						onChange={onChangeHandler}
					/>
					<span onClick={hideSearch} className="close-live-search">
						<i className="fas fa-times-circle"></i>
					</span>
				</div>
			</div>
			<div className="search-overlay-bottom">
				<div className="container container--narrow py-3">
					{state.show == 'loading' && (
						<div className="circle-loader circle-loader--visible" />
					)}
					{state.show == 'results' && (
						<div className="live-search-results live-search-results--visible">
							<div className="list-group shadow-sm">
								{Boolean(state.searchResults.length) && (
									<div className="list-group-item active">
										<strong>Search Results</strong> (
										{state.searchResults.length} items found)
									</div>
								)}

								{state.searchResults.map((post) => {
									return (
										<Post post={post} key={post._id} onClick={hideSearch} />
									);
								})}
							</div>
							{!Boolean(state.searchResults.length) && (
								<p className="alert alert-danger text-center">
									Sorry! No results found with that keyword!
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Search;
