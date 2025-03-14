import { AppBar, Toolbar, Button, TextField } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
	setSearch: (search: string) => void;
}

export default function Header(headerprops: HeaderProps) {
	const [search, setLocalSearch] = useState<string>('')

	return (
		<AppBar position="static" className="bg-black dark:bg-gray-800 shadow-md">
			<div>
				<Toolbar className="flex justify-between">
					<div className="flex items-center space-x-2">
						{/* <SideBarFilter /> */}
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
						value={search}
						onChange={(e) => { 
							headerprops.setSearch(e.target.value)
							setLocalSearch(e.target.value)
						}}
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
