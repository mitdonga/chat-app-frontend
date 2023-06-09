import React, { useEffect, useRef, useState } from 'react'
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
import { app } from '../config/appConfig'
import { toast } from 'react-toastify';

interface Inputs {
	email: string,
	password: string,
	confirm_password: string,
	name: string,
}

interface FormData {
	email: string,
	password: string,
	confirm_password: string,
	name: string
}

export default function Signup() {

	const [showPassword, setShowPassword] = useState(false);
	const [passwordMatchError, setPasswordMatchError] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		email: '',
		password: '',
		confirm_password: '',
		name: ''
	});

	function handleChange(event:React.ChangeEvent<HTMLInputElement>){
		if (event.target) {
			const { name, value } = event.target;
			setFormData({...formData, [name]: value })
		}
	}
	
	const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
		if (data.password === data.confirm_password) {
			try {
				const res = await axios.post(`${app.BACKEND_URL}/signup`, {
					name: data.name,
					email: data.email.toLowerCase(),
					password: data.password,
					confirm_password: data.confirm_password
				})
				if (res.status === 200){
					toast.success('Signup successful', { theme: "colored" });
					handleLogin()
				} else {
					toast.error(res.data.message, { theme: "colored" });
				}
			} catch (err:any) {
				if (err.response?.data?.message)
					toast.error(err.response.data.message, { theme: "colored" });
				else
					toast.error(err.message, { theme: "colored" });
			}
		} else {
			setPasswordMatchError(true)
		}
	};

	function handleLogin(){
		navigate("/login")
	}

	function compairPassword(e:FocusEvent){
		if (!e.target) return;
		if (formData.confirm_password !== formData.password)
			setPasswordMatchError(true)
		else
			setPasswordMatchError(false)
	}
	const confirmPasswordEle = document.getElementsByName("confirm_password")[0];
	if (confirmPasswordEle){
		confirmPasswordEle.addEventListener('focusout', compairPassword)
	}

  return (
		<>
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
									value={formData.email}
									{...register("email", {required: true, pattern: /^\w+([+.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,})}
									onChange={handleChange}
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
									value={formData.password}
									{...register("password", {required: true, minLength: 6})}
									onChange={handleChange}
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

						<FormControl mt={3}>
							<InputGroup size='md'>
								<Input
									pr='4.5rem'
									type={showPassword ? 'text' : 'password'}
									placeholder='Confirm password'
									value={formData.confirm_password}
									{...register("confirm_password", {required: true, minLength: 6})}
									// ref={confirmPassword}
									onChange={handleChange}
								/>
								<InputRightElement width='3rem'>
									<Button h='1.75rem' size='sm' onClick={() => setShowPassword(!showPassword)}>
										{showPassword ? <Icon as={ViewOffIcon}/> : <Icon as={ViewIcon}/>}
									</Button>
								</InputRightElement>
							</InputGroup>
							{_.get("confirm_password.type", errors) === "required" && 
								<p className='input-error'>* Confirm password required</p>}
							{_.get("confirm_password.type", errors) === "minLength" && 
								<p className='input-error'>* Confirm password must be minimum 6 letters long</p>}
							{passwordMatchError && 
								<p className='input-error'>* Confirm password does not match</p>}
						</FormControl>

						<FormControl mt={3}>
							<InputGroup size='md'>
								<Input
									type='text'
									pr='4.5rem'
									placeholder='Enter name'
									value={formData.name}
									{...register("name", {required: true, minLength: 3})}
									onChange={handleChange}
								/>
							</InputGroup> 
							{_.get("name.type", errors) === "required" && 
								<p className='input-error'>* Name required</p>}
							{_.get("name.type", errors) === "minLength" && 
								<p className='input-error'>* Name must be minimum 3 letters long</p>}
						</FormControl>

						<Button type="submit" mt={5} colorScheme='facebook'>Sign Up</Button>
					</form>

					<Container maxW='md' mt={10}>
						Already have an account? <span onClick={handleLogin}><Highlight query='Log In' styles={{ px: '2', py: '1', rounded: 'full', bg: 'red.100', cursor: 'pointer' }}>Log In</Highlight></span>
					</Container>
					
				</Container>
			</div>
		</>
  );
}
