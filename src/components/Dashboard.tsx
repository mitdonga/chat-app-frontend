import React, { useContext, useEffect, useState } from 'react'
import axios from "axios";
import app from '../config/appConfig'
import {
  Text,
  Flex,
  Card,
  Container,
	CardBody,
	Stack,
	CardFooter,
	Heading,
	Button,
	Box,
	Image,
} from '@chakra-ui/react';
import ChatRoom from './ChatRoom';
import AuthContext from '../AuthContext';
import { toast } from 'react-toastify';
import Axios from '../config/Axios';

interface Props {
	username: string
}

interface Message {
	content: string,
	messenger: {
		username: string,
		_id: string|null
	}
}

interface ChatRoom {
	roomId: Number,
	roomName: string,
	messages: Message[]
}

export default function Dashboard() {
	const context = useContext(AuthContext);
	const [chatRooms, setChatRooms] = useState([]);
	const [chat, setChat] = useState<null | ChatRoom>(null);

	async function fetchChatRooms () {
		try {
			const response = await Axios({
				url: `/chat-rooms`,
				method: 'GET'
			})
			if (response.status === 200) {
				setChatRooms(response.data);
			} else {
				toast.error(response.data.message, { theme: "colored" })
			}
		} catch (error) {
			console.log(error)
		}
	}

	function showChats(chatRoom: ChatRoom) {
		setChat(chatRoom);
	}

	useEffect(() => {
		if (context?.authUser) {
			console.log("Inside Dashboard.. ");
			
			// setTimeout(() => fetchChatRooms(), 2000)
			fetchChatRooms()
		}
	}, []);

	return (
		<Box p={12}>
			<Container maxW={'5xl'} mt={12}>
				<Flex flexWrap="wrap" gridGap={6} justify="center">
					{
						chatRooms.length > 0 && 
						chatRooms.map((chatRoom: ChatRoom) => {
							return (
								<Card maxW='sm' onClick={() => showChats(chatRoom)} key={chatRoom.roomName}>
									<CardBody>
										<Image
											src='https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
											alt='Green double couch with wooden legs'
											borderRadius='lg'
										/>
										<Stack mt='6' spacing='3'>
											<Heading size='md'>{chatRoom.roomName}</Heading>
											<Button variant='solid' colorScheme='blue'>
												Open Chats
											</Button>
										</Stack>
									</CardBody>
								</Card>
							)
						})
					}
				</Flex>
			</Container>
			{/* { chat && <ChatRoom username={context?.authUser?.name} chat={chat} setChat={setChat} />} */}
		</Box>
	)
}


