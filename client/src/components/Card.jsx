import React from 'react'
import { download } from '../assets';
import { downloadImage } from '../utils';

const Card = ({ _id, name, prompt, model, photo }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl glass-card border-none card-hover-effect">
      <img
        className="w-full h-auto object-cover rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"
        src={photo}
        alt={prompt}
      />
      <div className="group-hover:flex flex-col max-h-[94.5%] hidden absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md m-2 p-4 rounded-lg border border-white/10">
        <p className="text-zinc-200 text-sm overflow-y-auto prompt leading-relaxed mb-3">{prompt}</p>

        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm object-cover bg-zinc-800 flex justify-center items-center text-white text-xs font-bold border border-white/10">
              {name[0]}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{name}</p>
            </div>
          </div>
          <button type="button" onClick={() => downloadImage(_id, photo)} className="outline-none bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md transition-colors border border-white/5">
            <img src={download} alt="download" className="w-4 h-4 object-contain invert" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Card