import React, { useEffect, useState } from "react"
import {
  ChakraProvider,
  Box,
  theme,
	useDisclosure,
	useToast
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { Logo } from "./Logo"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const App = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [username, setUsername] = useState(null);
	const toast = useToast()

	function handleUsername(): void{
		var user:any = document.getElementById("username_input");
		if (user?.value?.length >= 3) {
			setUsername(user.value);
			onClose();
		} else {
			toast({
				title: "Please enter valid username",
				status: 'error',
				position: 'top',
				isClosable: true,
			})
		}
	}

	useEffect(() => {
		if (username === null){
			onOpen();
		}
	}, []);

	return (
		<ChakraProvider theme={theme}>
			{/* <Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Please Set Your User Name</ModalHeader>
					<ModalBody>
						<Input id="username_input" placeholder='Enter your username' size='lg' />
					</ModalBody>

					<ModalFooter>
						<Button colorScheme='blue' mr={3} onClick={handleUsername}>
							Submit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal> */}
			<ToastContainer />
			<Box textAlign="center" fontSize="xl">
				<Navbar username={username} />
				{ username && <Dashboard username={username} /> }

				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Login/>}>
							<Route
								path="/chat-rooms"
								element={username ? <Dashboard username={username}/> : <Login/>} 
							/>
						</Route>
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
					</Routes>
				</BrowserRouter>

			</Box>
		</ChakraProvider>
	)
}
