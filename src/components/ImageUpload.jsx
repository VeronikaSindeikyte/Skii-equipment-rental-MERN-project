import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const ImageUpload = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Only JPG and PNG files are allowed.");
            return;
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (selectedFile.size > maxSize) {
            setError("File size must be less than 2MB.");
            return;
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        handleUpload(selectedFile);
        setError(null);
    };

    const handleUpload = async (selectedFile) => {
        if (!selectedFile) {
            setError("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", "egzamino-projektas");  // Replace with your upload preset

        try {
            setUploading(true);
            setError(null);

            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dgf88vag3/image/upload",  // Replace with your cloud name
                formData
            );

            if (response.data.secure_url) {
                onUpload(response.data.secure_url);
                setFile(null);
                setPreview(null);
            } else {
                setError("Unexpected server response.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            if (err.response) {
                setError(err.response.data.error || "Failed to upload image.");
            } else if (err.request) {
                setError("No response from the server. Please try again.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="image-upload">
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                disabled={uploading}
            />
            {preview && (
                <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ width: 200, marginTop: '10px' }} 
                />
            )}
            {uploading && <p>Uploading...</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

ImageUpload.propTypes = {
    onUpload: PropTypes.func.isRequired,
};

export default ImageUpload;