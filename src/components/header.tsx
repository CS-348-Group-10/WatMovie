import { AppBar, Toolbar, Button, TextField, InputAdornment, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface HeaderProps {
	setSearch: (search: string) => void;
}

export default function Header(headerprops: HeaderProps) {
	const [search, setLocalSearch] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
	const router = useRouter();
	
	const fetchRandomMovie = async () => {
		setLoading(true);
		try {
		  const res = await fetch("/api/random-movie");
		  const data = await res.json();
		  router.push(`/movies/${data.mid}`);
		} catch (error) {
		  console.error("Failed to fetch random movie:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		const userId = localStorage.getItem('userId');
		setIsLoggedIn(!!userId);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('userId');
		setIsLoggedIn(false);
		router.push('/auth');
	};

	return (
		<AppBar position="static" className="bg-black dark:bg-gray-800 shadow-md">
			<div>
				<Toolbar className="flex justify-between">
					<div className="flex items-center space-x-2">
						{/* <SideBarFilter /> */}
						<Link href="/" className="flex items-center">
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
					sx={{ width: "35%" }}
					value={search}
					onChange={(e) => setLocalSearch(e.target.value)}
					onKeyDown={(e) => { // for the enter key
						if (e.key === "Enter") {
						  headerprops.setSearch(search);
						}
					}}
					InputProps={{
						endAdornment: (
						<InputAdornment position="end">
							<IconButton
								onClick={() => headerprops.setSearch(search)}
								edge="end"
								className="text-black"
							>
							<SearchIcon />
							</IconButton>
						</InputAdornment>
						),
					}}
					/>
					<div className="flex items-center space-x-2">
						{/* Top 10 Movies Button */}
						<Button
							className="text-white border-gray-300 hover:bg-gray-800 rounded-xl flex items-center"
							onClick={() => router.push('/topten')}
							disabled={loading}
							>
							⭐ {loading ? "Loading..." : "Top 10"}
						</Button>
						{/* Add Movie Button */}
						<Button
							className="text-white border-gray-300 hover:bg-gray-800 rounded-xl flex items-center"
							onClick={() => router.push('/addMovie')}
						>
							🎬 Add Movie
						</Button>
						{/* Random Movie Button */}
						<Button
							className="text-white border-gray-300 hover:bg-gray-800 rounded-xl flex items-center"
							onClick={fetchRandomMovie}
							disabled={loading}
						>
							🎲 {loading ? "Loading..." : "Random"}
						</Button>

						{/* Watchlist Button */}
						<Button
							className="text-white border-gray-300 hover:bg-gray-800 rounded-xl flex items-center"
							onClick={() => router.push('/watchlist')}
						>
							📋 Watchlist
						</Button>

						{/* Login/Logout Button */}
						{isLoggedIn ? (
							<Button 
								className="text-white border-gray-300 hover:bg-gray-800 rounded-xl"
								onClick={handleLogout}
							>
								Log out
							</Button>
						) : (
							<Button 
								className="text-white border-gray-300 hover:bg-gray-800 rounded-xl"
								onClick={() => router.push('/auth')}
							>
								Log in
							</Button>
						)}
					</div>
				</Toolbar>
			</div>
		</AppBar>
	)
}
