import { useTranslation } from "react-i18next";
import plus_img from "../../pictures/plus.png"
import copy_img from "../../pictures/copy.png"
import paste_img from "../../pictures/paste.png"
import bin_img from "../../pictures/bin.png"
import add_text_img from "../../pictures/add_text_icon.png"
import add_exercise_img from "../../pictures/add_exercise_icon.png"
import add_code_img from "../../pictures/add_code_icon.png"
import add_image_img from "../../pictures/add_image_icon.png"
import "./hoveringMenu.css"

const CourseEditorMenu = ({ chooseMenu, coursorPos, isMenuVisible, addTextBlock, addCodeBlock, addExerciseBlock, addImageBlock }) => {

    const { t } = useTranslation();
    return (
        <div ref={chooseMenu} className="choose_menu" style={{
            top: coursorPos.y,
            left: coursorPos.x,
            display: isMenuVisible ? "flex" : "none",
        }}>
            <div className="choose_menu-block_btn" title="Insert">
                <img src={plus_img} alt="" />
                <div className="choose_menu-block_btn-insert_choise_wrap">
                    <div onClick={addTextBlock} className="choose_menu-block_btn-insert-choise"><img src={add_text_img} alt="Txt" title={t("add_text")} /></div>
                    <div onClick={addCodeBlock} className="choose_menu-block_btn-insert-choise"><img src={add_exercise_img} alt="Exercise" title={t("add_exercise")} /></div>
                    <div onClick={addExerciseBlock} className="choose_menu-block_btn-insert-choise"><img src={add_code_img} alt="Code" title={t("add_code")} /></div>
                    <div onClick={addImageBlock} className="choose_menu-block_btn-insert-choise"><img src={add_image_img} alt="Img" title={t("add_img")} /></div>
                </div>
            </div>
            <div className="choose_menu-block_btn" title="Copy"><img src={copy_img} alt="" /></div>
            <div className="choose_menu-block_btn" title="Paste"><img src={paste_img} alt="" /></div>
            <div className="choose_menu-block_btn" title="Delete"><img src={bin_img} alt="" /></div>
        </div>
    )
}

export default CourseEditorMenu;