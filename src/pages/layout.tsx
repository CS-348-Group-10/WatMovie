// import "./globals.css";

import { Container } from '@mui/material'

export default function RootLayout({
	children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	return (
		<Container className="min-w-full">
			<>{children}</>
		</Container>
	)
}
