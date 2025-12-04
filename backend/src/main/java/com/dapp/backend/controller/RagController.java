package com.dapp.backend.controller;

import com.dapp.backend.service.RagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final RagService ragService;

    @Autowired
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
}
