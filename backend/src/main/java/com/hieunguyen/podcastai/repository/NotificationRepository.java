package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.Notification;
import com.hieunguyen.podcastai.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    long countByUserAndIsReadFalse(User user);

    Optional<Notification> findByIdAndUser(long id, User user);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.updatedAt = :now " +
            "WHERE n.user = :user AND n.id = :id ")
    int markAsRead(@Param("id") Long notificationId, @Param("user") User user, @Param("now") Instant now);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.updatedAt = :now WHERE n.user = :user AND n.isRead = false")
    int markAllAsRead(@Param("user") User user, @Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user = :user AND n.isRead = true")
    void deleteAllReadNotifications(@Param("user") User user);
}
