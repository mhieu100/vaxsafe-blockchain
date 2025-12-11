package com.dapp.backend.controller;

import com.dapp.backend.dto.ConsultationRequest;
import com.dapp.backend.service.RagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<String> ingest(@RequestBody List<String> contents) {
        ragService.addDocuments(contents);
        return ResponseEntity.ok("Ingested " + contents.size() + " documents.");
    }

    @GetMapping("/search")
    public ResponseEntity<List<String>> search(@RequestParam String query) {
        var docs = ragService.similaritySearch(query);
        var results = docs.stream().map(d -> d.getContent()).collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestParam String query) {
        String response = ragService.chat(query);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/summarize")
    public ResponseEntity<String> summarize(@RequestBody String content) {
        String summary = ragService.summarize(content);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/consult")
    public ResponseEntity<String> consult(@RequestBody ConsultationRequest request) {
        String response = ragService.consult(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync")
    public ResponseEntity<String> sync() {
        int count = ragService.syncVaccinesFromDatabase();
        return ResponseEntity.ok("Synced " + count + " vaccines from database to vector store.");
    }
}
