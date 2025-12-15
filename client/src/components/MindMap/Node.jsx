
import { useState, useEffect, useRef } from 'react';

const Node = ({ data, onUpdate, onAddChild, onMouseDown, onMouseUp, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(data.content);
    const [showHandles, setShowHandles] = useState(false);
    const nodeRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content, isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (content !== data.content) {
            onUpdate({ ...data, content });
        }
    };

    const handleAdd = (e, direction) => {
        e.stopPropagation();
        onAddChild(data.id, direction);
    };

    return (
        <div
            ref={nodeRef}
            className="node-element"
            style={{
                left: data.x,
                top: data.y,
                position: 'absolute',
                padding: '10px 18px',
                backgroundColor: data.style?.backgroundColor || '#ffffff',
                color: data.style?.color || '#333',
                fontSize: data.style?.fontSize ? `${data.style.fontSize}px` : '16px',
                borderRadius: '20px', // Pill shape
                boxShadow: selected ? '0 0 0 2px #007bff, 0 4px 15px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.08)',
                cursor: isEditing ? 'text' : 'move',
                minWidth: '50px',
                maxWidth: '300px',
                width: 'max-content',
                border: `2px solid ${data.style?.borderColor || 'transparent'}`,
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                zIndex: selected ? 100 : 10
            }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
        >
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onBlur={handleBlur}
                    autoFocus
                    rows={1}
                    style={{
                        width: '100%',
                        minWidth: '50px',
                        border: 'none',
                        resize: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        color: 'inherit',
                        overflow: 'hidden',
                        textAlign: 'center'
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleBlur();
                        }
                    }}
                />
            ) : (
                <div style={{ pointerEvents: 'none', textAlign: 'center' }}>{content}</div>
            )}

            {/* Add Child Handles */}
            {showHandles && !isEditing && (
                <>
                    <button className="node-handle handle-right" onClick={(e) => handleAdd(e, 'right')} title="Add Right">+</button>
                    <button className="node-handle handle-left" onClick={(e) => handleAdd(e, 'left')} title="Add Left">+</button>
                    <button className="node-handle handle-bottom" onClick={(e) => handleAdd(e, 'bottom')} title="Add Bottom">+</button>
                    <button className="node-handle handle-top" onClick={(e) => handleAdd(e, 'top')} title="Add Top">+</button>
                </>
            )}
        </div>
    );
};

export default Node;
