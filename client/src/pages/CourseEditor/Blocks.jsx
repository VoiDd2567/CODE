import Editor from "../../components/Editor/Editor"
import align_right_img from "../../pictures/text-align-right.png"
import align_center_img from "../../pictures/text-align-center.png"
import align_left_img from "../../pictures/text-align-left.png"
import { useRef } from "react";
import "./blocks.css"
import { TextDecompile } from "./BlockDecompiler";

const TextBlock = ({ value, id, initializedBlocks, updateBlockValue, opened, setChosenBlock, index }) => {
    const courseSettings = useRef(null)

    return (
        <div className="course_editor-block-text-wrap">
            {opened && (
                <div ref={courseSettings} className="course_editor-text_block-settings">
                    <div className="course_editor-text_align_choices">
                        <div className="course_editor-text_align-choice"><img src={align_left_img} alt="" /></div>
                        <div className="course_editor-text_align-choice"><img src={align_center_img} alt="" /></div>
                        <div className="course_editor-text_align-choice" onClick={(e) => e.preventDefault()}><img src={align_right_img} alt="" /></div>
                    </div>
                </div>
            )
            }
            <p
                ref={(el) => {
                    if (el && (!initializedBlocks.current.has(id) || el.innerHTML === '')) {
                        el.innerHTML = TextDecompile(value);
                        initializedBlocks.current.add(id);
                    }
                }}
                className="course_editor-block-text"
                contentEditable={true}
                suppressContentEditableWarning={true}
                onInput={(e) => {
                    e.stopPropagation();
                    updateBlockValue(id, e.currentTarget.innerHTML);
                }}
                onBlur={(e) => {
                    e.stopPropagation();
                    updateBlockValue(id, e.currentTarget.innerHTML);
                }}
                onClick={() => { setChosenBlock(index) }}
            />
        </div>
    );
};

const EditorBlock = () => {
    return (<Editor w={"50"} h={"10"} />)
}

export { TextBlock, EditorBlock };
