import Editor from "../../components/Editor/Editor"
import align_right_img from "../../pictures/text-align-right.png"
import align_center_img from "../../pictures/text-align-center.png"
import align_left_img from "../../pictures/text-align-left.png"

const TextBlock = ({ value, id, initializedBlocks, updateBlockValue, opened }) => {
    return (
        <div>
            <div className="course_editor-text_align_choices-wrap" style={{ display: opened ? "flex" : "none" }}>
                <div className="course_editor-text_align_choices">
                    <div className="course_editor-text_align-choice"><img src={align_left_img} alt="" /></div>
                    <div className="course_editor-text_align-choice"><img src={align_center_img} alt="" /></div>
                    <div className="course_editor-text_align-choice" onClick={(e) => e.preventDefault()}><img src={align_right_img} alt="" /></div>
                </div>
            </div>
            <p
                ref={(el) => {
                    if (el && (!initializedBlocks.current.has(id) || el.textContent === '')) {
                        el.textContent = value;
                        initializedBlocks.current.add(id);
                    }
                }}
                className="course_editor-block-text"
                contentEditable={true}
                suppressContentEditableWarning={true}
                onInput={(e) => {
                    e.stopPropagation();
                    updateBlockValue(id, e.currentTarget.textContent);
                }}
                onBlur={(e) => {
                    e.stopPropagation();
                    updateBlockValue(id, e.currentTarget.textContent);
                }}
            />
        </div>
    );
};

const EditorBlock = () => {
    return (<Editor w={"50"} h={"10"} />)
}

export { TextBlock, EditorBlock };
