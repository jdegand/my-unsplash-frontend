import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import Images from "./Images";
import logo from '../my_unsplash_logo.svg';
import Modal from './Modal';
import ClickOutside from './ClickOutside';
import axios from '../api/axios';
import useAuth from "../hooks/useAuth";

const Home = () => {
    const navigate = useNavigate();
    const logout = useLogout();
    const [searchTerm, setSearchTerm] = useState('');
    const { auth } = useAuth();

    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');

    const [isOpen, setIsOpen] = useState(false);

    const [updateImages, setUpdateImages] = useState(false);

    useEffect(() => {
      const close = (e) => {
        if(e.keyCode === 27){
          setIsOpen(false)
        }
      }
        window.addEventListener('keydown', close)
        return () => window.removeEventListener('keydown', close)
    },[])
  
    const handleClose = () => {
      setIsOpen(false)
    }

    const signOut = async () => {
        await logout();
        navigate('/login');
    }
  
    const handleSearch = (e) => {
      setSearchTerm(e.target.value)
    }

    const handleLabel = (e) => {
        setLabel(e.target.value)
    }

    const handleUrl = (e) => {
        setUrl(e.target.value)
    }

    // this is really not necessary? - is it better to show filter results immediately vs make user submit for a result 

    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log(searchTerm)
        // pass searchTerm to images component to filter results
        setSearchTerm('');
    }

    const handleAddImage = async (e) => {
        e.preventDefault()

        // get auth.accessToken and create header authorization `Bearer ${auth.accessToken}`
        // Add the token to axios private?

        try {

            // unnecessary escape in the regex error 
            const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

            const validUrl = regex.test(url);

            if(validUrl){

            await axios.post('/images',
                JSON.stringify({ label, url }),  {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.accessToken}` },
                    withCredentials: true
                }
            );

            // (when I blocked duplicate urls) if image already uploaded, backend sends 409 but need to display something to user

            setLabel('')
            setUrl('')
            setUpdateImages(prev => !prev) // this will cause a re-run of useEffect in Images 

            //setIsOpen(false) and close the modal or not - images update -> don't need a image uploaded message ?
            } else {
                alert('Not valid URL')
            }
        } catch (err) {
            if (!err?.response) {
               console.log('Upload Failed')
            }
        }
    }

    return (
        <div className={isOpen ? 'overlay': ''}>
            <nav>
                <div className="flex wrap">
                    <img src={logo} alt="My Unsplash" />
                    <form onSubmit={handleSubmit}>
                        <div className="floatingGroup">
                        <input className="searchInput" id="search" maxLength={30} value={searchTerm} onChange={handleSearch} required />
                        <label className="floatingLabel" htmlFor="search">Search by name</label>
                        <button className="searchBtn" aria-label="Search" title="Search"><img src="/magnify.svg" alt="" width="24px" height="24px"/></button>
                        </div>
                    </form>
                </div>
                <div className="flex">
                    <div>
                        <button className="nav-btn" onClick={() => setIsOpen(prev => !prev)}>Add a Photo</button>
                    </div>
                    <div className="flex">
                        <button className="nav-btn log-out" onClick={signOut}>Log Out</button>
                    </div>  
                </div>
            </nav>
            <ClickOutside isOpen={isOpen} onClickOutside={handleClose}>
                <Modal isOpen={isOpen}>
                    <div>
                        <h1>Add a new photo</h1>
                        <form className="add-image-form" onSubmit={handleAddImage}>
                            <label htmlFor="label">Label</label>
                            <input id="label" className="modal-input" placeholder="Describe your Image" value={label} onChange={handleLabel} required />
                            <br />
                            <label htmlFor="url">Photo Url</label>
                            <input id="url" className="modal-input" type="text" placeholder="https://source.unsplash.com/random" value={url} onChange={handleUrl} required />
                            <div className="modal-btn-container">
                                <button className="cancel-btn" type="button" onClick={() => setIsOpen(prev => !prev)}>Cancel</button>
                                <button className="image-submit-btn" type="submit">Submit</button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </ClickOutside>
            <div>
                <Images searchTerm={searchTerm} updateImages={updateImages} setUpdateImages={setUpdateImages} />
            </div>
        </div>
    )
}

export default Home