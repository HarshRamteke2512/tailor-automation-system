package Tailor.demo.repository;

import Tailor.demo.entity.FinancialLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinancialLedgerRepository extends JpaRepository<FinancialLedger, Long> {
    // Ready to track payments!
}