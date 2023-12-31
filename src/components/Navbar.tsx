import { ReactNode, useContext } from 'react';
import {
  Box,
  Flex,
  Avatar,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import AuthContext from '../AuthContext';
import Profile from "../media/profile.webp"

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'#'}>
    {children}
  </Link>
);

interface Props {
	username: String | null
}

export default function Nav() {

  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

	const context = useContext(AuthContext);
	
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box>{context?.authUser?.name}</Box>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>

              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    src={Profile}
                  />
                </MenuButton>
                {context?.authUser && 
									<MenuList alignItems={'center'}>
										<br />
										<Center>
											<Avatar
												size={'2xl'}
												src={Profile}
											/>
										</Center>
										<br />
										<Center>
											<p>{context.authUser?.name}</p>
										</Center>
										<Center>
											<p>{context.authUser?.email}</p>
										</Center>
										<br />
										<MenuDivider />
                	</MenuList>
								}
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}