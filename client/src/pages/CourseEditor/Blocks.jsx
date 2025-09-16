import Editor from "../../components/Editor/Editor"
import align_right_img from "../../pictures/text-align-right.png"
import align_center_img from "../../pictures/text-align-center.png"
import align_left_img from "../../pictures/text-align-left.png"
import { useRef, useEffect } from "react";
import "./blocks.css"
import { TextDecompile } from "./BlockDecompiler";

const TextBlock = ({ value, id, initializedBlocks, updateBlockValue, opened, setChosenBlock, index, onTextSelection }) => {
    const courseSettings = useRef(null);
    const textBlockRef = useRef(null);

    useEffect(() => {
        const handleMouseUp = () => {
            setTimeout(() => {
                const selection = window.getSelection();

                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const selectedText = selection.toString();

                    if (textBlockRef.current && textBlockRef.current.contains(range.commonAncestorContainer)) {
                        if (selectedText.trim().length > 0) {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = textBlockRef.current.innerHTML;

                            const fullRange = document.createRange();
                            fullRange.selectNodeContents(textBlockRef.current);

                            const beforeRange = document.createRange();
                            beforeRange.setStart(fullRange.startContainer, fullRange.startOffset);
                            beforeRange.setEnd(range.startContainer, range.startOffset);

                            const afterRange = document.createRange();
                            afterRange.setStart(range.endContainer, range.endOffset);
                            afterRange.setEnd(fullRange.endContainer, fullRange.endOffset);

                            const selectionInfo = {
                                blockId: id,
                                selectedText: selectedText,
                                beforeHTML: getHTMLFromRange(beforeRange),
                                afterHTML: getHTMLFromRange(afterRange),
                                range: range.cloneRange(),
                                beforeText: textBlockRef.current.textContent.substring(0, getAbsoluteOffset(range.startContainer, range.startOffset)),
                                afterText: textBlockRef.current.textContent.substring(getAbsoluteOffset(range.endContainer, range.endOffset))
                            };

                            if (onTextSelection) {
                                const rect = range.getBoundingClientRect();
                                selectionInfo.selectionRect = {
                                    x: rect.left - (rect.width),
                                    y: rect.top + window.scrollY - 45,
                                    width: rect.width,
                                    height: rect.height,
                                    rawRect: rect
                                };

                                onTextSelection(selectionInfo);
                            }
                        }
                    }
                }
            }, 10);
        };

        const getHTMLFromRange = (range) => {
            const contents = range.cloneContents();
            const div = document.createElement('div');
            div.appendChild(contents);
            return div.innerHTML;
        };

        const getAbsoluteOffset = (container, offset) => {
            if (!textBlockRef.current || !container) {
                return 0;
            }

            let absoluteOffset = 0;
            const walker = document.createTreeWalker(
                textBlockRef.current,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let currentNode;
            while ((currentNode = walker.nextNode()) !== null) {
                if (currentNode === container) {
                    return absoluteOffset + offset;
                }
                absoluteOffset += currentNode.textContent.length;
            }
            return absoluteOffset;
        };

        if (textBlockRef.current) {
            textBlockRef.current.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if (textBlockRef.current) {
                textBlockRef.current.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }, [id, onTextSelection]);


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
                    textBlockRef.current = el;
                    if (el) {
                        const newHTML = TextDecompile(value);
                        if (el.innerHTML !== newHTML) {
                            el.innerHTML = newHTML;
                        }
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
