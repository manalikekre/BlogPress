import React, { useEffect, useState, useContext } from 'react';
import Axios from 'axios';
import DispatchContext from '../DispatchContext';

function HeaderLoggedOut(props) {
	const appDispatch = useContext(DispatchContext);

	const [username, setUsername] = useState();
	const [password, setPassword] = useState();

	async function handleSubmit(e) {
		e.preventDefault();
		try {
			const response = await Axios.post('/login', {
				username,
				password,
			});
			console.log(response);
			if (response.data) {
				console.log('login successful');

				appDispatch({
					type: 'loggedIn',
					data: response.data,
				});
				appDispatch({
					type: 'addFlashMessage',
					message: 'You have successfully logged in.',
				});
			} else {
				console.log('login failed');
				appDispatch({
					type: 'addFlashMessage',
					message: 'Invalid username / password',
				});
			}
		} catch (e) {
			console.log('there was a problem');
		}
	}

	return (
		<form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
			<div className="row align-items-center">
				<div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
					<input
						name="username"
						className="form-control form-control-sm input-dark"
						type="text"
						placeholder="Username"
						autoComplete="off"
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
					<input
						name="password"
						className="form-control form-control-sm input-dark"
						type="password"
						placeholder="Password"
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<div className="col-md-auto">
					<button className="btn btn-success btn-sm">Sign In</button>
				</div>
			</div>
		</form>
	);
}

export default HeaderLoggedOut;
