const dev = {
	BACKEND_URL: 'http://localhost:3000'
}

const production = {
	BACKEND_URL: 'https://chat-app-mitpatel5344-gmailcom.vercel.app'
}

export default process.env.NODE_ENV === 'production' ? production : dev;