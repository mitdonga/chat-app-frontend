import React, { useEffect, useState, createContext, useContext, SetStateAction } from "react"
import {
  ChakraProvider,
  Box,
  theme,
	useDisclosure,
	useToast
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { Logo } from "./Logo"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from "./AuthContext"

interface User {
	_id: string,
	name: string,
	email: string
}

export const App = () => {
	const useStr:string|null = localStorage.getItem('user');
	const userObj = useStr ? JSON.parse(useStr) : null;
	const [authUser, setAuthenticatedUser] = useState<User|null>(userObj);

	function setAuthUser(user:User){
		setAuthenticatedUser(user);
	}
	
	return (
		<ChakraProvider theme={theme}>
			<AuthContext.Provider value={{authUser, setAuthUser}}>
				<ToastContainer />
				<Box textAlign="center" fontSize="xl">
					<Navbar />
					<BrowserRouter>
						<Routes>
							<Route path="/" element={authUser ? <Navigate to = "/chat-rooms" /> : <Login/>} />
							<Route
								path="/chat-rooms"
								element={authUser ? <Dashboard /> : <Login/>} 
							/>
							<Route
								path="/chat-rooms/:name"
								element={authUser ? <ChatRoom /> : <Login/>} 
							/>
							<Route path="/login" element={<Login />} />
							<Route path="/signup" element={<Signup />} />
						</Routes>
					</BrowserRouter>
				</Box>
			</AuthContext.Provider>
		</ChakraProvider>
	)
}
