import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import CommunityPost from "@/components/organisms/CommunityPost";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { useAuth } from "@/hooks/useAuth";
import { communityService } from "@/services/api/communityService";

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const popularTags = [
    { value: "all", label: "전체" },
    { value: "수익화", label: "수익화" },
    { value: "강점찾기", label: "강점찾기" },
    { value: "글쓰기팁", label: "글쓰기팁" },
    { value: "성공사례", label: "성공사례" },
    { value: "질문", label: "질문" }
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, selectedTag]);

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await communityService.getAll();
      setPosts(data);
    } catch (err) {
      setError("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tag filter
    if (selectedTag !== "all") {
      filtered = filtered.filter(post => 
        post.tags && post.tags.includes(selectedTag)
      );
    }

    setFilteredPosts(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleNewPost = () => {
    toast.info("글쓰기 기능은 곧 출시됩니다!");
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPosts} />;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              커뮤니티
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              동료들과 경험을 나누고 함께 성장해요
            </p>
          </div>
          <Button
            onClick={handleNewPost}
            leftIcon="Plus"
            className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700"
          >
            글쓰기
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="제목, 내용, 작성자로 검색..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {popularTags.map(tag => (
              <button
                key={tag.value}
                onClick={() => setSelectedTag(tag.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedTag === tag.value
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {posts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">전체 게시글</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {posts.reduce((sum, post) => sum + (post.likes || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">총 좋아요</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {new Set(posts.map(post => post.authorId)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">활성 멤버</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
              {posts.reduce((sum, post) => sum + (post.comments || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">총 댓글</div>
          </div>
        </div>
      </motion.div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Empty
          title="게시글이 없습니다"
          description="첫 번째 게시글을 작성해보세요!"
          icon="MessageSquare"
          actionLabel="글쓰기"
          onAction={handleNewPost}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <CommunityPost post={post} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Community Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <ApperIcon name="Heart" className="w-8 h-8 text-red-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              커뮤니티 가이드라인
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ApperIcon name="Check" className="w-5 h-5 text-green-500" />
                권장사항
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• 구체적인 경험과 사례 공유</li>
                <li>• 건설적이고 도움이 되는 피드백</li>
                <li>• 질문에 대한 친절한 답변</li>
                <li>• 서로의 성장을 응원하는 마음</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ApperIcon name="X" className="w-5 h-5 text-red-500" />
                금지사항
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• 스팸성 광고 및 홍보글</li>
                <li>• 타인에 대한 비방이나 욕설</li>
                <li>• 저작권 침해 콘텐츠</li>
                <li>• 정치적, 종교적 논쟁 유발</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Community;