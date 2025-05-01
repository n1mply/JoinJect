import { useState, useRef, useCallback } from 'react';

export default function DragNDropAvatar({}){
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
  
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
  
    const validateFile = (file) => {
      if (!validExtensions.includes(file.type)) {
        setError('Please upload only images (PNG, JPEG, JPG)');
        return false;
      }
      setError(null);
      return true;
    };
  
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    };
  
    const handleDragOver = useCallback((e) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);
  
    const handleDragLeave = useCallback((e) => {
      e.preventDefault();
      setIsDragging(false);
    }, []);
  
    const handleDrop = useCallback((e) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }, []);
  
    const handleButtonClick = () => {
      setError(null); // Сбрасываем ошибку при новом выборе
      fileInputRef.current.click();
    };
    return (
        <>
            <p className="edit-avatar">Upload the avatar</p>
            {error && (
              <div className="error-block">
                <div className="error-message">{error}</div>
              </div>
            )}
            <div
              className={`file-drop-area ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="file-input"
              accept="image/png, image/jpeg, image/jpg"
            />
                <div className="file-drop-content">
                  {file ? (
                    <>
                      <p className="file-name">{file.name}</p>
                      <p className="file-hint">Click or drag to change</p>
                    </>
                  ) : (
                    <>
                      <svg className="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="var(--color-primary)"/>
                      </svg>
                      <p className="file-hint">Drag & drop your image here or click to browse</p>
                      <p className="file-requirements">PNG, JPEG up to 5MB</p>
                    </>
                  )}
                </div>
            </div>
        </>
    )
}