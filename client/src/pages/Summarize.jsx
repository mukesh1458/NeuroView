import React, { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import { loader } from "../assets";

import { toast } from 'react-hot-toast';
import DropdownMenuWithSelectedValue from '../components/DropDown';
import axios, { all } from 'axios'
import { languages } from '../utils';
import { FiLink2 } from 'react-icons/fi';
import { FiCopy } from 'react-icons/fi';
import { TiTick } from 'react-icons/ti';
import { AiOutlineDelete } from 'react-icons/ai';
const Summarize = () => {

  const [article, setArticle] = useState({
    data: "",
    summary: "",
    language: ""
  });
  console.log("Article at start is", article)
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [action, setAction] = useState("");

  const [lang, setLang] = useState("")
  console.log("Language code at start is", lang)
  const [loading, setLoading] = useState(false)
  const [textareaStyle, setTextareaStyle] = useState({
    height: 'auto',
    overflowY: 'hidden',
  });
  console.log("Text area style is", textareaStyle)

  const actions = ['Summarize', 'Summarize And Translate', 'Translate']

  const RAPID_API = process.env.REACT_APP_RAPID_API_KEY
  // console.log("Rapid api key", RAPID_API, typeof(RAPID_API))

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage)
    }


  }, [])


  const handleDelete = (item) => {
    console.log("item in delete is", item)
    const newArticles = allArticles.filter((article) => {
      if (article.language == "") {
        return item.data !== article.data
      }
      else {
        return (item.data !== article.data) || (item.language !== article.language)
      }
    })
    console.log("newArticles after deletion", newArticles)
    setArticle({
      data: "",
      summary: "",
      language: ""
    });
    setAllArticles(newArticles)
    localStorage.setItem("articles", JSON.stringify(newArticles));
    // let textarea = document.getElementById("myTextarea");
    // textarea.style.height = "auto";
    // textarea.style.height = textarea.scrollHeight + "px";
    setTextareaStyle({
      height: "fit-content"
    })
  }
  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}([-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/;

  const summarizeFromUrl = async (urlInput) => {
    // Article Extractor and Summarizer
    setLoading(true)
    const options = {
      method: 'GET',
      url: 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize',
      params: {
        url: urlInput,
        length: '3'
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API,
        'X-RapidAPI-Host': 'article-extractor-and-summarizer.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      console.log("summarizeFromUrl response.data", response.data);
      setLoading(false)
      return response.data
    } catch (error) {
      console.error(error);
      toast.error("Error while summarizing from URL")
      setLoading(false)
    }
  }

  const summarizeAndTranslateFromUrl = async (urlInput, target) => {
    // Article Extractor and Summarizer
    setLoading(true)
    const options = {
      method: 'GET',
      url: 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize',
      params: {
        url: urlInput,
        length: '3',
        lang: target
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API,
        'X-RapidAPI-Host': 'article-extractor-and-summarizer.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      console.log("summarizeAndTranslateFromUrl response.data", response.data);
      setLoading(false)
      return response.data
    } catch (error) {
      console.error(error);
      toast.error("Error while summarizing & translating from URL")
      setLoading(false)
    }

  }

  const summarizeFromText = async (text) => {
    //Text Summarize Pro
    setLoading(true)
    console.log("summarizeFromText text is", text)
    const encodedParams = new URLSearchParams();
    encodedParams.set('text', text);
    encodedParams.set('percentage', '40');

    const options = {
      method: 'POST',
      url: 'https://text-summarize-pro.p.rapidapi.com/summarizeFromText',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': RAPID_API,
        'X-RapidAPI-Host': 'text-summarize-pro.p.rapidapi.com'
      },
      data: encodedParams,
    };

    try {
      const response = await axios.request(options);
      console.log("response.data summarizeFromText is", response.data);
      setLoading(false)
      return response.data
    } catch (error) {
      console.error(error);
      toast.error("Error while summarizing from text")
      setLoading(false)
    }
  }
  const summarizeAndTranslateFromText = async (text, target) => {
    //Summarize: Text Summarize Pro 
    //Translate: Microsoft Translator Text
    setLoading(true)
    console.log("summarizeAndTranslateFromText text, target is", text, target)
    const summarizedText = await summarizeFromText(text)
    console.log("Summarized Text is", typeof (summarizedText.summary), summarizedText.summary)

    const options = {
      method: 'POST',
      url: 'https://deep-translate1.p.rapidapi.com/language/translate/v2',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': 'c9fb3c3e32mshd163e9a65ed84e3p12816djsn7c9c6d8a7260',
        'X-RapidAPI-Host': 'deep-translate1.p.rapidapi.com'
      },
      data: {
        q: summarizedText.summary,
        source: 'en',
        target: target
      }
    };

    try {
      const response = await axios.request(options);
      console.log("summarizeAndTranslateFromText response.data", response);
      setLoading(false)
      return response.data
    } catch (error) {
      console.error(error);
      toast.error("Error while summarizing & translating from text")
      setLoading(false)
    }

  }

  const translateText = async (text, target) => {
    setLoading(true)
    console.log("translateText text, target is", text, target)
    console.log("Type of text, target", typeof (text), typeof (target))
    //Microsoft Translator Text
    const options = {
      method: 'POST',
      url: 'https://deep-translate1.p.rapidapi.com/language/translate/v2',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': 'c9fb3c3e32mshd163e9a65ed84e3p12816djsn7c9c6d8a7260',
        'X-RapidAPI-Host': 'deep-translate1.p.rapidapi.com'
      },
      data: {
        q: text,
        source: 'en',
        target: target
      }
    };
    try {

      const response = await axios.request(options);
      console.log("TranslateFromText response.data", response);
      setLoading(false)
      return response.data
    } catch (error) {
      console.error(error);
      toast.error("Error while summarizing & translating from text")
      setLoading(false)
    }
  }

  const handleInput = (e) => {
    const target = e.target;

    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;

    setTextareaStyle({
      height: `${target.scrollHeight}px`,
      overflowY: 'hidden',
    });
    setArticle({ ...article, data: e.target.value })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("In handle submit", article, lang)
    if ((action == "Summarize And Translate" || action == "Translate") && !lang) {
      toast.error("Select a language as target for translation")
      return
    }
    if (!article.data || !action) {
      toast.error("Enter the input and select an action")
      return
    }

    const existingArticle = allArticles.find((item) => {
      if (article.language == "") {
        return item.data === article.data
      }
      else {
        return (item.data === article.data) && (item.language === article.language)
      }
    })
    console.log("Existing article is", existingArticle)
    if (existingArticle) {
      return setArticle(existingArticle)
    }

    const isURL = urlRegex.test(article.data);
    if (action == "Summarize") {

      if (isURL) {
        const response = await summarizeFromUrl(article.data);
        if (response) {
          const newArticle = { ...article, summary: response.summary };
          const updatedAllArticles = [newArticle, ...allArticles];
          setArticle(newArticle)
          setAllArticles(updatedAllArticles);
          localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
        }
      }

      else if (!isURL) {
        const response = await summarizeFromText(article.data);
        if (response) {
          const newArticle = { ...article, summary: response.summary };
          const updatedAllArticles = [newArticle, ...allArticles];
          setArticle(newArticle)
          setAllArticles(updatedAllArticles);
          localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
        }
      }

    }
    else if (action == "Summarize And Translate") {

      if (isURL) {
        const response = await summarizeAndTranslateFromUrl(article.data, lang);
        if (response) {
          const newArticle = { ...article, summary: response.summary };
          const updatedAllArticles = [newArticle, ...allArticles];
          setArticle(newArticle)
          setAllArticles(updatedAllArticles);
          localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
        }
      }
      else if (!isURL) {
        const response = await summarizeAndTranslateFromText(article.data, lang);
        if (response) {
          const newArticle = { ...article, summary: response.data.translations.translatedText };
          const updatedAllArticles = [newArticle, ...allArticles];
          setArticle(newArticle)
          setAllArticles(updatedAllArticles);
          localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
        }
      }
    }
    else if (action == "Translate" && !isURL) {
      const response = await translateText(article.data, lang);
      if (response) {
        const newArticle = { ...article, summary: response.data.translations.translatedText };
        const updatedAllArticles = [newArticle, ...allArticles];
        setArticle(newArticle)
        setAllArticles(updatedAllArticles);
        localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
      }
    }
    else if (action == "Translate" && isURL) {
      toast.error("A url can't be translated enter text")
      return
    }
    console.log("Article after handle submit is", article)
  }

  // copy the url and toggle the icon for user feedback
  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };


  return (
    <>
      <header className='w-full flex justify-center items-center flex-col animate-fade-in-up'>
        <h1 className='heading-hero text-[36px] sm:text-[54px] text-center leading-[0.9] mb-4'>
          Summarize & Translate <br className='max-md:hidden' />
          <span className='text-gradient-minimal'>Artificial Intelligence</span>
        </h1>
        <h2 className='mt-5 text-lg text-zinc-400 sm:text-xl text-center max-w-2xl leading-relaxed'>
          Simplify your reading with <span className="text-white font-semibold">NeuroView</span>, an advanced article summarizer
          that transforms lengthy articles into clear and concise summaries.
        </h2>
      </header>

      <section className='mt-16 w-full max-w-2xl pb-20 animate-fade-in-up delay-200'>
        {/* Search */}
        <div className='flex flex-col w-full gap-2'>
          <form
            className='relative flex flex-col justify-center items-center'
            onSubmit={handleSubmit}
          >
            <div className='w-full relative group'>
              <i className='absolute inset-y-0 left-0 my-1.5 ml-3 flex w-5 items-center justify-center pointer-events-none text-zinc-500'>
                <FiLink2 size={20} />
              </i>

              <TextareaAutosize
                minRows={1}
                placeholder={action == "Translate" ? `Enter text to translate` : `Enter URL or text to summarize`}
                value={article.data}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                required
                className='input-modern pl-12 pr-12 resize-none overflow-y-hidden'
              />

              <button
                type='submit'
                className='absolute inset-y-0 right-0 my-1.5 mr-1.5 flex w-10 items-center justify-center
                 rounded-md border border-white/5 font-sans text-sm font-medium
                  text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all'
              >
                <p>↵</p>
              </button>
            </div>


          </form>
          <div className='flex justify-between w-[95%] mx-auto mt-6'>

            <DropdownMenuWithSelectedValue
              data={actions}
              selectedItem={action}
              setSelectedItem={setAction}
            />

            {
              (action == "Summarize And Translate" || action == "Translate") && (<DropdownMenuWithSelectedValue
                data={languages}
                selectedItem={lang}
                setSelectedItem={setLang}
                article={article}
                setArticle={setArticle}
                allArticles={allArticles}
                setAllArticles={setAllArticles}
                isLanguageArray
              />)
            }


          </div>

          {/* Browse History */}
          <div className='flex flex-col gap-2 max-h-60 overflow-y-auto mt-4 pr-1 custom-scrollbar'>
            {allArticles.reverse().map((item, index) => (
              <div key={`link-${index}`} className='relative group'>
                <div
                  onClick={() => {
                    setArticle(item)
                    setLang(item.language)
                  }}
                  className='p-3 flex justify-start items-center flex-row bg-[#18181b] border border-white/5 gap-3 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors pr-12'
                >
                  <div className='w-7 h-7 rounded-full bg-black/20 flex justify-center items-center cursor-pointer hover:bg-black/40 transition-all' onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item.data);
                  }}>

                    {
                      copied === item.data ? (
                        <i className='text-green-400'>
                          <TiTick />
                        </i>
                      ) : (
                        <i className='text-zinc-400 group-hover:text-white transition-colors'>
                          <FiCopy />
                        </i>
                      )
                    }
                  </div>
                  <p
                    className={`flex-1 font-inter ${urlRegex.test(item.data) ? "text-blue-400" : "text-zinc-300"} font-normal text-sm truncate`}>
                    {item.data}
                  </p>
                </div>

                <div className='w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 
                flex justify-center items-center cursor-pointer absolute top-1/2 -translate-y-1/2 right-3 transition-all'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}>
                  <i className='text-red-400'> <AiOutlineDelete /></i>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Display Result */}
        <div className='my-10 max-w-full flex justify-center items-center'>
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <img src={loader} alt='loader' className='w-12 h-12 object-contain' />
              <p className="text-zinc-500 text-sm">Processing...</p>
            </div>
          ) : (
            article.summary && (
              <div className='flex flex-col gap-4 w-full animate-in fade-in duration-500'>
                <h2 className='font-bold text-white text-xl'>
                  Article <span className='text-gradient-minimal'>
                    {
                      action == "Summarize And Translate" ? "Summary and Translation" : ""
                    }
                    {
                      action == "Summarize" ? "Summary" : ""
                    }
                    {
                      action == "Translate" ? "Translation" : ""
                    }
                  </span>
                </h2>
                <div className='panel-modern p-6'>
                  <p className='font-inter text-zinc-300 leading-relaxed text-sm sm:text-base selection:bg-blue-500/30'>
                    {article.summary}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </>
  )
}

export default Summarize