const dev = {
	BACKEND_URL: 'http://localhost:3000'
}

const production = {
	BACKEND_URL: 'https://chat-app-backend-wr4n.onrender.com'
}

export default process.env.NODE_ENV === 'production' ? production : dev;