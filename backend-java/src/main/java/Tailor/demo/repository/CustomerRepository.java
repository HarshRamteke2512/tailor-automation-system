package Tailor.demo.repository;

import Tailor.demo.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Spring gives you basic CRUD methods for free!
    // Example custom search: Find a customer by their exact phone number
    Customer findByPhone(String phone);
}
