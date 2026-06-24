package Tailor.demo.repository;

import Tailor.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByDeliveryDate(LocalDate deliveryDate);

    // ✅ NEW: needed by generateUniqueToken() to check uniqueness
    Optional<Order> findByToken(String token);
}
