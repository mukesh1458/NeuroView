import React, { useState } from 'react';

import { BiSolidUpArrow } from 'react-icons/bi';
import { AiFillCaretDown } from 'react-icons/ai';
const DropdownMenuWithSelectedValue = ({ data, selectedItem, setSelectedItem, article, setArticle, allArticles, setAllArticles, isLanguageArray }) => {

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative flex flex-col gap-5 items-center max-w-xs w-[45%] rounded-lg ${!isLanguageArray && "mx-auto"}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev)
        }}
        className={`input-modern p-4 w-full flex items-center justify-between font-bold text-base rounded-lg tracking-normal cursor-pointer text-left`}>
        {
          selectedItem ||
          (isLanguageArray ? "Choose Language" : "Choose Action")
        }
        {
          isOpen ? (
            <BiSolidUpArrow />
          ) : (
            <AiFillCaretDown />
          )
        }
      </button>

      {isOpen && (
        <div className='glass-panel absolute top-20 flex flex-col items-start rounded-lg p-2 w-full mb-5 z-[100] animate-fade-in-up max-h-60 overflow-y-auto custom-scrollbar'>
          {!isLanguageArray && (
            data.map((opt, index) => (
              <div key={index} onClick={() => {
                setSelectedItem(opt);
                setIsOpen((prev) => !prev)
              }}
                className='flex w-full justify-between hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer rounded-md p-3 transition-colors duration-200'>
                {opt}
              </div>
            ))
          )
          }

          {
            isLanguageArray && (
              data.map((opt, index) => (
                <div key={index} onClick={() => {
                  setSelectedItem(opt.code);
                  setIsOpen((prev) => !prev)
                  const newArticle = { ...article, language: opt.code }
                  setArticle(newArticle)
                }}
                  className='flex w-full justify-between hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer rounded-md p-3 transition-colors duration-200'>
                  <p>{opt.language} </p>
                  <p>{opt.code}</p>
                </div>
              ))
            )
          }
        </div>
      )}
    </div>
  );
};

export default DropdownMenuWithSelectedValue;

{/* <div className="w-1/3 max-w-xs mt-8 flex">
      <div className="relative">
        <DropdownMenu 
          trigger={ 
            selectedItem ||
           ( isLanguageArray  ? "Choose Language" : "Choose Model")
          } 
          onItemActivated={handleItemActivated}
          className=" bg-slate-500"
        >
          <DropdownItemGroup>

          { !isLanguageArray && (
            data.map((opt, index)=> (
                <DropdownItem key={index}>{opt}</DropdownItem>
            ))
          )
          }

          {
            isLanguageArray && (
              data.map((opt,index)=> (
                <DropdownItem key={index}>{opt.language} {opt.code}</DropdownItem>
            ))
            )
          }
          </DropdownItemGroup>
        </DropdownMenu>
      </div>
      <p className="mt-4">Selected item: {selectedItem || 'None'}</p>
    </div> */}