package Tailor.demo.controller;

import Tailor.demo.entity.Karigar;
import Tailor.demo.service.KarigarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/karigars")
public class KarigarController {

    @Autowired
    private KarigarService karigarService;

    @GetMapping
    public ResponseEntity<?> getAllKarigars() {
        try {
            List<Karigar> karigars = karigarService.getAllKarigars();
            return ResponseEntity.ok(karigars);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getKarigarById(@PathVariable Long id) {
        try {
            return karigarService.getKarigarById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createKarigar(@RequestBody Karigar karigar) {
        try {
            Karigar savedKarigar = karigarService.createKarigar(karigar);
            return ResponseEntity.ok(savedKarigar);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateKarigar(@PathVariable Long id, @RequestBody Karigar updatedKarigar) {
        try {
            Karigar karigar = karigarService.updateKarigar(id, updatedKarigar);
            return ResponseEntity.ok(karigar);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteKarigar(@PathVariable Long id) {
        try {
            karigarService.deleteKarigar(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
