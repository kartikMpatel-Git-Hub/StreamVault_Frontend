import React from 'react'
import { useState, useEffect } from 'react'
import { data, Link } from 'react-router-dom'

function Home() {
    const HOST = import.meta.env.VITE_HOST
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const[userName,setUsername] = useState("Fetching.....")
    const[email,setEmail] = useState("Fetching.....")
    const[subscribers,setSubscribers] = useState(0)
    const[subscribeds,serSubscribeds] = useState(0)

    const heroSlides = [
        {
            title: "Welcome to Our Platform",
            subtitle: "Discover amazing features and possibilities",
            bg: "from-purple-600 to-blue-600"
        },
        {
            title: "Join Our Community",
            subtitle: "Connect with like-minded individuals",
            bg: "from-pink-600 to-purple-600"
        },
        {
            title: "Start Your Journey",
            subtitle: "Everything you need is right here",
            bg: "from-blue-600 to-indigo-600"
        }
    ]

    const features = [
        {
            icon: "🚀",
            title: "Fast & Reliable",
            description: "Lightning-fast performance with 99.9% uptime guarantee"
        },
        {
            icon: "🔒",
            title: "Secure & Safe",
            description: "Enterprise-grade security to protect your data"
        },
        {
            icon: "💡",
            title: "Innovative",
            description: "Cutting-edge features that adapt to your needs"
        },
        {
            icon: "🌍",
            title: "Global Reach",
            description: "Connect with users from around the world"
        },
        {
            icon: "📱",
            title: "Mobile Ready",
            description: "Seamless experience across all your devices"
        },
        {
            icon: "⚡",
            title: "Easy to Use",
            description: "Intuitive interface designed for everyone"
        }
    ]

    const stats = [
        { number: "10K+", label: "Active Users" },
        { number: "500+", label: "Features" },
        { number: "99.9%", label: "Uptime" },
        { number: "24/7", label: "Support" }
    ]

    const getData = () =>{
        const response = fetch(`${HOST}/api/v1/users/getCurrentUser`,{
            method: "GET",
            credentials: "include",
        })
        .then((data)=>data.json())
        .then((data)=>data.data)
        .then((data)=> {
            setUsername(data.userName)
            setEmail(data.email)
            setSubscribers(data.subscribersCount)
            serSubscribeds(data.subscribedCount)
        })
    }
    useEffect(() => {
        setIsVisible(true)
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        }, 5000)
        getData()
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='min-h-screen bg-gray-900 text-white overflow-hidden'>
            {/* Hero Section */}
            <section className='relative h-screen flex items-center justify-center'>
                <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].bg} transition-all duration-1000`}>
                    <div className='absolute inset-0 bg-black/20'></div>
                </div>
                
                {/* Animated Background Elements */}
                <div className='absolute inset-0 overflow-hidden'>
                    <div className='absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse'></div>
                    <div className='absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000'></div>
                    <div className='absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse delay-500'></div>
                </div>

                <div className={`relative z-10 text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h1 className='text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300'>
                        Welcome
                    </h1>
                    <h4 className='text-3xl md:text-3xl underline font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-600'>
                        {userName}
                    </h4>
                    <p className='text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto'>
                        {email}
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link to={`../getChannelProfile/${userName}`}>
                            <button className='px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg'>
                                view Your Channel
                            </button>
                        </Link>
                        <button className='px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-200 transform hover:scale-105'>
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Slide Indicators */}
                <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2'>
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                            }`}
                        ></button>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className='py-20 bg-black/20'>
                <div className='container mx-auto px-6'>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                            <div className='text-center transform hover:scale-105 transition-transform duration-200'>
                                <div className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2'>
                                    {subscribers}
                                </div>
                                <div className='text-gray-300 text-lg'>subscribers</div>
                            </div>
                            <div className='text-center transform hover:scale-105 transition-transform duration-200'>
                                <div className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2'>
                                    {subscribeds}
                                </div>
                                <div className='text-gray-300 text-lg'>subscribeds</div>
                            </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className='py-20 bg-gray-800/50'>
                <div className='container mx-auto px-6'>
                    <div className='text-center mb-16'>
                        <h2 className='text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400'>
                            Why Choose Us?
                        </h2>
                        <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
                            Discover the features that make our platform stand out from the rest
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className='bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10'
                            >
                                <div className='text-4xl mb-4'>{feature.icon}</div>
                                <h3 className='text-xl font-semibold mb-3 text-white'>{feature.title}</h3>
                                <p className='text-gray-300 leading-relaxed'>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden'>
                <div className='absolute inset-0 bg-black/20'></div>
                <div className='absolute top-0 left-0 w-full h-full'>
                    <div className='absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-bounce'></div>
                    <div className='absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-bounce delay-1000'></div>
                </div>
                
                <div className='container mx-auto px-6 relative z-10 text-center'>
                    <h2 className='text-4xl md:text-5xl font-bold mb-6'>
                        Ready to Get Started?
                    </h2>
                    <p className='text-xl mb-8 text-gray-100 max-w-2xl mx-auto'>
                        Join thousands of users who have already transformed their experience with our platform
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <button className='px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg'>
                            Start Free Trial
                        </button>
                        <button className='px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-purple-600 transition-all duration-200 transform hover:scale-105'>
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className='bg-gray-900 py-12 border-t border-gray-800'>
                <div className='container mx-auto px-6'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                        <div className='md:col-span-2'>
                            <h3 className='text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400'>
                                Your Platform
                            </h3>
                            <p className='text-gray-400 mb-4 max-w-md'>
                                Building the future of digital experiences with innovative solutions and cutting-edge technology.
                            </p>
                            <div className='flex space-x-4'>
                                <div className='w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 cursor-pointer transition-colors'>
                                    <span className='text-white text-sm'>f</span>
                                </div>
                                <div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer transition-colors'>
                                    <span className='text-white text-sm'>t</span>
                                </div>
                                <div className='w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 cursor-pointer transition-colors'>
                                    <span className='text-white text-sm'>i</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className='text-lg font-semibold mb-4 text-white'>Quick Links</h4>
                            <ul className='space-y-2 text-gray-400'>
                                <li><a href='#' className='hover:text-white transition-colors'>About Us</a></li>
                                <li><a href='#' className='hover:text-white transition-colors'>Features</a></li>
                                <li><a href='#' className='hover:text-white transition-colors'>Pricing</a></li>
                                <li><a href='#' className='hover:text-white transition-colors'>Contact</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className='text-lg font-semibold mb-4 text-white'>Support</h4>
                            <ul className='space-y-2 text-gray-400'>
                                <li><a href='#' className='hover:text-white transition-colors'>Help Center</a></li>
                                <li><a href='#' className='hover:text-white transition-colors'>Documentation</a></li>
                                <li><a href='#' className='hover:text-white transition-colors'>Privacy Policy</a></li>
                                <li><a href='#' className='hover:text-white transition-colors'>Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
                        <p>&copy; 2025 Your Platform. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home