import React from 'react'

interface User {
	_id: string,
	name: string,
	email: string
}

interface UserContextProps {
	authUser: User|null,
	setAuthUser: (user: User) => void
}
const AuthContext = React.createContext<UserContextProps|null>(null);

export default AuthContext;
