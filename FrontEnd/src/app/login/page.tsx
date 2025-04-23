"use client";

import { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { VideoIcon, ChatIcon, PlaylistIcon, LikeIcon, FacebookIcon, GoogleIcon, LinkedInIcon } from '@/components/ui/Icons';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {login} = useAuth();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/login', {
        email: formData.email,
        password: formData.password,
        remember_me: formData.rememberMe
      });
      Cookies.set('access_token', response.data.authorisation.access_token, {
        expires: formData.rememberMe ? 30 : undefined,
        sameSite: 'strict'
      });
      
      if (response.data.authorisation.refresh_token) {
        Cookies.set('refresh_token', response.data.authorisation.refresh_token, {
          expires: formData.rememberMe ? 30 : undefined,
          sameSite: 'strict'
        });
      }
      login(response.data.user);
      router.push('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full h-full"> 
      <div className="flex flex-col md:flex-row w-full">
        <div className="bg-gradient-to-b from-[#2c4258] to-[#1e2f3d] text-white w-full md:w-2/5 flex flex-col p-8 lg:p-12">
          <div className="max-w-md mx-auto md:my-36">
            <h1 className="text-4xl font-bold mb-4">Voxa</h1>
            <p className="text-xl mb-8 text-white/90">Share videos, connect with friends, and chat in real-time.</p>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <VideoIcon />, text: "Upload & share videos" },
                { icon: <ChatIcon />, text: "Chat with friends" },
                { icon: <PlaylistIcon />, text: "Create playlists" },
                { icon: <LikeIcon />, text: "Like & comment" }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="bg-white/10 rounded-full w-14 h-14 flex items-center justify-center mb-3 hover:bg-white/20 transition-colors">
                    {feature.icon}
                  </div>
                  <p className="text-sm text-white/80">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        
        <div className="bg-white w-full md:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome back</h2>
            <p className="text-gray-600 mb-8">Please enter your details to sign in</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Enter your email or username"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                </div>
                <label htmlFor="rememberMe" className="ml-3 text-sm text-gray-700">Remember me for 30 days</label>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#2c4258] to-[#1e2f3d] text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-500">or continue with</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              <button 
                type="button" 
                className="p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                onClick={() => {/* Add social login logic */}}
              >
                <GoogleIcon />
              </button>
              <button 
                type="button" 
                className="p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                onClick={() => {/* Add social login logic */}}
              >
                <FacebookIcon />
              </button>
              <button 
                type="button" 
                className="p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                onClick={() => {/* Add social login logic */}}
              >
                <LinkedInIcon/>
              </button>
            </div>
            
            <p className="text-center text-gray-600">
              Don't have an account? <Link href="/sign-up" className="text-blue-600 font-medium hover:underline">Sign up for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}