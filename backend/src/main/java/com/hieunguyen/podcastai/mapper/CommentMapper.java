package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.response.CommentResponse;
import com.hieunguyen.podcastai.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "repliesCount", source = "replies", qualifiedByName = "mapRepliesCount")
    @Mapping(target = "replies", ignore = true)
    CommentResponse toCommentResponse(Comment comment);

    List<CommentResponse> toCommentResponseList(List<Comment> comments);

    @Named("mapRepliesCount")
    default Long mapRepliesCount(List<Comment> replies) {
        if (replies == null) {
            return 0L;
        }
        return (long) replies.size();
    }
}
