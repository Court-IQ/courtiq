'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async () => {
    if (!file || !title) {
      setMessage('Please add a title and select a video')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // Upload video to Supabase storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('videos')
        .upload(fileName, file)

      if (storageError) throw storageError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName)

      // Create game record in database
      const { error: dbError } = await supabase
        .from('games')
        .insert({
          title,
          video_url: urlData.publicUrl,
          status: 'processing'
        })

      if (dbError) throw dbError

      setMessage('Game uploaded successfully!')
      setFile(null)
      setTitle('')
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Upload Game Film</h1>
      
      <div className="w-full max-w-md flex flex-col gap-4">
        <input
          type="text"
          placeholder="Game title (e.g. vs Duke - 04/14/26)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded p-3 text-white"
        />

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="bg-gray-900 border border-gray-700 rounded p-3 text-white"
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-white text-black font-bold py-3 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Game'}
        </button>

        {message && (
          <p className="text-center text-sm text-gray-400">{message}</p>
        )}
      </div>
    </div>
  )
}