import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import RoleBadge from "@/components/molecules/RoleBadge";
import ApperIcon from "@/components/ApperIcon";
import { communityService } from "@/services/api/communityService";

const CommunityPost = ({ post, className }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (!liked) {
        await communityService.likePost(post.Id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
        toast.success("게시글에 좋아요를 눌렀습니다!");
      }
    } catch (error) {
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {post.authorName?.[0] || "U"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {post.authorName}
                </h4>
                <RoleBadge role={post.authorRole} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {timeAgo}
              </p>
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ApperIcon name="MoreHorizontal" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
          {post.title}
        </h2>
        
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              loading={loading}
              className={`flex items-center gap-2 transition-colors ${
                liked 
                  ? "text-red-500 hover:text-red-600" 
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <ApperIcon 
                name={liked ? "Heart" : "Heart"} 
                className={`w-4 h-4 ${liked ? "fill-current" : ""}`} 
              />
              <span className="font-medium">{likeCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
              <ApperIcon name="MessageCircle" className="w-4 h-4" />
              <span className="font-medium">{post.comments || 0}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
              <ApperIcon name="Eye" className="w-4 h-4" />
              <span className="font-medium">{post.views || 0}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary-600">
              <ApperIcon name="Share2" className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary-600">
              <ApperIcon name="Bookmark" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default CommunityPost;