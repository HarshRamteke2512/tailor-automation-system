package Tailor.demo.repository;

import Tailor.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // We will use this later to calculate the total est_hours for a specific week/date!
    List<Order> findByDeliveryDate(LocalDate deliveryDate);
}