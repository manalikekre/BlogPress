import React, { useEffect, useState } from 'react';

import Axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import LoadingIcon from './LoadingIcon';
import Post from './Post';

function ProfilePosts() {
	const { username } = useParams();
	const [posts, setPosts] = useState([]);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		async function getPosts() {
			try {
				const response = await Axios.get(`/profile/${username}/posts`);
				setPosts(response.data);
				setLoading(false);
			} catch (e) {
				console.log('error - ', e);
			}
		}
		getPosts();
	}, [username]);

	if (isLoading) return <LoadingIcon />;

	return (
		<div className="list-group">
			{posts.map((post) => {
				return <Post isAuthor={true} post={post} key={post._id} />;
			})}
		</div>
	);
}

export default ProfilePosts;
