import 'tailwindcss/tailwind.css'
import { AppProps } from 'next/app'
import Head from 'next/head'
import RootLayout from './layout'

export default function App({
	Component,
	pageProps,
}: AppProps): React.ReactNode {
	return (
		<>
			<Head>
				<title>WatMovie</title>
			</Head>
			<RootLayout>
				<Component {...pageProps} />
			</RootLayout>
		</>
	)
}
