import React, { useEffect, useState, useRef, useContext } from 'react'
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
	Tooltip,
	Tag,
	TagLabel,
	TagRightIcon,
	useColorMode
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'
import socketIOClient from 'socket.io-client';
import { Socket } from 'dgram';
import AuthContext from '../AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash/fp'
import Axios from '../config/Axios';
import app from '../config/appConfig';
import moment from 'moment';

interface Sender {
	_id: string,
	name: string,
	email: string
}

interface Message {
	_id: string,
	content: string,
	sender: Sender,
	chatroom: string,
	timestamp: string
}

interface Room {
	_id: string,
	name: string,
	participants: []
}

export default function ChatRoom() {
	const context = useContext(AuthContext);
	const user = context?.authUser
	const params = useParams()
	const {colorMode} = useColorMode()
	const navigate = useNavigate()
	const [room, setRoom] = useState<Room|null>(null);	
	const socket = useRef<any>(null);

	const [isOpen, setIsOpen] = useState(true);
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [typingUsers, setTypingUsers] = useState<String[]>([]);

	useEffect(() => {
		socket.current = socketIOClient(app.BACKEND_URL);
		setIsOpen(true)
		async function fetchMessages() {
			const res = await Axios({
				url: `/chat-rooms/${params.name}`,
				method: 'GET'
			})
		
			if (res.status === 200) {
				console.log(res.data);
				setRoom(res.data.chatRoom)
				setMessages(res.data.messages)
				socket.current.emit('join', {roomId: res.data.chatRoom._id, userId: user?._id});
			}

			// When this component renders, scroll down to last message after X mili seconds.
			setTimeout(() => {
				scrollToBottonMsg(true)
			}, 300)
		}
		fetchMessages()

    return () => {
			// Disconnecting socket connection.
      if (socket.current) socket.current.disconnect();
    };
  }, []);
	
	function handleClose(){
		setIsOpen(false);
		setRoom(null);
		navigate("/chat-rooms")
	}

	function handleSendMessage(){
		if (message.length > 0 && room) {
			const newMessage = {
				content: message,
				sender: user?._id,
				chatroom: room._id
			}
			socket.current.emit("message", newMessage);
			setMessage('');
		}
	}

	useEffect(() => {
		
		scrollToBottonMsg()

		// WS things
		socket.current.on("message", (msg: Message) => {
			if (room?._id === msg.chatroom){
				setMessages([...messages, msg])
			}
			scrollToBottonMsg()
		});

		socket.current.on('typing', (data:any) => {
			if (data?.typingUsers?.length > 0){
				let typingUsers:string[] = _.uniq(data.typingUsers)
				typingUsers = typingUsers.filter(u => u !== user?.name)
				setTypingUsers(typingUsers)
			} else {
				setTypingUsers([])
			}
		});

	}, [room, messages]);

	const messageDiv = useRef<HTMLDivElement|null>(null);
	const chatEndDiv = useRef<HTMLDivElement|null>(null);

	const messageInput = useRef<HTMLInputElement|null>(null);
	const submitButton = useRef<HTMLButtonElement|null>(null);

	const [showUnreadMessage, setShowUnreadMessage] = useState<boolean>(false);

	function scrollToBottonMsg(forceScroll=false){
		if (!messageDiv.current) return;
		if (elementIsVisibleInViewport(chatEndDiv.current) || forceScroll){
			messageDiv.current.scrollTo({
				top: messageDiv.current.scrollHeight,
				behavior: 'smooth'
			})
			setShowUnreadMessage(false);
		} else {
			setShowUnreadMessage(true)
		}
	}

	// Send message by clicking ENTER
	if (messageInput.current && submitButton.current){
		messageInput.current.addEventListener("keydown", function(event) {
			if (event.key === "Enter") {
				submitButton.current?.click();
				scrollToBottonMsg(true);
			}
		});
	}

	// Listening to scroll event for "message_box div" 
	// if scroll is at bottom then set show unread message to FALSE
	function handleMessagesScroll(e:any) {
		if (e?.target){
			if (e.target.offsetHeight + e.target.scrollTop === e.target.scrollHeight) setShowUnreadMessage(false);
		}
	}

	// Detect typing, stopped typing and updating socket
	let timer:any;

	if (messageInput.current){
		messageInput.current.addEventListener('keydown', function(event) {
			if (!isTyping) setIsTyping(true);
		})

		messageInput.current.addEventListener('keyup', function(event) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				setIsTyping(false);
			}, 2000)
		})
	}

	useEffect(() => {
		if (isTyping) {
			socket.current.emit('startTyping', {roomId: room?._id})
		} else { 
			socket.current.emit('stopTyping', {roomId: room?._id})
		}
	}, [isTyping])

	function formatTime(time:string) : string {
		var isToday = moment(time).calendar().includes('Today')
		if (isToday) 
			return moment(time).format('LT')
		else
			return moment(time).format('DD/MM h:mm a')
	}

	return (
		<>
			<Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleClose} size="4xl" >
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>{room?.name}</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6} position="relative">
						<Box 
							ref={messageDiv} 
							height='70vh' 
							overflowY='scroll'
							id="message_box" 
							className="scroll chat-container"
							onScroll={handleMessagesScroll}
							mt={5}
						>
							{
								messages.map(function (msg, index){
									return (
										<Box key={index} className='message_div' mt={2}>
											{
												msg.sender.email === user?.email ? 
												<Box mr={2}>
													<Flex mt={1} justify='end' pr={3} pl={5} >
														<Box mr='3' alignItems='baseline' bg={colorMode === 'dark' ? "#1A120B" : "#C3E2F6"} p={3} borderBottomRadius="xl" borderTopLeftRadius="xl" className='self_messages' >
															<Text fontSize='xl' >{msg.content}</Text>
															<small>{formatTime(msg.timestamp)}</small>
														</Box>
														<Tooltip label={msg.sender.name} placement='right-end' hasArrow>
															<Avatar name={msg.sender.name} bg={getColorCode(msg.sender.name)}/>
														</Tooltip>
													</Flex>
												</Box> :
												<Box >
													<Flex mt={1} pl={3} pr={5}>
														<Tooltip label={msg.sender.name} placement='left-start' hasArrow>
															<Avatar name={msg.sender.name} bg={getColorCode(msg.sender.name)}/>
														</Tooltip>
														<Box ml='3' alignItems='baseline' bg={colorMode === 'dark' ? "#545B77" : "#E6FFFA"} p={3} borderBottomRadius="xl" borderTopRightRadius="xl" className='others_messages'>
															<Text fontSize='xl'>{msg.content}</Text>
															<small>{formatTime(msg.timestamp)}</small>
														</Box>
													</Flex>
												</Box>
											}
										</Box>
									)
								})
							}
						{showUnreadMessage &&
							<div style={{position: 'absolute', bottom: '50px', left: 0, display: 'flex', justifyContent: 'center', width: '100%'}}>
								<Tag
									size='lg'
									borderRadius='full'
									variant='outline'
									colorScheme='blue'
									onClick={() => scrollToBottonMsg(true)}
									cursor='pointer'
								>
									<TagLabel>New Messages</TagLabel>
									<TagRightIcon as={ChevronDownIcon} />
								</Tag>
							</div>}
						<div ref={chatEndDiv} id="chat_end"/>
						</Box>
					</ModalBody>
					
					<Box mx={5} mb={5} >
						{	typingUsers.length === 1 ? 
							`${typingUsers[0]} is typing...` : 
							typingUsers.length > 1 ? 
							`${typingUsers.join(", ")} are typing...` : null
						}
						<Flex minWidth='max-content' alignItems='center' gap='2'>
							<Box width="100%">
								<Input ref={messageInput} variant='outline' id="chat_message" placeholder='Enter message' width='100%' value={message} onChange={(e) => setMessage(e.target.value)} autoFocus/>
							</Box>
							<Spacer />
							<Box >
								<Button ref={submitButton} variant='solid' id="submit_btn" colorScheme='blue' onClick={handleSendMessage}>Send</Button>
							</Box>
						</Flex>
					</Box>
				</ModalContent>
			</Modal>
		</>
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
