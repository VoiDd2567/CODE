import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import q_yellow from "../../../pictures/yellow-quest-c.png"

const DescriptionBlock = ({ setDesc, startValue }) => {
    const { t } = useTranslation();

    const [lng, setLng] = useState("eng");
    const descriptionRef = useRef(null);
    const [descValue, setDescValue] = useState(startValue || { eng: "", est: "" });

    useEffect(() => {
        if (startValue && (startValue.eng !== descValue.eng || startValue.est !== descValue.est)) {
            setDescValue(startValue);
            if (descriptionRef.current) {
                const content = startValue[lng] || "";
                loadContent(content);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startValue]);

    useEffect(() => {
        if (descriptionRef.current) {
            const content = descValue[lng] || "";
            loadContent(content);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lng]);

    const loadContent = (content) => {
        const container = descriptionRef.current;
        if (!container) return;

        container.innerHTML = "";

        if (!content) {
            const p = document.createElement("p");
            p.innerHTML = "<br>";
            container.appendChild(p);
            return;
        }

        const parts = content.split(/(\[CODE_BLOCK\].*?\[\/CODE_BLOCK\])/s);

        parts.forEach((part, partIndex) => {
            if (part.startsWith("[CODE_BLOCK]") && part.endsWith("[/CODE_BLOCK]")) {
                const code = part.replace("[CODE_BLOCK]", "").replace("[/CODE_BLOCK]", "");
                insertCodeBlockElement(code, container);
            } else if (part) {
                const lines = part.split("\n");
                lines.forEach((line, lineIndex) => {
                    if (partIndex > 0 && lineIndex === 0 && !line && parts[partIndex - 1].startsWith("[CODE_BLOCK]")) {
                        return;
                    }

                    const p = document.createElement("p");
                    p.textContent = line;
                    if (!line) {
                        p.innerHTML = "<br>";
                    }
                    container.appendChild(p);
                });
            }
        });

        if (container.childNodes.length === 0) {
            const p = document.createElement("p");
            p.innerHTML = "<br>";
            container.appendChild(p);
        }
    };

    const insertCodeBlockElement = (code = "", container = null) => {
        const targetContainer = container || descriptionRef.current;
        if (!targetContainer) return;

        const blockId = `code-block-${Date.now()}-${Math.random()}`;

        const wrapper = document.createElement("div");
        wrapper.className = "code-block-wrapper";
        wrapper.contentEditable = "false";
        wrapper.setAttribute("data-block-id", blockId);

        const lineNumbers = document.createElement("div");
        lineNumbers.className = "code-block-line-numbers";

        const codeContent = document.createElement("textarea");
        codeContent.className = "code-block-content";
        codeContent.value = code;
        codeContent.spellcheck = false;

        const updateLineNumbers = () => {
            const lines = codeContent.value.split("\n").length;
            lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
            syncScroll();
        };

        const syncScroll = () => {
            lineNumbers.scrollTop = codeContent.scrollTop;
        };

        const handleTab = (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                const start = codeContent.selectionStart;
                const end = codeContent.selectionEnd;
                const value = codeContent.value;
                codeContent.value = value.substring(0, start) + "    " + value.substring(end);
                codeContent.selectionStart = codeContent.selectionEnd = start + 4;
                updateLineNumbers();
                saveContent();
            }
        };

        codeContent.addEventListener("input", () => {
            updateLineNumbers();
            saveContent();
        });
        codeContent.addEventListener("scroll", syncScroll);
        codeContent.addEventListener("keydown", handleTab);

        updateLineNumbers();

        wrapper.appendChild(lineNumbers);
        wrapper.appendChild(codeContent);
        targetContainer.appendChild(wrapper);

        if (!container) {
            const p = document.createElement("p");
            p.innerHTML = "<br>";
            targetContainer.appendChild(p);
        }

        return wrapper;
    };

    const saveContent = () => {
        const container = descriptionRef.current;
        if (!container) return;

        let result = "";
        const nodes = Array.from(container.childNodes);

        nodes.forEach((node, index) => {
            if (node.classList && node.classList.contains("code-block-wrapper")) {
                const textarea = node.querySelector(".code-block-content");
                if (textarea) {
                    result += `[CODE_BLOCK]${textarea.value}[/CODE_BLOCK]`;
                }
            } else if (node.tagName === "P") {
                const text = node.textContent;

                const prevNode = index > 0 ? nodes[index - 1] : null;
                const isEmptyAfterCodeBlock = prevNode &&
                    prevNode.classList &&
                    prevNode.classList.contains("code-block-wrapper") &&
                    !text;

                if (!isEmptyAfterCodeBlock) {
                    result += text;
                }

                const nextNode = index < nodes.length - 1 ? nodes[index + 1] : null;
                const isBeforeCodeBlock = nextNode &&
                    nextNode.classList &&
                    nextNode.classList.contains("code-block-wrapper");

                if (index < nodes.length - 1 && !isBeforeCodeBlock && !isEmptyAfterCodeBlock) {
                    result += "\n";
                }
            }
        });

        const updatedDescValue = {
            ...descValue,
            [lng]: result
        };

        setDescValue(updatedDescValue);
        setDesc(updatedDescValue);
    };

    const handleInput = () => {
        saveContent();
    };

    const handleKeyDown = (e) => {
        // Handle TAB - just insert 4 spaces using execCommand
        if (e.key === "Tab") {
            e.preventDefault();

            // Insert 4 spaces
            document.execCommand('insertText', false, '    ');

            return;
        }

        if (e.target.closest(".code-block-wrapper")) {
            return;
        }
    };

    const handleKeyUp = (e) => {
        if (e.target.closest(".code-block-wrapper")) {
            return;
        }
        saveContent();
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const text = e.clipboardData.getData('text/plain');
        if (!text) return;

        const container = descriptionRef.current;
        if (!container) return;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        range.deleteContents();

        let currentNode = range.startContainer;
        let currentP = currentNode.nodeType === Node.TEXT_NODE ? currentNode.parentNode : currentNode;

        while (currentP && currentP.tagName !== 'P' && currentP !== container) {
            currentP = currentP.parentNode;
        }

        if (!currentP || currentP === container) {
            currentP = document.createElement('p');
            currentP.innerHTML = '<br>';
            container.appendChild(currentP);
            range.selectNodeContents(currentP);
            range.collapse(true);
        }

        const lines = text.split('\n');

        if (lines.length === 1) {
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
        } else {
            const beforeRange = range.cloneRange();
            beforeRange.selectNodeContents(currentP);
            beforeRange.setEnd(range.startContainer, range.startOffset);
            const textBefore = beforeRange.toString();

            const afterRange = range.cloneRange();
            afterRange.selectNodeContents(currentP);
            afterRange.setStart(range.endContainer, range.endOffset);
            const textAfter = afterRange.toString();

            const paragraphs = [];

            lines.forEach((line, index) => {
                const p = document.createElement('p');

                if (index === 0) {
                    p.textContent = textBefore + line;
                } else if (index === lines.length - 1) {
                    p.textContent = line + textAfter;
                } else {
                    p.textContent = line;
                }

                if (!p.textContent.trim()) {
                    p.innerHTML = '<br>';
                }

                paragraphs.push(p);
            });

            paragraphs.forEach((p, index) => {
                if (index === 0) {
                    currentP.parentNode.replaceChild(p, currentP);
                } else {
                    paragraphs[0].parentNode.insertBefore(p, paragraphs[index - 1].nextSibling);
                }
            });

            const lastP = paragraphs[paragraphs.length - 1];
            const newRange = document.createRange();
            newRange.selectNodeContents(lastP);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }

        setTimeout(() => {
            saveContent();
        }, 0);
    };

    const handleCut = () => {
        setTimeout(() => {
            saveContent();
        }, 0);
    };

    const addCodeBlock = () => {
        const container = descriptionRef.current;
        if (!container) return;

        const selection = window.getSelection();
        let insertPoint = null;

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (container.contains(range.commonAncestorContainer)) {
                insertPoint = range.commonAncestorContainer;

                while (insertPoint && insertPoint.tagName !== "P" && insertPoint !== container) {
                    insertPoint = insertPoint.parentNode;
                }
            }
        }

        const wrapper = insertCodeBlockElement();

        if (insertPoint && insertPoint.tagName === "P") {
            insertPoint.parentNode.insertBefore(wrapper, insertPoint.nextSibling);
        }

        const textarea = wrapper.querySelector(".code-block-content");
        if (textarea) {
            textarea.focus();
        }

        saveContent();
    };

    const handleLanguageChange = (e) => {
        const newLng = e.target.value;
        saveContent();
        setTimeout(() => {
            setLng(newLng);
        }, 10);
    };

    return (
        <div className="exercise_editor_page-form-item">
            <div className="label-line">
                <div className="name-line">
                    <div className="exercise_editor_page-form-item-label">{t("description")}</div>
                    <div className="question-img">
                        <img src={q_yellow} alt="" />
                        <div className="question-text" dangerouslySetInnerHTML={{ __html: t("description_expl") }}></div>
                    </div>
                </div>
                <button className="add_code_block-btn" onClick={addCodeBlock} type="button" >
                    {t("add_code_block")}
                </button>
                <div className="exercise_editor_page-form-item-label label-break">
                    {t("desc_language")}
                </div>
                <select className="exercise_editor_page-form-item-select desc-select" value={lng} onChange={handleLanguageChange}  >
                    <option value="est">Est</option>
                    <option value="eng">Eng</option>
                </select>
            </div>
            <div
                ref={descriptionRef}
                className="exercise_editor_page-form-item-description"
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onPaste={handlePaste}
                onCut={handleCut}
            />
        </div>
    );
};

export default DescriptionBlock;