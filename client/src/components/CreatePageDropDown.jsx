import React, { useState } from 'react';
import { BiSolidUpArrow } from 'react-icons/bi';
import { AiFillCaretDown } from 'react-icons/ai';
const CreatePageDropDown = ({ data, handleChange, form, setForm }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative flex flex-col gap-5 items-center max-w-xs w-[45%] rounded-lg cursor-pointer`}>
      <div
        onClick={() => {
          setIsOpen((prev) => !prev)
        }}
        className={`input-modern flex items-center justify-between font-bold text-base tracking-normal cursor-pointer`}>
        {
          form.model
        }
        {
          isOpen ? (
            <BiSolidUpArrow />
          ) : (
            <AiFillCaretDown />
          )
        }
      </div>

      {isOpen && (
        <div className={`glass-panel absolute top-16 ${isOpen ? "flex animate-fade-in-up" : "hidden"} flex-col items-start rounded-lg p-2 w-full mb-5 z-20`}>
          {
            data.map((opt, index) => (
              <div key={index} onClick={() => {
                setForm({ ...form, model: opt });
                setIsOpen((prev) => !prev)
              }}
                className='flex w-full justify-between hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer rounded-md p-3 transition-colors duration-200'>
                {opt}
              </div>
            ))

          }

        </div>
      )}
    </div>
  );
}

export default CreatePageDropDown