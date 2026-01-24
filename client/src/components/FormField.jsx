import React from 'react'

const FormField = ({
  labelName,
  type,
  name,
  placeholder,
  value,
  handleChange,
  isSurpriseMe,
  handleSurpriseMe
}) => (
  <div className='mb-6'>
    <div className="flex items-center gap-2 mb-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-300">
        {labelName}
      </label>

      {isSurpriseMe && (
        <button type='button' onClick={handleSurpriseMe}
          className="text-xs font-medium bg-zinc-800 text-zinc-400 py-1 px-2 rounded hover:bg-zinc-700 hover:text-white transition-all">
          Surprise me
        </button>
      )}
    </div>

    <input
      type={type}
      id={name}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className="input-modern"
      required
    />
  </div>
)

export default FormField