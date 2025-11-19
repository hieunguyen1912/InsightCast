package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.GenerateSummaryRequest;

public interface ArticleSummaryService {

    String generateSummary(GenerateSummaryRequest request);
}

