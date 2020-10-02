import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Post(props) {
	const post = props.post;
	const date = new Date(post.createdDate);
	const formattedDate = `${date.getDate()}/${
		date.getMonth() + 1
	}/${date.getFullYear()}`;
	return (
		<Link
			onClick={props.onClick}
			to={`/post/${post._id}`}
			className="list-group-item list-group-item-action"
		>
			<img className="avatar-tiny" src={post.author.avatar} />{' '}
			<strong>{post.title}</strong>{' '}
			<span className="text-muted small">
				{!props.isAuthor && <>by {post.author.username}</>}
				on {formattedDate}{' '}
			</span>
		</Link>
	);
}

export default Post;
