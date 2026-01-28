import React from 'react'
import { FiMic, FiMicOff } from 'react-icons/fi'; // Import icons

const FormField = ({
  labelName,
  type,
  name,
  placeholder,
  value,
  handleChange,
  isSurpriseMe,
  handleSurpriseMe,
  isVoiceEnabled, // New prop
  handleVoiceInput, // New prop
  isListening // New prop state
}) => (
  <div className='mb-6'>
    <div className="flex items-center gap-2 mb-2 justify-between">
      <div className='flex items-center gap-2'>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-zinc-300">
          {labelName}
        </label>
      </div>

      <div className="flex items-center gap-2">
        {isVoiceEnabled && (
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`relative flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full transition-all duration-300 border ${isListening
                ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-500/20'
                : 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-300 border-purple-500/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105'
              }`}
            title="Voice to Text"
          >
            {/* Pulsing Ring when listening */}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-50"></span>
            )}

            <span className={`relative z-10 ${isListening ? 'animate-pulse' : ''}`}>
              {isListening ? <FiMicOff size={14} /> : <FiMic size={14} />}
            </span>
            <span className="relative z-10">{isListening ? 'Stop' : 'Voice'}</span>
          </button>
        )}

        {isSurpriseMe && (
          <button type='button' onClick={handleSurpriseMe}
            className="text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-300 py-1.5 px-3 rounded-full border border-amber-500/30 hover:border-orange-400/50 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105 transition-all duration-300 flex items-center gap-1">
            <span>✨</span> Surprise
          </button>
        )}
      </div>
    </div>

    <input
      type={type}
      id={name}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className={`input-modern elastic-input ${isListening ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`}
      required
    />
  </div>
)

export default FormField