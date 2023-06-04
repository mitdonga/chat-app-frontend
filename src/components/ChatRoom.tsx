import React, { useEffect, useState, useRef } from 'react'
import {
  Text,
  Flex,
	Button,
	Box,
	Modal,
	ModalBody,
	ModalContent,
	ModalOverlay,
	ModalHeader,
	ModalCloseButton,
	Input,
	Spacer,
	Avatar,
	Tooltip
} from '@chakra-ui/react';
import io from 'socket.io-client';
import socketIOClient from 'socket.io-client';
import { Socket } from 'dgram';


interface Props {
	username: string,
	chat: ChatRoom,
	setChat: React.Dispatch<React.SetStateAction<ChatRoom | null>>
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

export default function ChatRoom({ username, chat, setChat }: Props) {
	const socket = useRef<any>(null);

	useEffect(() => {
    socket.current = socketIOClient('http://localhost:3000');
		socket.current.emit('join', chat.roomName);
		socket.current.on("message", (msg: Message) => {
			console.log("Received message", msg);
			var messages:Message[] = chat.messages
			messages.push(msg);
			// console.log(chat.messages);
			
			var newChat:ChatRoom = {...chat, messages: messages}
			setChat(newChat)
			scrollToBottonMsg()
		});
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

	const [isOpen, setIsOpen] = useState(true);
	const [message, setMessage] = useState('');
	const bottomRef = useRef<any>(null);
	
	function handleClose(){
		setIsOpen(false);
		setChat(null);
	}

	function handleSendMessage(){
		if (message.length > 0) {
			const newMessage = {
				username: username,
				content: message,
				roomId: chat.roomId,
				roomName: chat.roomName
			}
			socket.current.emit("message", newMessage);
			setMessage('');
		}
	}

	useEffect(() => {
		scrollToBottonMsg()
	}, [chat]);

	const messageBody = document.getElementById('message_box');
	const chatEndDiv = document.getElementById('chat_end');
	function scrollToBottonMsg(forceScroll=false){
		if (messageBody){
			if (elementIsVisibleInViewport(chatEndDiv) || forceScroll){
				messageBody.scrollTo({
					top: messageBody.scrollHeight,
					behavior: 'smooth'
				})
			}
		}
	}

	const messageInput = document.getElementById("chat_message");
	const submitButton = document.getElementById("submit_btn");

	if (messageInput && submitButton){
		messageInput.addEventListener("keydown", function(event) {
			if (event.key === "Enter") {
				submitButton.click();
				scrollToBottonMsg(true);
			}
		});
	}

	return (
		<Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleClose} size="4xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>{chat.roomName}</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6} >
					<Box height='70vh' overflowY='scroll' id="message_box" className="scroll">
					{
						chat.messages.map(function (msg, index){
							return (
								<div key={index}>
									{
										msg.messenger.username === username ? 
										<Flex mt={1} justify='end' mr={3}>
											<Box mr='3' alignItems='baseline'>
												<Text fontSize='xl' mt={3}>{msg.content}</Text>
											</Box>
											<Tooltip label={msg.messenger.username} placement='right-end' hasArrow>
												<Avatar name={msg.messenger.username} bg={getColorCode(msg.messenger.username)}/>
											</Tooltip>
										</Flex> :
										<Flex mt={1}>
											<Tooltip label={msg.messenger.username} placement='left-start' hasArrow>
												<Avatar name={msg.messenger.username} bg={getColorCode(msg.messenger.username)}/>
											</Tooltip>
											<Box ml='3' alignItems='baseline'>
												<Text fontSize='xl' mt={3}>{msg.content}</Text>
											</Box>
										</Flex>
									}
								</div>
							)
						})
					}
					<div id="chat_end"/>
					</Box>
				</ModalBody>
				
				<Box mx={5} my={5} >
					<Flex minWidth='max-content' alignItems='center' gap='2'>
						<Box width="100%">
							<Input variant='outline' id="chat_message" placeholder='Enter message' width='100%' value={message} onChange={(e) => setMessage(e.target.value)} autoFocus/>
						</Box>
						<Spacer />
						<Box >
							<Button variant='solid' id="submit_btn" colorScheme='blue' onClick={handleSendMessage}>Send</Button>
						</Box>
					</Flex>
				</Box>
			</ModalContent>
		</Modal>
	)
}

function getColorCode(name: string): string {
  const firstLetter = name.charAt(0).toLowerCase();

  const colorCodes: { [key: string]: string} = {
    a: '#FF0000', // Red
    b: '#FFA500', // Orange
    c: '#FFFF00', // Yellow
    d: '#00FF00', // Lime
    e: '#008000', // Green
    f: '#00FFFF', // Cyan
    g: '#0000FF', // Blue
    h: '#8A2BE2', // BlueViolet
    i: '#FF00FF', // Magenta
    j: '#FFC0CB', // Pink
    k: '#FF69B4', // HotPink
    l: '#800000', // Maroon
    m: '#808000', // Olive
    n: '#808080', // Gray
    o: '#A52A2A', // Brown
    p: '#FFD700', // Gold
    q: '#7FFF00', // Chartreuse
    r: '#FF4500', // OrangeRed
    s: '#800080', // Purple
    t: '#000080', // Navy
    u: '#008080', // Teal
    v: '#D2691E', // Chocolate
    w: '#DC143C', // Crimson
    x: '#FF7F50', // Coral
    y: '#8B0000', // DarkRed
    z: '#4B0082'  // Indigo
  };

  const colorCode: string = colorCodes[firstLetter] || '#000000'; // Default to black if no color code is found

  return colorCode;
}

const elementIsVisibleInViewport = (el:HTMLElement|null, partiallyVisible = false) => {
	if (!el) return false;
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return partiallyVisible
    ? ((top > 0 && top < innerHeight) ||
        (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};
