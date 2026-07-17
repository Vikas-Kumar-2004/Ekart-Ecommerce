import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const { user } = useSelector(store => store.user);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_URL}/api/v1/review/product/${productId}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to write a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/v1/review/add`,
        { productId, rating, comment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (res.data.success) {
        toast.success(res.data.message);
        setRating(0);
        setComment("");
        fetchReviews(); // Refresh the list
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await axios.delete(
        `${import.meta.env.VITE_URL}/api/v1/review/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleEditClick = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdate = async (id) => {
    if (editRating === 0 || !editComment.trim()) {
      toast.error("Please provide rating and comment");
      return;
    }
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await axios.put(
        `${import.meta.env.VITE_URL}/api/v1/review/${id}`,
        { rating: editRating, comment: editComment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setEditingId(null);
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  return (
    <div className="mt-12 w-full">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">Customer Reviews</h2>
      
      {user && (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 shrink-0">Rating:</span>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 sm:w-7 sm:h-7 cursor-pointer shrink-0 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <Textarea
            placeholder="What did you like or dislike? What is this product used for?"
            className="mb-4 bg-white w-full"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800 capitalize">
                    {review.firstName} {review.lastName}
                  </h4>
                  {editingId !== review.id && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Edit & Delete Buttons - Only visible to owner or admin */}
                {user && (user.id === review.userId || user.role === 'admin') && (
                  <div className="flex gap-2">
                    {user.id === review.userId && editingId !== review.id && (
                      <button onClick={() => handleEditClick(review)} className="text-blue-500 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your review.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(review.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              {editingId === review.id ? (
                <div className="mt-4 bg-gray-50 p-4 rounded border">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 sm:w-6 sm:h-6 cursor-pointer shrink-0 ${editRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setEditRating(star)}
                      />
                    ))}
                  </div>
                  <Textarea
                    className="mb-3 bg-white w-full"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => handleUpdate(review.id)} className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="flex-1 sm:flex-none">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
