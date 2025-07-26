import "./filemanager.css"
import { useRef } from "react"
import py_file_image from "../../pictures/py-file-icon.png"
import js_file_image from "../../pictures/js-file-icon.png"
import txt_file_image from "../../pictures/txt-file-icon.png"
import new_file_image from "../../pictures/plus.png"
import rename_file_image from "../../pictures/rename-icon.png"
import delete_file_image from "../../pictures/delete.png"

const FileManager = ({ fileList, setFile, username }) => {

    const filesDiv = useRef(null);

    const handleFileClick = (e, fileName) => {
        setFile(fileName)
        const files = filesDiv.current.querySelectorAll(".file_manager__file")
        files.forEach(file => file.classList.remove("active"));
        e.currentTarget.classList.toggle("active")
    }

    return (
        <div className="file-manager-wrap">
            <div className="file-manager__header">
                <div className="file-manager__header-username">{username} </div>
            </div>
            <div className="file-manager__files" ref={filesDiv}>
                {Object.keys(fileList).map(fileName => {
                    const ext = fileName.substring(fileName.lastIndexOf('.'));
                    const imgSrc = ext === ".py" ? py_file_image : ext === ".js" ? js_file_image : txt_file_image;

                    return (
                        <div key={fileName} onClick={(e) => handleFileClick(e, fileName)} className="file_manager__file">
                            <img src={imgSrc} alt={ext} />
                            <p>{fileName}</p>
                        </div>
                    );
                })}
            </div>

            <div className="file-manager__buttons">
                <div className="file-manager__btn new_file-btn"><img src={new_file_image} alt="" /></div>
                <div className="file-manager__btn rename_file-btn"><img src={rename_file_image} alt="" /></div>
                <div className="file-manager__btn delete_file-btn"><img src={delete_file_image} alt="" /></div>
            </div>
        </div>
    )
}

export default FileManager