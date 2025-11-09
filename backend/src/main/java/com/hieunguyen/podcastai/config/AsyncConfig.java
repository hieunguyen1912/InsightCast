package com.hieunguyen.podcastai.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Configuration for asynchronous processing
 * Enables @Async annotation and configures thread pool for background tasks
 */
@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig {

    @Value("${async.executor.core-pool-size:5}")
    private int corePoolSize;

    @Value("${async.executor.max-pool-size:10}")
    private int maxPoolSize;

    @Value("${async.executor.queue-capacity:100}")
    private int queueCapacity;

    @Value("${async.executor.thread-name-prefix:tts-async-}")
    private String threadNamePrefix;

    /**
     * Thread pool executor for TTS audio generation tasks
     * 
     * @return Executor bean for async processing
     */
    @Bean(name = "ttsTaskExecutor")
    public Executor ttsTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Số thread tối thiểu luôn chạy
        executor.setCorePoolSize(corePoolSize);
        
        // Số thread tối đa có thể tạo
        executor.setMaxPoolSize(maxPoolSize);
        
        // Số lượng task có thể chờ trong queue
        executor.setQueueCapacity(queueCapacity);
        
        // Tên prefix cho thread (dễ debug)
        executor.setThreadNamePrefix(threadNamePrefix);
        
        // Rejection policy: khi queue đầy, sẽ throw exception
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // Đợi tất cả task hoàn thành khi shutdown
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        
        log.info("Async Task Executor configured: core={}, max={}, queue={}", 
                corePoolSize, maxPoolSize, queueCapacity);
        
        return executor;
    }

    /**
     * General purpose async executor for other background tasks
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        
        log.info("General Task Executor configured");
        return executor;
    }
}

