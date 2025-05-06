import { Reply } from "@/types";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { FC } from "react";

interface ReplyProps {
    reply: Reply;
    onLike: (id: string) => void;
    onDislike: (id: string) => void;
}

export const ReplyContainer: FC<ReplyProps> = ({ reply, onLike, onDislike }) => {
  console.log(reply);
  return (
    <li className="border-l-2 border-gray-200 pl-4">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{reply.user.name}</span>
        <span className="text-sm text-gray-500">
          {new Date(reply.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700 mt-1">{reply.body}</p>
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={() => onLike(reply.id)}
          className={`flex items-center gap-1  hover:text-blue-500 ${reply.reaction ? 'text-blue-500': 'text-gray-500'}`}
        >
          <ThumbsUp size={16} />
          <span>{reply.likes}</span>
        </button>
        <button
          onClick={() => onDislike(reply.id)}
          className={`flex items-center gap-1 hover:text-red-500 ${reply.reaction === false ? 'text-red-500': 'text-gray-500'}`}
        >
          <ThumbsDown size={16} />
          <span>{reply.dislikes}</span>
        </button>
      </div>
    </li>
  );
}