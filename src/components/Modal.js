const Modal = ({isOpen, children}) => {
    if(!isOpen) return null;

    return (
        <div>
            <div className="modal">
                <div className="modal-content">{children}</div>
            </div>
        </div>
    )
}

export default Modal;