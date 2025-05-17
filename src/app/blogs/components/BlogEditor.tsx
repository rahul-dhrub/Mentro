'use client';

import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface BlogEditorProps {
    content: string;
    setContent: (content: string) => void;
    editorSelection: { start: number, end: number } | null;
    setEditorSelection: (selection: { start: number, end: number } | null) => void;
    isUploading: boolean;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const BlogEditor: React.FC<BlogEditorProps> = ({
    content,
    setContent,
    editorSelection,
    setEditorSelection,
    isUploading,
    handleImageUpload
}) => {
    const [previewMode, setPreviewMode] = useState<boolean>(false);

    // Helper function to insert formatting around selected text or at cursor position
    const insertFormatting = (prefix: string, suffix: string = '') => {
        if (!editorSelection) return;
        
        const newContent = 
            content.substring(0, editorSelection.start) + 
            prefix + 
            content.substring(editorSelection.start, editorSelection.end) + 
            suffix + 
            content.substring(editorSelection.end);
        
        setContent(newContent);
    };

    // Helper functions for formatting buttons
    const addHeading = () => insertFormatting('## ', '\n');
    const addBold = () => insertFormatting('**', '**');
    const addItalic = () => insertFormatting('*', '*');
    const addLink = () => insertFormatting('[Link text](', ')');
    const addImage = () => insertFormatting('![Image description](', ')');
    const addCode = () => insertFormatting('`', '`');
    const addCodeBlock = () => insertFormatting('\n```\n', '\n```\n');
    const addList = () => insertFormatting('- ', '\n- \n- ');
    const addNumberedList = () => insertFormatting('1. ', '\n2. \n3. ');
    const addQuote = () => insertFormatting('> ', '\n');
    const addYoutubeVideo = () => {
        const videoId = prompt('Enter YouTube video ID (e.g., dQw4w9WgXcQ):');
        if (videoId) {
            insertFormatting(`[![YouTube Video](https://img.youtube.com/vi/${videoId}/0.jpg)](https://www.youtube.com/watch?v=${videoId})\n`);
        }
    };

    // Track text selection in the textarea
    const handleTextareaSelect = (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        setEditorSelection({
            start: target.selectionStart,
            end: target.selectionEnd
        });
    };

    return (
        <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-semibold text-gray-800 mb-1">
                Content
            </label>
            <div className="mb-2 flex space-x-2">
                <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 py-1 text-sm rounded-md ${!previewMode 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700'}`}
                >
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 py-1 text-sm rounded-md ${previewMode 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700'}`}
                >
                    Preview
                </button>
            </div>

            {!previewMode && (
                <div className="flex flex-wrap mb-2 bg-gray-100 p-2 rounded-md">
                    <button
                        type="button"
                        onClick={addHeading}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Add Heading"
                    >
                        <span className="font-bold">H</span>
                    </button>
                    <button
                        type="button"
                        onClick={addBold}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Bold"
                    >
                        <span className="font-bold">B</span>
                    </button>
                    <button
                        type="button"
                        onClick={addItalic}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200 italic"
                        title="Italic"
                    >
                        <span>I</span>
                    </button>
                    <button
                        type="button"
                        onClick={addLink}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Link"
                    >
                        <span className="underline">Link</span>
                    </button>
                    <button
                        type="button"
                        onClick={addImage}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Image URL"
                    >
                        <span>🖼️ URL</span>
                    </button>
                    <label 
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200 cursor-pointer inline-flex items-center"
                        title="Upload Image"
                    >
                        <span className="flex items-center">
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                <>📤 Upload Image</>
                            )}
                        </span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />
                    </label>
                    <button
                        type="button"
                        onClick={addList}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Bulleted List"
                    >
                        <span>• List</span>
                    </button>
                    <button
                        type="button"
                        onClick={addNumberedList}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Numbered List"
                    >
                        <span>1. List</span>
                    </button>
                    <button
                        type="button"
                        onClick={addCode}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Inline Code"
                    >
                        <span className="font-mono">Code</span>
                    </button>
                    <button
                        type="button"
                        onClick={addCodeBlock}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Code Block"
                    >
                        <span className="font-mono">{"{ }"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={addQuote}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="Quote"
                    >
                        <span>❝</span>
                    </button>
                    <button
                        type="button"
                        onClick={addYoutubeVideo}
                        className="bg-white text-gray-700 p-1 m-1 rounded hover:bg-gray-200"
                        title="YouTube Video"
                    >
                        <span>▶️</span>
                    </button>
                </div>
            )}

            <div data-color-mode="light">
                {previewMode ? (
                    <div 
                        className="markdown-preview p-4 border border-gray-400 rounded-md min-h-[200px] bg-white text-black"
                        dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(marked.parse(content) as string) 
                        }} 
                    />
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onSelect={handleTextareaSelect}
                        onKeyUp={handleTextareaSelect}
                        onMouseUp={handleTextareaSelect}
                        className="w-full px-3 py-2 border border-gray-400 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-mono"
                        placeholder="Write your blog content here using Markdown..."
                        rows={12}
                    />
                )}
            </div>
            <div className="mt-2 text-sm text-black">
                <p>Markdown supported:</p>
                <ul className="list-disc pl-5 mt-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 text-black">
                    <li>**Bold text**</li>
                    <li>*Italic text*</li>
                    <li># Headings</li>
                    <li>[Links](url)</li>
                    <li>![Images](url)</li>
                    <li>- Lists</li>
                    <li>1. Numbered lists</li>
                    <li>`Code blocks`</li>
                    <li>Youtube: `[![](thumbnail)](youtube-url)`</li>
                </ul>
            </div>
        </div>
    );
};

export default BlogEditor; 