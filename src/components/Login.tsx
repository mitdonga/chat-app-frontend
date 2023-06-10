import React, { useContext, useState } from 'react'
import {
	Input,
	InputGroup,
	InputRightElement,
	Button,
	Container,
	FormControl,
	Icon,
	Highlight
} from '@chakra-ui/react'
import { useForm, SubmitHandler } from "react-hook-form";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom';
import _ from 'lodash/fp';
import axios from "axios";
import app from '../config/appConfig';
import { toast } from 'react-toastify';
import AuthContext from '../AuthContext';
import Axios from '../config/Axios';

interface Inputs {
	email: string,
	password: string
}

export default function Login() {
	const userContext = useContext(AuthContext)
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>({
		mode: 'onBlur',
		reValidateMode: 'onBlur'
	});
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
		// console.log(data)
		try {
			const res = await Axios({
				url: `/login`,
				method: 'post',
				data: {
					email: data.email.toLowerCase(),
					password: data.password
				},
			})

			if (res.status === 200) {
				localStorage.setItem('user', JSON.stringify(res.data.user))
				userContext?.setAuthUser(res.data.user);
				navigate('/chat-rooms')
				toast.success("Login successful", { theme: "colored" });
			} else {
				toast.error(res.data.message, { theme: "colored" });
			}
		} catch (error:any){
			toast.error(error.response.data.message, { theme: "colored" });
		}
	};

	function handleSignUp(){
		navigate("/signup");
	}

  return (
		<div className='container'>
			<Container 
				maxW='sm' mt={5} p={5}
				className='center'
			>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FormControl>
						<InputGroup size='md'>
							<Input
								pr='4.5rem'
								placeholder='Enter email'
								{...register("email", {required: true, pattern: /^\w+([+.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,})}
							/>
						</InputGroup> 
						{_.get("email.type", errors) === "required" && 
								<p className='input-error'>* Email address required</p>}
						{_.get("email.type", errors) === "pattern" && 
							<p className='input-error'>* Enter valid email</p>}
					</FormControl>

					<FormControl mt={3}>
						<InputGroup size='md'>
							<Input
								pr='4.5rem'
								type={showPassword ? 'text' : 'password'}
								placeholder='Enter password'
								{...register("password", {required: true, minLength: 6})}
							/>
							<InputRightElement width='3rem'>
								<Button h='1.75rem' size='sm' onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? <Icon as={ViewOffIcon}/> : <Icon as={ViewIcon}/>}
								</Button>
							</InputRightElement>
						</InputGroup>
						{_.get("password.type", errors) === "required" && 
								<p className='input-error'>* Password required</p>}
						{_.get("password.type", errors) === "minLength" && 
							<p className='input-error'>* Password must be minimum 6 letters long</p>}
					</FormControl>

					<Button type="submit" mt={5} colorScheme='facebook'>Log In</Button>
				</form>
				<Container maxW='md' mt={10}>
					Don't have an account? <span onClick={handleSignUp}><Highlight query='Sign Up' styles={{ px: '2', py: '1', rounded: 'full', bg: 'red.100', cursor: 'pointer' }}>Sign Up</Highlight></span>
				</Container>
			</Container>
		</div>
  );
}
