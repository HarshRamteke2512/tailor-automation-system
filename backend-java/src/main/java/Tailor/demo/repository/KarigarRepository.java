package Tailor.demo.repository;

import Tailor.demo.entity.Karigar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KarigarRepository extends JpaRepository<Karigar, Long> {
    Karigar findByPhone(String phone);
}
