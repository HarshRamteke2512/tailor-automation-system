package Tailor.demo.service;

import Tailor.demo.entity.Karigar;
import Tailor.demo.repository.KarigarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KarigarService {

    private final KarigarRepository karigarRepository;

    @Autowired
    public KarigarService(KarigarRepository karigarRepository) {
        this.karigarRepository = karigarRepository;
    }

    public List<Karigar> getAllKarigars() {
        return karigarRepository.findAll();
    }

    public Optional<Karigar> getKarigarById(Long id) {
        return karigarRepository.findById(id);
    }

    public Karigar createKarigar(Karigar karigar) {
        return karigarRepository.save(karigar);
    }

    public Karigar updateKarigar(Long id, Karigar updatedKarigar) {
        return karigarRepository.findById(id).map(existingKarigar -> {
            existingKarigar.setName(updatedKarigar.getName());
            existingKarigar.setPhone(updatedKarigar.getPhone());
            existingKarigar.setSpecialization(updatedKarigar.getSpecialization());
            existingKarigar.setStatus(updatedKarigar.getStatus());
            return karigarRepository.save(existingKarigar);
        }).orElseThrow(() -> new RuntimeException("Karigar not found with id: " + id));
    }

    public void deleteKarigar(Long id) {
        if (!karigarRepository.existsById(id)) {
            throw new RuntimeException("Karigar not found with id: " + id);
        }
        karigarRepository.deleteById(id);
    }
}
