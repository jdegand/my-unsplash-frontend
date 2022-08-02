import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Images = (props) => {
    const [images, setImages] = useState([]);

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    const { auth } = useAuth();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getImages = async () => {
            try {
                const response = await axiosPrivate.get('/images', {
                    signal: controller.signal
                });
    
                const imageDetails = response.data.sort(function(a,b){
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });
    
                isMounted && setImages(imageDetails);
            } catch (err) {
                console.error(err);
                navigate('/login', { state: { from: location }, replace: true });
            }
        }

        getImages();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, []) //images 

    //adding images to dependency array causes a lot of requests to the backend and a ton of 304s

    useEffect(()=> {

        const getImages = async () => {
            try {
                const response = await axiosPrivate.get('/images');
    
                const imageDetails = response.data.sort(function(a,b){
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });
    
                setImages(imageDetails);
            
            } catch (err) {
                console.error(err);
            }
        }

        getImages();

    }, [props.updateImages])

    const handleImageDelete = async(e,id) => {
        e.preventDefault()

        const response = await axiosPrivate.delete('/images', {data:JSON.stringify({id})}, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.accessToken}` },
            withCredentials: true
        })

        //need to refresh after a delete
        props.setUpdateImages(prev => !prev)
    }

    return (
        <div>
            {
                props.searchTerm && images?.length ?  (
                    <ul className="image-grid">
                        {images.filter(image => image.label.toLowerCase().includes(props.searchTerm)).map(image => <li key={image._id}>
                            <div className="image-item">
                                <img src={image.url} alt="" />
                                <div className="image-hover-content">
                                    <p>{image.label}</p>
                                </div>
                                <button className="image-delete-btn" type="button" onClick={(e)=>handleImageDelete(e,image._id)}>Delete</button>
                            </div>
                        </li>)}
                    </ul>
                ) : images?.length
                ? (
                    <ul className="image-grid">
                        {images.map(image => <li key={image._id}>
                            <div className="image-item">
                                <img src={image.url} alt="" />
                                <div className="image-hover-content">
                                    <p>{image.label}</p>
                                </div>
                                <button className="image-delete-btn" type="button" onClick={(e)=>handleImageDelete(e,image._id)}>Delete</button>
                            </div>
                        </li>)}
                    </ul>
                ) : <p>No images to display</p>
            }
        </div>
    );
};

export default Images;