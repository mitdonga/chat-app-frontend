const dev = {
	BACKEND_URL: 'http://localhost:3000'
}

const production = {
	BACKEND_URL: 'http://localhost:3000'
}

export default process.env.NODE_ENV === 'production' ? production : dev;