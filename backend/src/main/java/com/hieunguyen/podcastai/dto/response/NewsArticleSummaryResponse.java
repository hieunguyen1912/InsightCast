package com.hieunguyen.podcastai.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NewsArticleSummaryResponse extends BaseNewsArticleResponse {

    private String categoryName;
    private String newsSourceName;
}
