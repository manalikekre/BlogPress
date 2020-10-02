import React, { useEffect, useState } from 'react';

import Axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import LoadingIcon from './LoadingIcon';

function ProfileFollowers() {
	const { username } = useParams();
	const [posts, setPosts] = useState([]);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		async function getPosts() {
			try {
				const response = await Axios.get(`/profile/${username}/followers`);
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
			{posts.map((follower, index) => {
				return (
					<Link
						key={index}
						to={`/profile/${follower.username}`}
						className="list-group-item list-group-item-action"
					>
						<img className="avatar-tiny" src={follower.avatar} />{' '}
						{follower.username}
					</Link>
				);
			})}
		</div>
	);
}

export default ProfileFollowers;
