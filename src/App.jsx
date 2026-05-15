import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Landing from './pages/Landing'
import Message from './pages/Message'
import QuizGate from './pages/QuizGate'
import Chats from './pages/Chats'
import Story from './pages/Story'
import Cake from './pages/Cake'
import Chocolate from './pages/Chocolate'
import Lotus from './pages/Lotus'
import Final from './pages/Final'

import FloatingPetals from './components/FloatingPetals'
import AmbientExperience from './components/AmbientExperience'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/message" element={<Message />} />
        <Route path="/quiz" element={<QuizGate />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/story" element={<Story />} />
        <Route path="/cake" element={<Cake />} />
        <Route path="/chocolate" element={<Chocolate />} />
        <Route path="/lotus" element={<Lotus />} />
        <Route path="/final" element={<Final />} />
      </Routes>
    </AnimatePresence>
  )
}

function PetalController() {
  const location = useLocation();
  const isMessagePage = location.pathname === '/message';
  const isQuizPage = location.pathname === '/quiz';
  const isChatPage = location.pathname === '/chats';
  const isStoryPage = location.pathname === '/story';
  const isCakePage = location.pathname === '/cake';

  if (isChatPage) return <FloatingPetals count={8} speedModifier={0.5} />;
  if (isQuizPage) return <FloatingPetals count={12} speedModifier={0.62} />;
  if (isStoryPage) return <FloatingPetals count={10} speedModifier={0.6} />;
  if (isCakePage)  return <FloatingPetals count={6} speedModifier={0.4} />;

  return (
    <FloatingPetals
      count={isMessagePage ? 16 : 24}
      speedModifier={isMessagePage ? 0.8 : 1}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AmbientExperience />
      <PetalController />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
