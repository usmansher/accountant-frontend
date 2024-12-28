import LoginLinks from '@/app/LoginLinks'
import ApplicationLogo from '@/components/ApplicationLogo'
import Link from 'next/link'

export const metadata = {
    title: 'Laravel',
}

const Home = () => {
    return (
        <>
            <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-gray-900 sm:items-center sm:pt-0">
                <LoginLinks />

                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-center pt-8 sm:justify-start sm:pt-0">
                       <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
                    </div>

                    <div className="flex justify-center pt-8 ml-1 mt-4 sm:justify-start sm:pt-0">
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                        >
                            Login
                        </Link>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Home
