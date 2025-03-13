import { AppBar, Toolbar, Button, Container, TextField } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PersistentDrawerLeft from './test'

export default function Header() {
	const [search, setSearch] = useState<string>('')

	return (
		<AppBar position="static" className="bg-black dark:bg-gray-800 shadow-md">
			<div>
				<Toolbar className="flex justify-between">
					<div className="flex items-center space-x-2">
						<PersistentDrawerLeft />
						<Link href="#" className="flex items-center">
							<Image 
								src="/logo.png" 
								className="mr-3 h-10" 
								alt="WatMovie Logo"
								width={80}
								height={100}
							/>
						</Link>
					</div>
					<TextField
						className="bg-white rounded-md"
						placeholder="Search Movies"
						size="small"
						sx={{ width: '50%' }}
					/>
					<div className="flex items-center space-x-2">
						<Button 
							className="text-white dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-xl"
						>
                    Log in
						</Button>
					</div>
				</Toolbar>
			</div>
		</AppBar>
	)
}
