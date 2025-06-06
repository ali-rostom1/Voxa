"use client"

import { useState } from "react"
import Link from "next/link"
import router from "next/navigation"
import Head from "next/head"
import { VideoIcon, ChatIcon, PlaylistIcon, LikeIcon, FacebookIcon, GoogleIcon, LinkedInIcon } from "@/components/ui/Icons"
import { useRouter } from "next/navigation"
import apiClient from "../../lib/apiClient"

export default function Signup() {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    password_confirmation: "",
    agreeTerms: false,
  })
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true);
    setError('');
    if(formData.password != formData.password_confirmation){
        setError('Password doesnt match');
        setIsLoading(false);
        return;
    }
    try{
        const response = await apiClient.post('api/v1/register',{
            name: formData.firstName + " " + formData.lastName,
            email: formData.email,
            password: formData.password,
            password_confirmation : formData.password_confirmation
        });
        router.push('/login');
        
    }catch(err: any){
        setError(
            err.response?.data?.message || 
            'Registration failed. Please try again.'
          );

    }finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Create an account | Voxa</title>
        <meta name="description" content="Join Voxa and start sharing your videos" />
      </Head>

      <div className="flex flex-col md:flex-row w-full h-screen">
        <div className="bg-gradient-to-b from-[#2c4258] to-[#1e2f3d] text-white w-full md:w-3/5 flex flex-col p-6 lg:p-8">
          <div className="max-w-md mx-auto my-auto">
          <Link href='/'><h1 className="text-4xl font-bold mb-4">Voxa</h1></Link>
          <p className="text-lg mb-6 text-white/90">Join our community of creators and viewers.</p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <VideoIcon />, text: "Upload & share videos" },
                { icon: <ChatIcon />, text: "Chat with friends" },
                { icon: <PlaylistIcon />, text: "Create playlists" },
                { icon: <LikeIcon />, text: "Like & comment" },
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mb-2 hover:bg-white/20 transition-colors">
                    {feature.icon}
                  </div>
                  <p className="text-xs text-white/80">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div className="bg-white w-full md:w-2/5 p-6 lg:p-8 flex flex-col justify-center">
          <div className="w-full max-w-xs mx-auto">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Create an account</h2>
            <p className="text-sm text-gray-600 mb-4">Join Voxa and start sharing your videos</p>

            
            {/* Error display */}
            {error && (
                    <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-xs">
                    {error}
                    </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full">
                  <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with 1 uppercase, 1 number, and 1 special character
                </p>
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  placeholder="Confirm your password"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-4">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                  />
                </div>
                <label htmlFor="agreeTerms" className="ml-2 text-xs text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#2c4258] to-[#1e2f3d] text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm shadow"
              >
                Create account
              </button>
            </form>


            <p className="text-center text-xs text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}