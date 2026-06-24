package Tailor.demo.controller;

import Tailor.demo.entity.FinancialLedger;
import Tailor.demo.service.FinancialLedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial-ledger")
public class FinancialLedgerController {

    @Autowired
    private FinancialLedgerService financialLedgerService;

    @GetMapping
    public ResponseEntity<?> getAllTransactions() {
        try {
            List<FinancialLedger> transactions = financialLedgerService.getAllTransactions();
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        try {
            return financialLedgerService.getTransactionById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody FinancialLedger transaction) {
        try {
            FinancialLedger savedTransaction = financialLedgerService.createTransaction(transaction);
            return ResponseEntity.ok(savedTransaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody FinancialLedger updatedTransaction) {
        try {
            FinancialLedger transaction = financialLedgerService.updateTransaction(id, updatedTransaction);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        try {
            financialLedgerService.deleteTransaction(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
