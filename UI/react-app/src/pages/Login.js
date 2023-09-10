import {
  useEffect, 
  useState, 
  useContext
} from 'react'
import {
  Container, 
  Card, 
  Button, 
  Form
} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
// import {TextField} from '@mui/material'
import { 
  createTheme,
  ThemeProvider,
  Theme,
  useTheme, 
  TextField, 
  outlinedInputClasses, 
  InputLabel, 
  OutlinedInput, 
  InputAdornment, 
  IconButton, 
  FormControl, 
  Input 
} 
from '@mui/material';
import{ Visibility, VisibilityOff } from '@mui/icons-material';
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox
}
from 'mdb-react-ui-kit';


import Swal2 from 'sweetalert2'
import socket from "../socket";
import UserContext from '../UserContext';


const customTheme = (outerTheme: Theme) =>
  createTheme({
    palette: {
      mode: outerTheme.palette.mode,
    },
    components: {
      MuiInputLabel: {
      	styleOverrides:{
      		root:{
      			color: 'white',
	    		"&.Mui-focused": {
			    	color: "white"
			    }
      		},
      	}
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '--TextField-brandBorderColor': 'white',
            '--TextField-brandBorderHoverColor': 'white',
            '--TextField-brandBorderFocusedColor': 'white',
            '& label.Mui-focused': {
              color: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: 'var(--TextField-brandBorderColor)',
          },
          root: {
            [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: 'var(--TextField-brandBorderHoverColor)',
            },
            [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            '&:before, &:after': {
              borderBottom: '2px solid var(--TextField-brandBorderColor)',
            },
            '&:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottom: '2px solid var(--TextField-brandBorderHoverColor)',
            },
            '&.Mui-focused:after': {
              borderBottom: '2px solid var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
        	input: {
        		color: 'white',
        		width: '100%',
        	},        	
          root: {
            '&:before': {
              borderBottom: '2px solid var(--TextField-brandBorderColor)',
            },
            '&:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottom: '2px solid var(--TextField-brandBorderHoverColor)',
            },
            '&.Mui-focused:after': {
              borderBottom: '2px solid var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
    },
  });

export default function Login() {

	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const {user, setUser} = useContext(UserContext);
	const outerTheme = useTheme();

	const [regEmail, setRegEmail] = useState('');
	const [regPassword, setRegPassword] = useState('');
	const [regFirstname, setRegFirstname] = useState('');
	const [regLastname, setRegLastname] = useState('');
	const [regUsername, setRegUsername] = useState('');

	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showRegPassword, setShowRegPassword] = useState(false);

	const handleClickShowLoginPassword = () => setShowLoginPassword((show) => !show);
	const handleClickShowRegPassword = () => setShowRegPassword((show) => !show);

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};
	

	const [justifyActive, setJustifyActive] = useState('tab1');;

	const handleJustifyClick = (value) => {
		if (value === justifyActive) {
		  return;
		}

		setJustifyActive(value);
	};


	const retrieveUserDetails = (token) => {
		fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(response => response.json())
		.then(data => {
			setUser({
				id: data._id,
				isAdmin: data.isAdmin
			})
		})
	}

	function signup(e){
		e.preventDefault();

		// CHECK IF PROVIDED EMAIL HAS DUPLICATE
		fetch(`${process.env.REACT_APP_API_URL}/users/checkEmail`, {
			method: 'POST',
			headers: {
				'Content-type' : 'application/json'
			},
			body: JSON.stringify({
				email : regEmail
			})
		})
		.then(response => response.json())
		.then(data => {

			// IF DUPLICATE IS FOUND SEND ERROR MESSAGE
			if(data === true){
				Swal2.fire({
					title: 'Duplicate Email found',
					icon: 'error',
					text: 'Please provide a different email.'
				})
			} 

			// IF NO DUPLICATE IS FOUND, SAVE USER DETAILS
			else {
				fetch(`${process.env.REACT_APP_API_URL}/users/register` , {
					method: 'POST',
					headers: {
						'Content-type' : 'application/json'
					},
					body: JSON.stringify({
						firstName : regFirstname,
						lastName : regLastname,
						email : regEmail,
						password : regPassword
					})
				})
				.then(response => response.json())
				.then(data => {
					if(data === true){
						Swal2.fire({
							title: 'Registration Successful',
							icon: 'success',
							text: 'You can now login.'
						})
						socket.emit("user registered", regEmail)
						setRegEmail('')
						setRegFirstname('')
						setRegLastname('')
						setRegPassword('')
						setRegUsername('')

						setJustifyActive('tab1')
					}
				})
			}
		})
	}

	function login(e) {
		e.preventDefault();

		fetch(`${process.env.REACT_APP_API_URL}/users/login` , {
			method: 'POST',
			headers: {
				'Content-type' : 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			})
		})
		.then(response => response.json())
		.then(data => {
			if(data === false){
				Swal2.fire({
					title: 'Login unsuccessful',
					icon: 'error',
					text: 'Check your login credentials and try again'
				})
			} else {
				localStorage.setItem('token', data.access)
				retrieveUserDetails(data.access)

				Swal2.fire({
					title: 'Login successful',
					icon: 'success'
				})
				
				socket.auth = { username: email }
				socket.connect();
				socket.emit("user connected", email);
				
				socket.on("session", ({ sessionID, userID }) => {
				  // attach the session ID to the next reconnection attempts
				  socket.auth = { sessionID };
				  localStorage.setItem("sessionID", sessionID);
				  socket.userID = userID;
				});

				navigate('/chat')
			}
		})
	}

	return(
		user.id === null || user.id === undefined
		?
		<MDBContainer id="loginCard" className="p-3 my-5 col-12 col-sm-9 col-md-7 col-lg-5 col-xl-4" style={{borderRadius: '1rem'}} >

			<MDBTabs pills justify className='mb-3 d-flex flex-row justify-content-between'>
				<MDBTabsItem className="mx-1">
					<MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
					Login
					</MDBTabsLink>
				</MDBTabsItem>
				<MDBTabsItem className="mx-1">
					<MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
					Register
					</MDBTabsLink>
				</MDBTabsItem>
			</MDBTabs>

			<MDBTabsContent>
        <MDBTabsPane show={justifyActive === 'tab1'}>

					<div className="text-center mb-3">
						<p>Sign in with:</p>

						<div className='d-flex justify-content-between mx-auto' style={{width: '40%'}}>
							<MDBBtn tag='a' color='none' className='m-1' style={{ color: '#888' }}>
								<MDBIcon fab icon='facebook-f' size="xl"/>
							</MDBBtn>

							<MDBBtn tag='a' color='none' className='m-1' style={{ color: '#888' }}>
								<MDBIcon fab icon='twitter' size="xl"/>
							</MDBBtn>

							<MDBBtn tag='a' color='none' className='m-1' style={{ color: '#888' }}>
								<MDBIcon fab icon='google' size="xl"/>
							</MDBBtn>

							<MDBBtn tag='a' color='none' className='m-1' style={{ color: '#888' }}>
								<MDBIcon fab icon='github' size="xl"/>
							</MDBBtn>
						</div>

						<p className="text-center mt-3">or:</p>
					</div>

					<Form className="p-4" onSubmit={e => login(e)}>
						<ThemeProvider theme={customTheme(outerTheme)}>
							<TextField fullWidth label="Email" variant="standard" sx={{label: {color: 'white'}}} value={email} onChange={e => setEmail(e.target.value)} />
							<FormControl fullWidth sx={{ my: 1, borderBottom: '2px solid white'}} variant="standard">
								<InputLabel htmlFor="standard-adornment-password" sx={{color: 'white'}} >Password</InputLabel>
								<Input fullWidth
									id="standard-adornment-password"
									type={showLoginPassword ? 'text' : 'password'}
									endAdornment={
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={handleClickShowLoginPassword}
												onMouseDown={handleMouseDownPassword}
												sx={{color: 'white'}}
												>
												{showLoginPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									}
									value={password} onChange={e => setPassword(e.target.value)}/>
							</FormControl>
						</ThemeProvider>
						<div className="d-flex justify-content-between my-3 mx-4 mb-4">
							<MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
							<a href="!#">Forgot password?</a>
						</div>

						<Button className="mt-1 col-12 btn-success" type="submit">Log in</Button>
						<p className="my-4 text-center">Not a member? <a onClick={e => {setJustifyActive('tab2')}} href="#">Register</a></p>
					</Form>
     		</MDBTabsPane>

  			<MDBTabsPane show={justifyActive === 'tab2'}>
					<div className="text-center mb-3">
						<p>Sign up with:</p>
						<div className='d-flex justify-content-between mx-auto' style={{width: '40%'}}>
							<MDBBtn tag='a' color='none' className='m-1' style={{ color: '#888' }}>
								<MDBIcon fab icon='facebook-f' size="xl"/>
							</MDBBtn>

							<MDBBtn tag='a' color='none' className='m-1' style={{ color: '#888' }}>
								<MDBIcon fab icon='twitter' size="xl"/>
							</MDBBtn>

							<MDBBtn tag='a' color='none' className='m-1' style={{ color: '#888' }}>
								<MDBIcon fab icon='google' size="xl"/>
							</MDBBtn>

							<MDBBtn tag='a' color='none' className='m-1' style={{ color: '#888' }}>
								<MDBIcon fab icon='github' size="xl"/>
							</MDBBtn>
						</div>
						<p className="text-center mt-3">or:</p>
					</div>

					<Form className="p-4" onSubmit={e => signup(e)}>
        		<ThemeProvider theme={customTheme(outerTheme)}>
	  					<TextField label="Firstname" className="my-2" variant="outlined" sx={{width: '47.5%', marginRight:'2.5%', label: {color: 'white'}, input: {color: 'white'}}} value={regFirstname} onChange={e => {setRegFirstname(e.target.value)}} />
	  					<TextField fullWidth label="Lastname" className="my-2" variant="outlined" sx={{width: '47.5%', marginLeft:'2.5%', label: {color: 'white'}, input: {color: 'white'}}} value={regLastname} onChange={e => {setRegLastname(e.target.value)}} />
	  					<TextField fullWidth label="Username" className="my-2" variant="outlined" sx={{label: {color: 'white'}, input: {color: 'white'}}} value={regUsername} onChange={e => {setRegUsername(e.target.value)}} />
	  					<TextField fullWidth label="Email" className="my-2" variant="outlined" sx={{label: {color: 'white'}, input: {color: 'white'}}} value={regEmail} onChange={e => {setRegEmail(e.target.value)}} />
	  					<FormControl fullWidth sx={{ my: 1}} variant="outlined">
							<InputLabel htmlFor="outlined-adornment-password" sx={{color: 'white'}} >Password</InputLabel>
								<OutlinedInput fullWidth
									sx={{color: 'white'}}
									id="outlined-adornment-password"
									type={showRegPassword ? 'text' : 'password'}
									endAdornment={
								  	<InputAdornment position="end">
									    <IconButton
									      aria-label="toggle password visibility"
									      onClick={handleClickShowRegPassword}
									      onMouseDown={handleMouseDownPassword}
									      edge="end"
									      sx={{color: 'white'}}
										    >
									      {showRegPassword ? <VisibilityOff /> : <Visibility />}
									    </IconButton>
								  	</InputAdornment>
										}
									label="password"
									value={regPassword} onChange={e => setRegPassword(e.target.value)}/>
	        		</FormControl>
						</ThemeProvider>
  					<Button className="my-5 col-12 btn-success" type="submit">Sign Up</Button>
	  			</Form>
	    	</MDBTabsPane>
	  	</MDBTabsContent>
    </MDBContainer>
		:
		navigate('/chat')
	)
}
