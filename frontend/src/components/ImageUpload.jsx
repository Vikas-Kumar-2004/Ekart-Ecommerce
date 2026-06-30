import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

const ImageUpload = ({ productData, setProductData }) => {
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length) {
      setProductData((prev) => ({
        ...prev,
        productImg: [...prev.productImg, ...files], // append images
      }))
    }
  }

  const removeImage = (index) => {
    setProductData((prev) => {
      const updatedImages = prev.productImg.filter((_, i) => i !== index);
      return { ...prev, productImg: updatedImages };
    });
  };


  return (
    <div className="grid gap-2">
      <Label>Product Images</Label>

      {/* Upload Button */}
      <Input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFiles}
      />
      <Button asChild variant="outline">
        <label htmlFor="file-upload" className="cursor-pointer">
          Upload Images
        </label>
      </Button>

      {/* Image Previews */}
      {productData.productImg.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
          {productData.productImg.map((file, idx) => {
            // Check if file is already a File (from input) or a DB object/string
            let preview
            if (file instanceof File) {
              preview = URL.createObjectURL(file)
            } else if (typeof file === "string") {
              preview = file
            } else if (file?.url) {
              preview = file.url
            } else {
              return null
            }

            return (
              <Card key={idx} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={preview}
                    alt={`preview-${idx}`}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  {/* Remove button */}
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default ImageUpload
