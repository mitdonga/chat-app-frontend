import React from 'react'

interface User {
	name: string|null,
	email: string|null
}

interface UserContextProps {
	authUser: User|null,
	setAuthUser: (user: User) => void
}
const AuthContext = React.createContext<UserContextProps|null>(null);

export default AuthContext;
