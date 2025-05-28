'use client';

import { useState,useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export default function SummaryPage() {
  const [youtubeLink, setYoutubeLink] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(()=>{const fetchTrans=async()=>{
    if(transcript!=""){
    const result = await model.generateContent(transcript+" give me the important points in seperate lines");
    const botReply = await result.response.text();
    console.log(botReply);
    botReply.replace("","\n")
    setSummary(botReply);
  }
}
  fetchTrans()},[transcript])
  const handleFetchTranscript = async () => {
    if (!youtubeLink) {
      toast.error('Please enter a valid YouTube link.');
      return;
    }
    setLoading(true);
    setTranscript('');
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL, {

        youtubeLink,
      });
      setTranscript(response.data.transcript);
      toast.success('Transcript fetched successfully!');
    } catch (error) {
      console.error('Error fetching transcript:', error);
      toast.error('Failed to fetch transcript.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcript) {
      toast.error('Please fetch the transcript first.');
      return;
    }
    setLoading(true);
    setSummary('');
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL, {

        youtubeLink,
      });
      setSummary(response.data.summary);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error summarizing video:', error);
      toast.error('Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 overflow-hidden">
      <ToastContainer />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-purple-900 opacity-80 blur-3xl"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      </div>
      
      <motion.h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
        AI-Powered YouTube Summarizer
      </motion.h1>

      <motion.div className="w-full max-w-2xl bg-gray-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-800 relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <input
          type="text"
          placeholder="🔗 Enter YouTube Link"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-800 text-white border-none outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        <div className="flex gap-4 mt-4">
          <button
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-lg transition-all shadow-lg"
            onClick={handleFetchTranscript}
            disabled={loading}
          >
            {loading ? 'Fetching...' : '📜 Fetch Transcript'}
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-lg transition-all shadow-lg"
            onClick={handleSummarize}
            disabled={loading || !transcript}
          >
            {loading ? 'Summarizing...' : '⚡ Summarize'}
          </button>
        </div>
      </motion.div>

      {transcript && (
        <motion.div className="mt-6 max-w-2xl w-full bg-gray-900/60 backdrop-blur-lg text-white p-6 rounded-2xl shadow-xl border border-gray-800 relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-semibold mb-2 text-blue-400">📜 Transcript:</h2>
          <p className="text-gray-300 max-h-60 overflow-y-auto">{transcript}</p>
        </motion.div>
      )}

      {summary && (
        <motion.div className="mt-6 max-w-2xl w-full bg-gray-900/60 backdrop-blur-lg text-white p-6 rounded-2xl shadow-xl border border-gray-800 relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-semibold mb-2 text-blue-400">📌 Summary:</h2>
          <p className="text-gray-300">{summary}</p>
        </motion.div>
      )}
    </div>
 );
}






