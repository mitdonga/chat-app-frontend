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
	Tooltip,
	Tag,
	TagLabel,
	TagRightIcon
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'
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
		// WS things
    socket.current = socketIOClient('http://localhost:3000');
		socket.current.emit('join', chat.roomName);
		socket.current.on("message", (msg: Message) => {
			var messages:Message[] = chat.messages
			messages.push(msg);
			var newChat:ChatRoom = {...chat, messages: messages}
			setChat(newChat)
			scrollToBottonMsg()
		});

		// When this component renders, scroll down to last message after X mili seconds.
		setTimeout(() => {		
			scrollToBottonMsg(true)
		}, 100)

    return () => {
			// Disconnecting socket connection.
      if (socket.current) socket.current.disconnect();
    };
  }, []);

	const [isOpen, setIsOpen] = useState(true);
	const [message, setMessage] = useState('');
	
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

	return (
		<Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleClose} size="4xl" >
			<ModalOverlay />
			<ModalContent position='relative'>
				<ModalHeader>{chat.roomName}</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6} >
					<Box 
						ref={messageDiv} 
						height='70vh' 
						overflowY='scroll' 
						id="message_box" 
						className="scroll"
						onScroll={handleMessagesScroll}
					>
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
					{showUnreadMessage &&
						<div style={{position: 'absolute', bottom: '80px', left: 0, display: 'flex', justifyContent: 'center', width: '100%'}}>
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
				
				<Box mx={5} my={5} >
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
