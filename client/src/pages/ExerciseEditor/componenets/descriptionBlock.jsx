import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createRoot } from "react-dom/client";
import Editor from "../../../components/Editor/Editor";

const DescriptionBlock = () => {
    const { t } = useTranslation();
    const exDescription = useRef(null);
    const [descValue, setDescValue] = useState("")
    const [editorsValue, setEditorsValue] = useState({});

    useEffect(() => {
        const el = exDescription.current;
        if (!el) return;

        const cleanup = resizeInput(el);
        return cleanup;
    }, []);

    useEffect(() => { console.log(descValue) }, [descValue])

    // Update descValue whenever content changes
    useEffect(() => {
        const el = exDescription.current;
        if (!el) return;

        const updateDescValue = () => {
            saveDescriptionValue();
        };

        el.addEventListener("input", updateDescValue);

        return () => {
            el.removeEventListener("input", updateDescValue);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editorsValue]);

    const saveDescriptionValue = () => {
        const editor = exDescription.current;
        if (!editor) return;

        let combinedValue = '';

        const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains('inserted-code-block')) {
                    const blockId = node.getAttribute('data-block-id');
                    if (blockId && editorsValue[blockId] !== undefined) {
                        return `<<<code-block>>>${editorsValue[blockId]}<<</code-block>>>`;
                    }
                    return '';
                }

                if (node.tagName === 'BR') {
                    return '\n';
                }

                if (node.tagName === 'DIV') {
                    let content = '';
                    for (let child of node.childNodes) {
                        content += processNode(child);
                    }
                    // Add newline after div if it has content
                    return content + (content ? '\n' : '');
                }

                // Process other elements recursively
                let content = '';
                for (let child of node.childNodes) {
                    content += processNode(child);
                }
                return content;
            }

            return '';
        };

        for (let child of editor.childNodes) {
            combinedValue += processNode(child);
        }

        // Clean up extra newlines at the end
        combinedValue = combinedValue.replace(/\n+$/, '');

        setDescValue(combinedValue);
    };

    const resizeInput = (el) => {
        if (!el) return () => { };

        const resize = () => {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        };

        const observer = new MutationObserver(() => {
            resize();
        });

        observer.observe(el, {
            childList: true,
            subtree: true,
            characterData: true
        });

        el.addEventListener("input", resize);
        resize();

        return () => {
            el.removeEventListener("input", resize);
            observer.disconnect();
        };
    }

    const addNewEditor = (blockId) => {
        setEditorsValue(prev => ({
            ...prev,
            [blockId]: ''
        }));
    };

    const updateEditorValue = (blockId, value) => {
        setEditorsValue(prev => {
            const updated = {
                ...prev,
                [blockId]: value
            };
            // Trigger save after editor value updates
            setTimeout(() => saveDescriptionValue(), 0);
            return updated;
        });
    };

    const calculateEditorHeight = (value = '') => {
        const lineCount = (value.match(/\n/g) || []).length + 1;
        const lineHeight = 2.5;
        return lineCount * lineHeight;
    };

    const insertCodeBlock = () => {
        const editor = exDescription.current;
        if (!editor) return;

        const blockId = `code-block-${Date.now()}-${Math.random()}`;

        addNewEditor(blockId);

        const codeBlockWrapper = document.createElement('div');
        codeBlockWrapper.className = 'inserted-code-block';
        codeBlockWrapper.contentEditable = 'false';
        codeBlockWrapper.setAttribute('data-block-id', blockId);

        const reactContainer = document.createElement('div');
        codeBlockWrapper.appendChild(reactContainer);

        const selection = window.getSelection();
        let insertAtCursor = false;

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer;

            const isInsideCodeBlock = (node) => {
                let current = node;
                while (current && current !== editor) {
                    if (current.classList && current.classList.contains('inserted-code-block')) {
                        return true;
                    }
                    current = current.parentNode;
                }
                return false;
            };

            if (editor.contains(commonAncestor) && !isInsideCodeBlock(commonAncestor)) {
                insertAtCursor = true;
                range.deleteContents();
                range.insertNode(codeBlockWrapper);

                const br = document.createElement('div');
                br.innerHTML = '<br>';
                range.collapse(false);
                range.insertNode(br);

                range.setStartAfter(br);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        if (!insertAtCursor) {
            editor.appendChild(codeBlockWrapper);
            const br = document.createElement('div');
            br.innerHTML = '<br>';
            editor.appendChild(br);
        }

        const root = createRoot(reactContainer);
        root.render(
            <Editor
                h={calculateEditorHeight()}
                w={50}
                fixedHeight={false}
                getValue={(value) => updateEditorValue(blockId, value)}
            />
        );

        editor.focus();

        // Save after inserting code block
        setTimeout(() => saveDescriptionValue(), 0);
    }

    return (
        <div className="exercise_editor_page-form-item">
            <div className="label-line">
                <div className="exercise_editor_page-form-item-label">{t("description")}</div>
                <button
                    className="add_code_block-btn"
                    onClick={insertCodeBlock}
                    type="button"
                >
                    {t("add_code_block")}
                </button>
            </div>
            <div
                ref={exDescription}
                className="exercise_editor_page-form-item-desciption"
                contentEditable
                suppressContentEditableWarning
            />
        </div>
    )
}

export default DescriptionBlock;