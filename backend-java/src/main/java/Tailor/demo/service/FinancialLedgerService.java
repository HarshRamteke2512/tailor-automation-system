package Tailor.demo.service;

import Tailor.demo.entity.FinancialLedger;
import Tailor.demo.repository.FinancialLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FinancialLedgerService {

    private final FinancialLedgerRepository financialLedgerRepository;

    @Autowired
    public FinancialLedgerService(FinancialLedgerRepository financialLedgerRepository) {
        this.financialLedgerRepository = financialLedgerRepository;
    }

    public List<FinancialLedger> getAllTransactions() {
        return financialLedgerRepository.findAll();
    }

    public Optional<FinancialLedger> getTransactionById(Long id) {
        return financialLedgerRepository.findById(id);
    }

    public FinancialLedger createTransaction(FinancialLedger transaction) {
        return financialLedgerRepository.save(transaction);
    }

    public FinancialLedger updateTransaction(Long id, FinancialLedger updatedTransaction) {
        return financialLedgerRepository.findById(id).map(existingTransaction -> {
            existingTransaction.setOrder(updatedTransaction.getOrder());
            existingTransaction.setTotalAmount(updatedTransaction.getTotalAmount());
            existingTransaction.setAdvancePaid(updatedTransaction.getAdvancePaid());
            existingTransaction.setPaymentMethod(updatedTransaction.getPaymentMethod());
            existingTransaction.setPaymentStatus(updatedTransaction.getPaymentStatus());
            return financialLedgerRepository.save(existingTransaction);
        }).orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
    }

    public void deleteTransaction(Long id) {
        if (!financialLedgerRepository.existsById(id)) {
            throw new RuntimeException("Transaction not found with id: " + id);
        }
        financialLedgerRepository.deleteById(id);
    }
}
