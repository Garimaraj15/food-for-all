import { useState } from "react";

interface ProfilePictureUploadProps {
  userId: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ userId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL; // ✅ Use API_URL from .env.local

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // ✅ Show local preview before upload
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/user/profile_picture`, { // ✅ Use dynamic API URL
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const profilePicUrl = `${API_URL}${data.file_path}`; // ✅ Use correct file path
        setPreview(profilePicUrl); // ✅ Update preview with uploaded image
        alert("Profile picture uploaded successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload profile picture.");
    }
    setUploading(false);
  };

  return (
    <div className="p-4 border rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-2">Upload Profile Picture</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <img src={preview} alt="Preview" className="mt-2 w-32 h-32 rounded-full object-cover" />
      )}
      <button
        onClick={handleUpload}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default ProfilePictureUpload;
