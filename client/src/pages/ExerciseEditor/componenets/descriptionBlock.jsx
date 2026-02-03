import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const DescriptionBlock = ({ setDesc, startValue }) => {
    const { t } = useTranslation();

    const [lng, setLng] = useState("eng");
    const descriptionRef = useRef(null);
    const [descValue, setDescValue] = useState(startValue || { eng: "", est: "" });

    // Update descValue when startValue changes from parent
    useEffect(() => {
        if (startValue && (startValue.eng !== descValue.eng || startValue.est !== descValue.est)) {
            setDescValue(startValue);
            // Load content immediately when new data arrives
            if (descriptionRef.current) {
                const content = startValue[lng] || "";
                loadContent(content);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startValue]);

    // Load content when language changes
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
                    // Skip empty lines at the start of a part that comes after a code block
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

        // Ensure there's at least one paragraph
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

        // Create code block wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "code-block-wrapper";
        wrapper.contentEditable = "false";
        wrapper.setAttribute("data-block-id", blockId);

        // Create line numbers container
        const lineNumbers = document.createElement("div");
        lineNumbers.className = "code-block-line-numbers";

        // Create code content container
        const codeContent = document.createElement("textarea");
        codeContent.className = "code-block-content";
        codeContent.value = code;
        codeContent.spellcheck = false;

        // Update line numbers
        const updateLineNumbers = () => {
            const lines = codeContent.value.split("\n").length;
            lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
            syncScroll();
        };

        // Sync scroll between line numbers and content
        const syncScroll = () => {
            lineNumbers.scrollTop = codeContent.scrollTop;
        };

        // Handle Tab key
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

        // Add a paragraph after code block for continued editing
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

                // Don't add content from empty paragraphs right after code blocks
                const prevNode = index > 0 ? nodes[index - 1] : null;
                const isEmptyAfterCodeBlock = prevNode &&
                    prevNode.classList &&
                    prevNode.classList.contains("code-block-wrapper") &&
                    !text;

                if (!isEmptyAfterCodeBlock) {
                    result += text;
                }

                // Add newline if not the last element and not before a code block
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
        // Prevent editing inside code blocks
        if (e.target.closest(".code-block-wrapper")) {
            return;
        }
        saveContent();
    };

    const handlePaste = (e) => {
        e.preventDefault();

        // Get pasted text
        const text = e.clipboardData.getData('text/plain');
        if (!text) return;

        const container = descriptionRef.current;
        if (!container) return;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Delete any selected content first
        range.deleteContents();

        // Find the paragraph we're in
        let currentNode = range.startContainer;
        let currentP = currentNode.nodeType === Node.TEXT_NODE ? currentNode.parentNode : currentNode;

        while (currentP && currentP.tagName !== 'P' && currentP !== container) {
            currentP = currentP.parentNode;
        }

        if (!currentP || currentP === container) {
            // Not in a paragraph, create one
            currentP = document.createElement('p');
            currentP.innerHTML = '<br>';
            container.appendChild(currentP);
            range.selectNodeContents(currentP);
            range.collapse(true);
        }

        // Split pasted text by newlines
        const lines = text.split('\n');

        if (lines.length === 1) {
            // Single line - just insert as text
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
        } else {
            // Multiple lines - need to split into paragraphs

            // Get text before and after cursor in current paragraph
            const beforeRange = range.cloneRange();
            beforeRange.selectNodeContents(currentP);
            beforeRange.setEnd(range.startContainer, range.startOffset);
            const textBefore = beforeRange.toString();

            const afterRange = range.cloneRange();
            afterRange.selectNodeContents(currentP);
            afterRange.setStart(range.endContainer, range.endOffset);
            const textAfter = afterRange.toString();

            // Create paragraphs for pasted content
            const paragraphs = [];

            lines.forEach((line, index) => {
                const p = document.createElement('p');

                if (index === 0) {
                    // First line includes text before cursor
                    p.textContent = textBefore + line;
                } else if (index === lines.length - 1) {
                    // Last line includes text after cursor
                    p.textContent = line + textAfter;
                } else {
                    // Middle lines
                    p.textContent = line;
                }

                if (!p.textContent.trim()) {
                    p.innerHTML = '<br>';
                }

                paragraphs.push(p);
            });

            // Replace current paragraph with new ones
            paragraphs.forEach((p, index) => {
                if (index === 0) {
                    currentP.parentNode.replaceChild(p, currentP);
                } else {
                    paragraphs[0].parentNode.insertBefore(p, paragraphs[index - 1].nextSibling);
                }
            });

            // Set cursor at end of last paragraph
            const lastP = paragraphs[paragraphs.length - 1];
            const newRange = document.createRange();
            newRange.selectNodeContents(lastP);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }

        // Save content
        setTimeout(() => {
            saveContent();
        }, 0);
    };

    const handleCut = () => {
        // Save content after cut completes
        setTimeout(() => {
            saveContent();
        }, 0);
    };

    const addCodeBlock = () => {
        const container = descriptionRef.current;
        if (!container) return;

        const selection = window.getSelection();
        let insertPoint = null;

        // Try to insert at cursor position
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (container.contains(range.commonAncestorContainer)) {
                insertPoint = range.commonAncestorContainer;

                // Find the paragraph element
                while (insertPoint && insertPoint.tagName !== "P" && insertPoint !== container) {
                    insertPoint = insertPoint.parentNode;
                }
            }
        }

        // Create the code block
        const wrapper = insertCodeBlockElement();

        // Insert at the right position
        if (insertPoint && insertPoint.tagName === "P") {
            insertPoint.parentNode.insertBefore(wrapper, insertPoint.nextSibling);
        }

        // Focus the code block
        const textarea = wrapper.querySelector(".code-block-content");
        if (textarea) {
            textarea.focus();
        }

        saveContent();
    };

    const handleLanguageChange = (e) => {
        const newLng = e.target.value;
        // Save current language content before switching
        saveContent();
        // Small delay to ensure save completes before switching
        setTimeout(() => {
            setLng(newLng);
        }, 10);
    };

    return (
        <div className="exercise_editor_page-form-item">
            <div className="label-line">
                <div className="exercise_editor_page-form-item-label">{t("description")}</div>
                <button
                    className="add_code_block-btn"
                    onClick={addCodeBlock}
                    type="button"
                >
                    {t("add_code_block")}
                </button>
                <div className="exercise_editor_page-form-item-label label-break">
                    {t("desc_language")}
                </div>
                <select
                    className="exercise_editor_page-form-item-select desc-select"
                    value={lng}
                    onChange={handleLanguageChange}
                >
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
                onKeyUp={handleKeyDown}
                onPaste={handlePaste}
                onCut={handleCut}
            />
        </div>
    );
};

export default DescriptionBlock;