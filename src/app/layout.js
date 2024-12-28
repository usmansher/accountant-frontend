import { Nunito } from 'next/font/google'
import '@/app/global.css'
import { ThemeModeScript } from 'flowbite-react'

const nunitoFont = Nunito({
    subsets: ['latin'],
    display: 'swap',
})

const RootLayout = ({ children }) => {
    return (
        <html
            lang="en"
            className={nunitoFont.className}
            suppressHydrationWarning>
            <head>
                <ThemeModeScript />
            </head>
            <body className="antialiased">{children}</body>
        </html>
    )
}

export const metadata = {
    title: 'Accounting App',
}

export default RootLayout
